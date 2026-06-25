import { NextRequest, NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const {
      negocio, contacto, telefono, email,
      canal_contacto, fecha_primer_contacto, notas_primer_contacto,
      estado, asignado_a, notas, proximo_seguimiento, fecha_reunion,
    } = body;

    const row = await queryOne(
      `UPDATE prospectos SET
         negocio = $1, contacto = $2, telefono = $3, email = $4,
         canal_contacto = $5, fecha_primer_contacto = $6,
         notas_primer_contacto = $7, estado = $8, asignado_a = $9,
         notas = $10, proximo_seguimiento = $11, fecha_reunion = $12,
         actualizado_en = NOW()
       WHERE id = $13
       RETURNING *`,
      [
        negocio, contacto, telefono || null, email || null,
        canal_contacto, fecha_primer_contacto || null,
        notas_primer_contacto || null, estado, asignado_a,
        notas || null, proximo_seguimiento || null,
        fecha_reunion || null,
        id,
      ]
    );
    if (!row) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
    return NextResponse.json({ data: row });
  } catch (err) {
    console.error('[prospectos PUT]', err);
    return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await queryOne(`DELETE FROM prospectos WHERE id = $1`, [id]);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[prospectos DELETE]', err);
    return NextResponse.json({ error: 'Error al eliminar' }, { status: 500 });
  }
}
