'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from 'react';
import {
  Plus, Pencil, Trash2, Phone, Mail, Calendar, User,
  MessageCircle, Users, ChevronDown, X, Search,
  Building2, RefreshCw,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────
type Estado = 'identificado' | 'contactado' | 'reunion_agendada' | 'demo_hecha' | 'cerrado' | 'descartado';
type Canal  = 'whatsapp' | 'email' | 'llamada' | 'en_persona' | 'linkedin' | 'referido' | 'otro';
type Asignado = 'nicolas' | 'joaquin';

interface Prospecto {
  id: number;
  negocio: string;
  contacto: string;
  telefono: string | null;
  email: string | null;
  canal_contacto: Canal;
  fecha_primer_contacto: string | null;
  notas_primer_contacto: string | null;
  estado: Estado;
  asignado_a: Asignado;
  notas: string | null;
  proximo_seguimiento: string | null;
  creado_en: string;
}

// ─── Constantes ──────────────────────────────────────────────────────────────
const ESTADOS: { value: Estado; label: string; color: string; bg: string }[] = [
  { value: 'identificado',    label: 'Identificado',      color: 'text-gray-600',  bg: 'bg-gray-100' },
  { value: 'contactado',      label: 'Contactado',        color: 'text-blue-600',  bg: 'bg-blue-50' },
  { value: 'reunion_agendada',label: 'Reunión agendada',  color: 'text-violet-600',bg: 'bg-violet-50' },
  { value: 'demo_hecha',      label: 'Demo hecha',        color: 'text-amber-600', bg: 'bg-amber-50' },
  { value: 'cerrado',         label: 'Cerrado ✓',         color: 'text-emerald-600',bg: 'bg-emerald-50' },
  { value: 'descartado',      label: 'Descartado',        color: 'text-red-500',   bg: 'bg-red-50' },
];

const CANALES: { value: Canal; label: string; icon: React.ReactNode }[] = [
  { value: 'whatsapp',   label: 'WhatsApp',    icon: <MessageCircle className="h-3.5 w-3.5" /> },
  { value: 'email',      label: 'Email',       icon: <Mail className="h-3.5 w-3.5" /> },
  { value: 'llamada',    label: 'Llamada',     icon: <Phone className="h-3.5 w-3.5" /> },
  { value: 'en_persona', label: 'En persona',  icon: <Users className="h-3.5 w-3.5" /> },
  { value: 'linkedin',   label: 'LinkedIn',    icon: <ChevronDown className="h-3.5 w-3.5" /> },
  { value: 'referido',   label: 'Referido',    icon: <User className="h-3.5 w-3.5" /> },
  { value: 'otro',       label: 'Otro',        icon: <ChevronDown className="h-3.5 w-3.5" /> },
];

const ASIGNADOS: { value: Asignado; label: string }[] = [
  { value: 'nicolas', label: 'Nicolás' },
  { value: 'joaquin', label: 'Joaquín' },
];

const FORM_EMPTY = {
  negocio: '', contacto: '', telefono: '', email: '',
  canal_contacto: 'whatsapp' as Canal,
  fecha_primer_contacto: '', notas_primer_contacto: '',
  estado: 'identificado' as Estado,
  asignado_a: 'nicolas' as Asignado,
  notas: '', proximo_seguimiento: '',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function estadoBadge(estado: Estado) {
  const e = ESTADOS.find(x => x.value === estado) ?? ESTADOS[0];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${e.bg} ${e.color}`}>
      {e.label}
    </span>
  );
}

function canalLabel(canal: Canal) {
  const c = CANALES.find(x => x.value === canal);
  return c ? (
    <span className="inline-flex items-center gap-1 text-xs text-gray-500">
      {c.icon} {c.label}
    </span>
  ) : canal;
}

function fmtDate(d: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('es-UY', { day: '2-digit', month: '2-digit', year: '2-digit' });
}

function isVencido(d: string | null) {
  if (!d) return false;
  return new Date(d) < new Date(new Date().toDateString());
}

// ─── Modal Form ──────────────────────────────────────────────────────────────
function Modal({
  open, onClose, onSave, initial,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (data: typeof FORM_EMPTY) => Promise<void>;
  initial?: Partial<typeof FORM_EMPTY>;
}) {
  const [form, setForm] = useState({ ...FORM_EMPTY, ...initial });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm({ ...FORM_EMPTY, ...initial });
  }, [initial, open]);

  if (!open) return null;

  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })); }

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setSaving(true);
    try { await onSave(form); } finally { setSaving(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="font-semibold text-lg">{initial?.negocio ? 'Editar prospecto' : 'Nuevo prospecto'}</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100"><X className="h-5 w-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          {/* Negocio + Contacto */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Negocio *</label>
              <input required value={form.negocio} onChange={e => set('negocio', e.target.value)}
                placeholder="Supermercado El Sol" className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contacto</label>
              <input value={form.contacto} onChange={e => set('contacto', e.target.value)}
                placeholder="María García" className="input" />
            </div>
          </div>

          {/* Teléfono + Email */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
              <input value={form.telefono} onChange={e => set('telefono', e.target.value)}
                placeholder="099 123 456" className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                placeholder="maria@elsol.com.uy" className="input" />
            </div>
          </div>

          {/* 1er Contacto */}
          <div className="border border-blue-100 bg-blue-50/50 rounded-xl p-4 space-y-3">
            <p className="text-sm font-semibold text-blue-700">Primer contacto</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Canal utilizado</label>
                <select value={form.canal_contacto} onChange={e => set('canal_contacto', e.target.value)} className="input">
                  {CANALES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha del contacto</label>
                <input type="date" value={form.fecha_primer_contacto} onChange={e => set('fecha_primer_contacto', e.target.value)} className="input" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cómo fue el contacto / qué se dijo</label>
              <textarea value={form.notas_primer_contacto} onChange={e => set('notas_primer_contacto', e.target.value)}
                placeholder="Ej: Lo contacté por WhatsApp, me respondió con interés, dijo que tiene 2 locales..."
                rows={3} className="input resize-none" />
            </div>
          </div>

          {/* Estado + Asignado + Seguimiento */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select value={form.estado} onChange={e => set('estado', e.target.value)} className="input">
                {ESTADOS.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Asignado a</label>
              <select value={form.asignado_a} onChange={e => set('asignado_a', e.target.value)} className="input">
                {ASIGNADOS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Próximo seguimiento</label>
              <input type="date" value={form.proximo_seguimiento} onChange={e => set('proximo_seguimiento', e.target.value)} className="input" />
            </div>
          </div>

          {/* Notas generales */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notas generales</label>
            <textarea value={form.notas} onChange={e => set('notas', e.target.value)}
              placeholder="Tiene 3 locales, está evaluando opciones, volver a hablar después del 15..."
              rows={3} className="input resize-none" />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function CRMPage() {
  const [prospectos, setProspectos]   = useState<Prospecto[]>([]);
  const [loading, setLoading]         = useState(true);
  const [modalOpen, setModalOpen]     = useState(false);
  const [editing, setEditing]         = useState<Prospecto | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<Estado | 'todos'>('todos');
  const [filtroAsig, setFiltroAsig]   = useState<Asignado | 'todos'>('todos');
  const [busqueda, setBusqueda]       = useState('');
  const [expandido, setExpandido]     = useState<number | null>(null);
  const [refreshing, setRefreshing]   = useState(false);

  const cargar = useCallback(async (silent = false) => {
    if (!silent) setLoading(true); else setRefreshing(true);
    try {
      const res = await fetch('/api/prospectos', { cache: 'no-store' });
      const { data } = await res.json();
      setProspectos(data ?? []);
    } finally {
      setLoading(false); setRefreshing(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  async function guardar(form: typeof FORM_EMPTY) {
    if (editing) {
      await fetch(`/api/prospectos/${editing.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
      });
    } else {
      await fetch('/api/prospectos', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
      });
    }
    setModalOpen(false); setEditing(null);
    cargar(true);
  }

  async function eliminar(p: Prospecto) {
    if (!confirm(`¿Eliminar a ${p.negocio}?`)) return;
    await fetch(`/api/prospectos/${p.id}`, { method: 'DELETE' });
    cargar(true);
  }

  async function cambiarEstado(p: Prospecto, estado: Estado) {
    await fetch(`/api/prospectos/${p.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...p, estado }),
    });
    cargar(true);
  }

  const filtrados = prospectos.filter(p => {
    if (filtroEstado !== 'todos' && p.estado !== filtroEstado) return false;
    if (filtroAsig   !== 'todos' && p.asignado_a !== filtroAsig) return false;
    if (busqueda) {
      const q = busqueda.toLowerCase();
      if (!p.negocio.toLowerCase().includes(q) && !p.contacto.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const stats = {
    total: prospectos.filter(p => !['cerrado','descartado'].includes(p.estado)).length,
    reunion: prospectos.filter(p => p.estado === 'reunion_agendada').length,
    cerrados: prospectos.filter(p => p.estado === 'cerrado').length,
    vencidos: prospectos.filter(p => isVencido(p.proximo_seguimiento) && !['cerrado','descartado'].includes(p.estado)).length,
  };

  function abrirNuevo() { setEditing(null); setModalOpen(true); }
  function abrirEditar(p: Prospecto) {
    setEditing(p);
    setModalOpen(true);
  }

  const initialForm = editing ? {
    negocio: editing.negocio, contacto: editing.contacto,
    telefono: editing.telefono ?? '', email: editing.email ?? '',
    canal_contacto: editing.canal_contacto,
    fecha_primer_contacto: editing.fecha_primer_contacto?.slice(0,10) ?? '',
    notas_primer_contacto: editing.notas_primer_contacto ?? '',
    estado: editing.estado, asignado_a: editing.asignado_a,
    notas: editing.notas ?? '',
    proximo_seguimiento: editing.proximo_seguimiento?.slice(0,10) ?? '',
  } : undefined;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Building2 className="h-4 w-4 text-white" />
          </div>
          <div>
            <h1 className="font-semibold text-gray-900 leading-none">CRM Prospectos</h1>
            <p className="text-xs text-gray-500 mt-0.5">Sistema de Compras Automatizado</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => cargar(true)} disabled={refreshing}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={abrirNuevo} className="btn-primary flex items-center gap-1.5">
            <Plus className="h-4 w-4" /> Nuevo prospecto
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'En pipeline', value: stats.total,   color: 'text-gray-900' },
            { label: 'Con reunión', value: stats.reunion, color: 'text-violet-600' },
            { label: 'Cerrados',   value: stats.cerrados, color: 'text-emerald-600' },
            { label: 'Seguimiento vencido', value: stats.vencidos, color: 'text-red-600' },
          ].map(s => (
            <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-4">
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filtros */}
        <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 mb-4 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input value={busqueda} onChange={e => setBusqueda(e.target.value)}
              placeholder="Buscar negocio o contacto..."
              className="pl-9 input h-9 text-sm" />
          </div>
          <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value as Estado | 'todos')} className="input h-9 text-sm w-auto">
            <option value="todos">Todos los estados</option>
            {ESTADOS.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
          </select>
          <select value={filtroAsig} onChange={e => setFiltroAsig(e.target.value as Asignado | 'todos')} className="input h-9 text-sm w-auto">
            <option value="todos">Ambos</option>
            {ASIGNADOS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
          </select>
        </div>

        {/* Tabla */}
        {loading ? (
          <div className="text-center py-16 text-gray-400">Cargando...</div>
        ) : filtrados.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            {prospectos.length === 0
              ? <><p className="text-lg font-medium text-gray-600 mb-2">No hay prospectos todavía</p><button onClick={abrirNuevo} className="btn-primary">Agregar el primero</button></>
              : 'No hay resultados para los filtros seleccionados'}
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Negocio</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">1er contacto</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Estado</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Seguimiento</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Asignado</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtrados.map(p => (
                  <>
                    <tr key={p.id}
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => setExpandido(expandido === p.id ? null : p.id)}>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{p.negocio}</div>
                        <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <User className="h-3 w-3" /> {p.contacto}
                          {p.telefono && <span className="ml-2 flex items-center gap-1"><Phone className="h-3 w-3" />{p.telefono}</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <div>{canalLabel(p.canal_contacto)}</div>
                        {p.fecha_primer_contacto && (
                          <div className="text-xs text-gray-400 mt-0.5">{fmtDate(p.fecha_primer_contacto)}</div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={p.estado}
                          onClick={e => e.stopPropagation()}
                          onChange={e => cambiarEstado(p, e.target.value as Estado)}
                          className="border-0 bg-transparent p-0 text-xs font-medium focus:ring-0 cursor-pointer"
                        >
                          {ESTADOS.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
                        </select>
                        <div className="mt-0.5">{estadoBadge(p.estado)}</div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        {p.proximo_seguimiento ? (
                          <span className={`flex items-center gap-1 text-xs font-medium ${isVencido(p.proximo_seguimiento) ? 'text-red-600' : 'text-gray-600'}`}>
                            <Calendar className="h-3.5 w-3.5" />
                            {fmtDate(p.proximo_seguimiento)}
                            {isVencido(p.proximo_seguimiento) && <span className="text-red-500 font-semibold">!</span>}
                          </span>
                        ) : <span className="text-gray-300 text-xs">—</span>}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${p.asignado_a === 'nicolas' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'}`}>
                          {ASIGNADOS.find(a => a.value === p.asignado_a)?.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 justify-end" onClick={e => e.stopPropagation()}>
                          <button onClick={() => abrirEditar(p)} className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors">
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => eliminar(p)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandido === p.id && (
                      <tr key={`${p.id}-exp`} className="bg-blue-50/30">
                        <td colSpan={6} className="px-4 pb-4 pt-2">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                            {p.notas_primer_contacto && (
                              <div>
                                <p className="text-xs font-semibold text-blue-700 mb-1">Cómo fue el primer contacto</p>
                                <p className="text-gray-700 leading-relaxed">{p.notas_primer_contacto}</p>
                              </div>
                            )}
                            {p.notas && (
                              <div>
                                <p className="text-xs font-semibold text-gray-500 mb-1">Notas generales</p>
                                <p className="text-gray-700 leading-relaxed">{p.notas}</p>
                              </div>
                            )}
                            {p.email && (
                              <div>
                                <p className="text-xs font-semibold text-gray-500 mb-1">Email</p>
                                <a href={`mailto:${p.email}`} className="text-blue-600 hover:underline">{p.email}</a>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      <Modal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        onSave={guardar}
        initial={initialForm}
      />
    </div>
  );
}
