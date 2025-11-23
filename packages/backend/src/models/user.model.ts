import { query } from '../utils/database';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

export async function createUser(email: string, passwordHash: string, role: string = 'USER'): Promise<User> {
  const result = await query(
    `INSERT INTO users (email, password_hash, role, created_at, updated_at)
     VALUES ($1, $2, $3, NOW(), NOW())
     RETURNING id, email, password_hash as "passwordHash", role, created_at as "createdAt", updated_at as "updatedAt"`,
    [email, passwordHash, role]
  );
  return result.rows[0];
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const result = await query(
    `SELECT id, email, password_hash as "passwordHash", role, created_at as "createdAt", updated_at as "updatedAt"
     FROM users WHERE email = $1`,
    [email]
  );
  return result.rows[0] || null;
}

export async function findUserById(id: string): Promise<User | null> {
  const result = await query(
    `SELECT id, email, password_hash as "passwordHash", role, created_at as "createdAt", updated_at as "updatedAt"
     FROM users WHERE id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

export async function updateUser(id: string, updates: Partial<User>): Promise<User> {
  const fields: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  if (updates.email) {
    fields.push(`email = $${paramCount++}`);
    values.push(updates.email);
  }

  if (updates.passwordHash) {
    fields.push(`password_hash = $${paramCount++}`);
    values.push(updates.passwordHash);
  }

  fields.push(`updated_at = NOW()`);
  values.push(id);

  const result = await query(
    `UPDATE users SET ${fields.join(', ')}
     WHERE id = $${paramCount}
     RETURNING id, email, password_hash as "passwordHash", role, created_at as "createdAt", updated_at as "updatedAt"`,
    values
  );
  return result.rows[0];
}

export async function deleteUser(id: string): Promise<void> {
  await query('DELETE FROM users WHERE id = $1', [id]);
}
