import { neon } from '@neondatabase/serverless';

type NeonFn = {
  (strings: TemplateStringsArray, ...values: unknown[]): Promise<Record<string, unknown>[]>;
  (text: string, params?: unknown[]): Promise<Record<string, unknown>[]>;
};

const sql = neon(process.env.DATABASE_URL!) as unknown as NeonFn;

export async function query<T = Record<string, unknown>>(
  text: string,
  params?: unknown[]
): Promise<T[]> {
  const rows = await sql(text, params);
  return rows as T[];
}

export async function queryOne<T = Record<string, unknown>>(
  text: string,
  params?: unknown[]
): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] ?? null;
}
