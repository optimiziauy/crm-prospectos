import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const rows = await query(
      `SELECT * FROM prospectos ORDER BY
        CASE estado
          WHEN 'reunion_agendada' THEN 1
          WHEN 'contactado'       THEN 2
          WHEN 'identificado'     THEN 3
          WHEN 'demo_hecha'       THEN 4
          WHEN 'cerrado'          THEN 5
          WHEN 'descartado'       THEN 6
          ELSE 7
        END,
        proximo_seguimiento ASC NULLS LAST,
        creado_en DESC`
    );
    return NextResponse.json({ data: rows });
  } catch (err) {
    console.error('[prospectos GET]', err);
    return NextResponse.json({ error: 'Error al cargar prospectos' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      negocio, contacto, telefono, email,
      canal_contacto, fecha_primer_contacto, notas_primer_contacto,
      estado, asignado_a, notas, proximo_seguimiento,
    } = body;

    const row = await queryOne(
      `INSERT INTO prospectos
         (negocio, contacto, telefono, email, canal_contacto,
          fecha_primer_contacto, notas_primer_contacto,
          estado, asignado_a, notas, proximo_seguimiento)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       RETURNING *`,
      [
        negocio, contacto, telefono || null, email || null,
        canal_contacto || 'otro',
        fecha_primer_contacto || null, notas_primer_contacto || null,
        estado || 'identificado', asignado_a || 'nicolas',
        notas || null, proximo_seguimiento || null,
      ]
    );
    return NextResponse.json({ data: row }, { status: 201 });
  } catch (err) {
    console.error('[prospectos POST]', err);
    return NextResponse.json({ error: 'Error al crear prospecto' }, { status: 500 });
  }
}
