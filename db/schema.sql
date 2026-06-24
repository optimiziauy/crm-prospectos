CREATE TABLE IF NOT EXISTS prospectos (
  id            SERIAL PRIMARY KEY,
  negocio       TEXT NOT NULL,
  contacto      TEXT NOT NULL,
  telefono      TEXT,
  email         TEXT,
  canal_contacto TEXT NOT NULL DEFAULT 'otro',
  fecha_primer_contacto DATE,
  notas_primer_contacto TEXT,
  estado        TEXT NOT NULL DEFAULT 'identificado',
  asignado_a    TEXT NOT NULL DEFAULT 'nicolas',
  notas         TEXT,
  proximo_seguimiento DATE,
  creado_en     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- canal_contacto: 'whatsapp' | 'email' | 'llamada' | 'en_persona' | 'linkedin' | 'referido' | 'otro'
-- estado: 'identificado' | 'contactado' | 'reunion_agendada' | 'demo_hecha' | 'cerrado' | 'descartado'
-- asignado_a: 'nicolas' | 'joaquin'
