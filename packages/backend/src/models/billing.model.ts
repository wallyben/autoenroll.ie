import { query } from '../utils/database';

export interface BillingSubscription {
  id: string;
  userId: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  status: string;
  priceId: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export async function createSubscription(
  userId: string,
  stripeCustomerId: string,
  stripeSubscriptionId: string,
  priceId: string,
  status: string,
  currentPeriodStart: Date,
  currentPeriodEnd: Date
): Promise<BillingSubscription> {
  const result = await query(
    `INSERT INTO billing_subscriptions 
     (user_id, stripe_customer_id, stripe_subscription_id, status, price_id, 
      current_period_start, current_period_end, cancel_at_period_end, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, false, NOW(), NOW())
     RETURNING id, user_id as "userId", stripe_customer_id as "stripeCustomerId",
               stripe_subscription_id as "stripeSubscriptionId", status, price_id as "priceId",
               current_period_start as "currentPeriodStart", current_period_end as "currentPeriodEnd",
               cancel_at_period_end as "cancelAtPeriodEnd",
               created_at as "createdAt", updated_at as "updatedAt"`,
    [userId, stripeCustomerId, stripeSubscriptionId, status, priceId, currentPeriodStart, currentPeriodEnd]
  );
  return result.rows[0];
}

export async function findSubscriptionByUserId(userId: string): Promise<BillingSubscription | null> {
  const result = await query(
    `SELECT id, user_id as "userId", stripe_customer_id as "stripeCustomerId",
            stripe_subscription_id as "stripeSubscriptionId", status, price_id as "priceId",
            current_period_start as "currentPeriodStart", current_period_end as "currentPeriodEnd",
            cancel_at_period_end as "cancelAtPeriodEnd",
            created_at as "createdAt", updated_at as "updatedAt"
     FROM billing_subscriptions WHERE user_id = $1`,
    [userId]
  );
  return result.rows[0] || null;
}

export async function findSubscriptionByStripeId(stripeSubscriptionId: string): Promise<BillingSubscription | null> {
  const result = await query(
    `SELECT id, user_id as "userId", stripe_customer_id as "stripeCustomerId",
            stripe_subscription_id as "stripeSubscriptionId", status, price_id as "priceId",
            current_period_start as "currentPeriodStart", current_period_end as "currentPeriodEnd",
            cancel_at_period_end as "cancelAtPeriodEnd",
            created_at as "createdAt", updated_at as "updatedAt"
     FROM billing_subscriptions WHERE stripe_subscription_id = $1`,
    [stripeSubscriptionId]
  );
  return result.rows[0] || null;
}

export async function updateSubscription(
  id: string,
  updates: Partial<BillingSubscription>
): Promise<BillingSubscription> {
  const fields: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  if (updates.status) {
    fields.push(`status = $${paramCount++}`);
    values.push(updates.status);
  }

  if (updates.currentPeriodStart) {
    fields.push(`current_period_start = $${paramCount++}`);
    values.push(updates.currentPeriodStart);
  }

  if (updates.currentPeriodEnd) {
    fields.push(`current_period_end = $${paramCount++}`);
    values.push(updates.currentPeriodEnd);
  }

  if (updates.cancelAtPeriodEnd !== undefined) {
    fields.push(`cancel_at_period_end = $${paramCount++}`);
    values.push(updates.cancelAtPeriodEnd);
  }

  fields.push(`updated_at = NOW()`);
  values.push(id);

  const result = await query(
    `UPDATE billing_subscriptions SET ${fields.join(', ')}
     WHERE id = $${paramCount}
     RETURNING id, user_id as "userId", stripe_customer_id as "stripeCustomerId",
               stripe_subscription_id as "stripeSubscriptionId", status, price_id as "priceId",
               current_period_start as "currentPeriodStart", current_period_end as "currentPeriodEnd",
               cancel_at_period_end as "cancelAtPeriodEnd",
               created_at as "createdAt", updated_at as "updatedAt"`,
    values
  );
  return result.rows[0];
}

export async function deleteSubscription(id: string): Promise<void> {
  await query('DELETE FROM billing_subscriptions WHERE id = $1', [id]);
}
