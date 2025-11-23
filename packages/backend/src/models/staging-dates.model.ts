import { query } from '../utils/database';
import {
  StagingDateConfig,
  StagingFrequency,
} from '@autoenroll/common';

/**
 * Create a new staging date configuration
 */
export async function createStagingConfig(
  userId: string,
  frequency: StagingFrequency,
  dates: number[],
  effectiveFrom: Date,
  effectiveTo?: Date
): Promise<StagingDateConfig> {
  const result = await query(
    `INSERT INTO staging_date_configs (user_id, frequency, dates, effective_from, effective_to, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
     RETURNING id, user_id as "userId", frequency, dates, effective_from as "effectiveFrom", 
               effective_to as "effectiveTo", created_at as "createdAt", updated_at as "updatedAt"`,
    [userId, frequency, JSON.stringify(dates), effectiveFrom, effectiveTo || null]
  );
  
  return {
    ...result.rows[0],
    dates: JSON.parse(result.rows[0].dates),
  };
}

/**
 * Get staging date configuration for a user
 */
export async function getStagingConfig(userId: string): Promise<StagingDateConfig | null> {
  const result = await query(
    `SELECT id, user_id as "userId", frequency, dates, effective_from as "effectiveFrom", 
            effective_to as "effectiveTo", created_at as "createdAt", updated_at as "updatedAt"
     FROM staging_date_configs 
     WHERE user_id = $1 AND (effective_to IS NULL OR effective_to > NOW())
     ORDER BY created_at DESC
     LIMIT 1`,
    [userId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return {
    ...result.rows[0],
    dates: JSON.parse(result.rows[0].dates),
  };
}

/**
 * Update staging date configuration
 */
export async function updateStagingConfig(
  id: string,
  updates: Partial<Omit<StagingDateConfig, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
): Promise<StagingDateConfig> {
  const fields: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  if (updates.frequency) {
    fields.push(`frequency = $${paramCount++}`);
    values.push(updates.frequency);
  }

  if (updates.dates) {
    fields.push(`dates = $${paramCount++}`);
    values.push(JSON.stringify(updates.dates));
  }

  if (updates.effectiveFrom) {
    fields.push(`effective_from = $${paramCount++}`);
    values.push(updates.effectiveFrom);
  }

  if (updates.effectiveTo !== undefined) {
    fields.push(`effective_to = $${paramCount++}`);
    values.push(updates.effectiveTo);
  }

  fields.push(`updated_at = NOW()`);
  values.push(id);

  const result = await query(
    `UPDATE staging_date_configs SET ${fields.join(', ')}
     WHERE id = $${paramCount}
     RETURNING id, user_id as "userId", frequency, dates, effective_from as "effectiveFrom", 
               effective_to as "effectiveTo", created_at as "createdAt", updated_at as "updatedAt"`,
    values
  );

  return {
    ...result.rows[0],
    dates: JSON.parse(result.rows[0].dates),
  };
}

/**
 * Delete staging date configuration
 */
export async function deleteStagingConfig(id: string): Promise<void> {
  await query('DELETE FROM staging_date_configs WHERE id = $1', [id]);
}
