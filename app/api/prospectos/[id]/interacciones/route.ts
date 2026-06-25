import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const rows = await query(
    `SELECT * FROM interacciones WHERE prospecto_id = $1 ORDER BY numero ASC`,
    [id]
  );
  return NextResponse.json({ data: rows });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { canal, fecha, notas } = await req.json();

  const last = await queryOne<{ max: number }>(
    `SELECT COALESCE(MAX(numero), 0) as max FROM interacciones WHERE prospecto_id = $1`,
    [id]
  );
  const numero = (Number(last?.max) ?? 0) + 1;

  const row = await queryOne(
    `INSERT INTO interacciones (prospecto_id, numero, canal, fecha, notas)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [id, numero, canal || 'otro', fecha || null, notas || null]
  );
  return NextResponse.json({ data: row }, { status: 201 });
}
