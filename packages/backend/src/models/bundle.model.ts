/**
 * Bundle Model
 * 
 * P1 Feature: Volume pricing bundles for bulk report purchases
 * Database operations for bundles and credit transactions
 */

import { pool, query } from '../utils/database';
import { Bundle, CreditBalance, BundleSize } from '@autoenroll/common';
import { logger } from '../utils/logger';

/**
 * Create a new bundle purchase
 */
export async function createBundle(data: {
  userId: string;
  bundleSize: BundleSize;
  creditsTotal: number;
  pricePerReport: number;
  totalPaid: number;
  stripePaymentIntentId: string;
  expiryDate?: Date;
}): Promise<Bundle> {
  const { userId, bundleSize, creditsTotal, pricePerReport, totalPaid, stripePaymentIntentId, expiryDate } = data;

  const query = `
    INSERT INTO bundles (
      user_id, bundle_size, credits_total, credits_remaining,
      price_per_report, total_paid, stripe_payment_intent_id, expiry_date
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *
  `;

  const values = [userId, bundleSize, creditsTotal, creditsTotal, pricePerReport, totalPaid, stripePaymentIntentId, expiryDate];

  const result = await pool.query(query, values);
  const bundle = mapRowToBundle(result.rows[0]);

  // Record purchase transaction
  await recordTransaction({
    userId,
    bundleId: bundle.id,
    transactionType: 'PURCHASE',
    credits: creditsTotal,
    balanceAfter: await getUserCreditBalance(userId),
    description: `Purchased ${bundleSize}-pack bundle`,
  });

  logger.info('Bundle created', { bundleId: bundle.id, userId, bundleSize });
  return bundle;
}

/**
 * Get bundle by ID
 */
export async function getBundleById(bundleId: string): Promise<Bundle | null> {
  const query = 'SELECT * FROM bundles WHERE id = $1';
  const result = await pool.query(query, [bundleId]);
  
  if (result.rows.length === 0) {
    return null;
  }
  
  return mapRowToBundle(result.rows[0]);
}

/**
 * Get all bundles for a user
 */
export async function getUserBundles(userId: string, activeOnly: boolean = false): Promise<Bundle[]> {
  let query = 'SELECT * FROM bundles WHERE user_id = $1';
  
  if (activeOnly) {
    query += " AND status = 'ACTIVE' AND credits_remaining > 0";
  }
  
  query += ' ORDER BY purchase_date DESC';
  
  const result = await pool.query(query, [userId]);
  return result.rows.map(mapRowToBundle);
}

/**
 * Use credits from a bundle (FIFO - oldest active bundle first)
 */
export async function useCredits(userId: string, creditsToUse: number, referenceId?: string): Promise<{
  success: boolean;
  bundlesUsed: Array<{ bundleId: string; creditsUsed: number }>;
  remainingBalance: number;
}> {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Get active bundles with credits (FIFO order)
    const bundlesQuery = `
      SELECT * FROM bundles
      WHERE user_id = $1
        AND status = 'ACTIVE'
        AND credits_remaining > 0
        AND (expiry_date IS NULL OR expiry_date > NOW())
      ORDER BY purchase_date ASC
      FOR UPDATE
    `;
    const bundlesResult = await client.query(bundlesQuery, [userId]);
    
    if (bundlesResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return { success: false, bundlesUsed: [], remainingBalance: 0 };
    }
    
    const totalAvailable = bundlesResult.rows.reduce((sum, b) => sum + b.credits_remaining, 0);
    
    if (totalAvailable < creditsToUse) {
      await client.query('ROLLBACK');
      return { success: false, bundlesUsed: [], remainingBalance: totalAvailable };
    }
    
    // Deduct credits from bundles (FIFO)
    const bundlesUsed: Array<{ bundleId: string; creditsUsed: number }> = [];
    let remainingToUse = creditsToUse;
    
    for (const bundleRow of bundlesResult.rows) {
      if (remainingToUse === 0) break;
      
      const availableInBundle = bundleRow.credits_remaining;
      const useFromThisBundle = Math.min(availableInBundle, remainingToUse);
      
      // Update bundle
      await client.query(
        'UPDATE bundles SET credits_remaining = credits_remaining - $1, updated_at = NOW() WHERE id = $2',
        [useFromThisBundle, bundleRow.id]
      );
      
      bundlesUsed.push({
        bundleId: bundleRow.id,
        creditsUsed: useFromThisBundle,
      });
      
      remainingToUse -= useFromThisBundle;
    }
    
    // Get final balance
    const balanceAfter = await getUserCreditBalance(userId, client);
    
    // Record transaction
    await recordTransaction(
      {
        userId,
        bundleId: bundlesUsed[0].bundleId, // Primary bundle used
        transactionType: 'USAGE',
        credits: -creditsToUse,
        balanceAfter,
        description: `Used ${creditsToUse} credit(s) for report generation`,
        referenceId,
      },
      client
    );
    
    await client.query('COMMIT');
    
    logger.info('Credits used', { userId, creditsToUse, bundlesUsed, remainingBalance: balanceAfter });
    
    return {
      success: true,
      bundlesUsed,
      remainingBalance: balanceAfter,
    };
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Error using credits', { error, userId, creditsToUse });
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Get user's current credit balance
 */
export async function getUserCreditBalance(userId: string, client?: any): Promise<number> {
  const db = client || pool;
  
  const query = `
    SELECT COALESCE(SUM(credits_remaining), 0) as total
    FROM bundles
    WHERE user_id = $1
      AND status = 'ACTIVE'
      AND (expiry_date IS NULL OR expiry_date > NOW())
  `;
  
  const result = await db.query(query, [userId]);
  return parseInt(result.rows[0].total, 10);
}

/**
 * Get detailed credit balance with transaction history
 */
export async function getCreditBalanceDetails(userId: string): Promise<CreditBalance> {
  // Get active bundles
  const activeBundles = await getUserBundles(userId, true);
  
  const totalCredits = activeBundles.reduce((sum, b) => sum + b.creditsTotal, 0);
  const remainingCredits = activeBundles.reduce((sum, b) => sum + b.creditsRemaining, 0);
  const usedCredits = totalCredits - remainingCredits;
  
  // Get recent transactions
  const transactionsQuery = `
    SELECT * FROM credit_transactions
    WHERE user_id = $1
    ORDER BY created_at DESC
    LIMIT 20
  `;
  const transactionsResult = await pool.query(transactionsQuery, [userId]);
  
  return {
    userId,
    totalCredits,
    usedCredits,
    remainingCredits,
    activeBundles: activeBundles.map(b => ({
      bundleId: b.id,
      creditsRemaining: b.creditsRemaining,
      purchaseDate: b.purchaseDate,
      expiryDate: b.expiryDate,
    })),
    recentTransactions: transactionsResult.rows.map(row => ({
      bundleId: row.bundle_id,
      type: row.transaction_type,
      credits: row.credits,
      date: row.created_at,
      description: row.description,
    })),
  };
}

/**
 * Record a credit transaction
 */
async function recordTransaction(
  data: {
    userId: string;
    bundleId?: string;
    transactionType: 'PURCHASE' | 'USAGE' | 'EXPIRY' | 'REFUND';
    credits: number;
    balanceAfter: number;
    description: string;
    referenceId?: string;
  },
  client?: any
): Promise<void> {
  const db = client || pool;
  
  const query = `
    INSERT INTO credit_transactions (
      user_id, bundle_id, transaction_type, credits, balance_after, description, reference_id
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7)
  `;
  
  const values = [
    data.userId,
    data.bundleId || null,
    data.transactionType,
    data.credits,
    data.balanceAfter,
    data.description,
    data.referenceId || null,
  ];
  
  await db.query(query, values);
}

/**
 * Map database row to Bundle object
 */
function mapRowToBundle(row: any): Bundle {
  return {
    id: row.id,
    userId: row.user_id,
    bundleSize: row.bundle_size,
    creditsTotal: row.credits_total,
    creditsRemaining: row.credits_remaining,
    pricePerReport: row.price_per_report,
    totalPaid: row.total_paid,
    purchaseDate: row.purchase_date,
    expiryDate: row.expiry_date,
    stripePaymentIntentId: row.stripe_payment_intent_id,
    status: row.status,
  };
}
