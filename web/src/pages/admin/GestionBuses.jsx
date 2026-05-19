import { useState, useEffect } from 'react'
import {
  collection, getDocs, addDoc, updateDoc,
  deleteDoc, doc, serverTimestamp
} from 'firebase/firestore'
import { db } from '../../config/firebase'

const ESTADOS_BUS = [
  { value: 'disponible',    label: 'Disponible',    color: 'bg-neon-500 bg-opacity-20 text-neon-500',     shadow: '0 0 10px rgba(0,255,65,0.3)',   icon: '🟢' },
  { value: 'en_ruta',       label: 'En Ruta',       color: 'bg-blue-500 bg-opacity-20 text-blue-400',     shadow: '0 0 10px rgba(0,100,255,0.3)',  icon: '🔵' },
  { value: 'en_parqueadero',label: 'En Parqueadero',color: 'bg-yellow-500 bg-opacity-20 text-yellow-400', shadow: '0 0 10px rgba(255,200,0,0.3)',  icon: '🟡' },
  { value: 'mantenimiento', label: 'Mantenimiento', color: 'bg-orange-500 bg-opacity-20 text-orange-400', shadow: '0 0 10px rgba(255,100,0,0.3)',  icon: '🟠' },
  { value: 'siniestrado',   label: 'Siniestrado',   color: 'bg-red-500 bg-opacity-20 text-red-400',       shadow: '0 0 10px rgba(255,0,0,0.3)',    icon: '🔴' },
]

const BUS_VACIO = {
  placa: '',
  numeroInterno: '',
  modelo: '',
  anio: '',
  capacidad: '',
  estado: 'disponible',
  conductorId: '',
  rutaAsignada: '',
  notas: ''
}

export default function GestionBuses() {
  const [buses, setBuses]               = useState([])
  const [conductores, setConductores]   = useState([])
  const [rutas, setRutas]               = useState([])
  const [isLoading, setIsLoading]       = useState(true)
  const [showModal, setShowModal]       = useState(false)
  const [editando, setEditando]         = useState(null)
  const [form, setForm]                 = useState(BUS_VACIO)
  const [errores, setErrores]           = useState([])
  const [guardando, setGuardando]       = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [filtroEstado, setFiltroEstado] = useState('todos')

  // ─── Cargar datos ─────────────────────────────────────────────────────────────
  const cargarTodo = async () => {
    setIsLoading(true)
    try {
      const [busSnap, condSnap, rutaSnap] = await Promise.all([
        getDocs(collection(db, 'buses')),
        getDocs(collection(db, 'conductors')),
        getDocs(collection(db, 'rutas'))
      ])
      setBuses(busSnap.docs.map(d => ({ id: d.id, ...d.data() })))
      setConductores(condSnap.docs.map(d => ({ id: d.id, ...d.data() })))
      setRutas(rutaSnap.docs.map(d => ({ id: d.id, ...d.data() })))
    } catch (error) {
      console.error('Error cargando datos:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { cargarTodo() }, [])

  // ─── Validación ───────────────────────────────────────────────────────────────
  const validar = () => {
    const errs = []
    if (!form.placa.trim())        errs.push('La placa es obligatoria')
    if (!form.capacidad || isNaN(form.capacidad) || Number(form.capacidad) < 1)
      errs.push('La capacidad debe ser mayor a 0')
    // Verificar placa duplicada al crear
    if (!editando) {
      const existe = buses.find(b => b.placa.toUpperCase() === form.placa.toUpperCase().trim())
      if (existe) errs.push('Ya existe un bus con esa placa')
    }
    return errs
  }

  // ─── Abrir modal ──────────────────────────────────────────────────────────────
  const handleNuevoBus = () => {
    setEditando(null)
    setForm(BUS_VACIO)
    setErrores([])
    setShowModal(true)
  }

  const handleEditar = (bus) => {
    setEditando(bus)
    setForm({
      placa:         bus.placa || '',
      numeroInterno: bus.numeroInterno || '',
      modelo:        bus.modelo || '',
      anio:          bus.anio?.toString() || '',
      capacidad:     bus.capacidad?.toString() || '',
      estado:        bus.estado || 'disponible',
      conductorId:   bus.conductorId || '',
      rutaAsignada:  bus.rutaAsignada || '',
      notas:         bus.notas || ''
    })
    setErrores([])
    setShowModal(true)
  }

  // ─── Guardar ──────────────────────────────────────────────────────────────────
  const handleGuardar = async () => {
    const errs = validar()
    if (errs.length > 0) { setErrores(errs); return }

    setGuardando(true)
    try {
      const payload = {
        placa:         form.placa.toUpperCase().trim(),
        numeroInterno: form.numeroInterno.trim(),
        modelo:        form.modelo.trim(),
        anio:          form.anio ? Number(form.anio) : null,
        capacidad:     Number(form.capacidad),
        estado:        form.estado,
        conductorId:   form.conductorId || null,
        rutaAsignada:  form.rutaAsignada || null,
        notas:         form.notas.trim(),
        updatedAt:     serverTimestamp()
      }

      let busId

      if (editando) {
        await updateDoc(doc(db, 'buses', editando.id), payload)
        busId = editando.id
      } else {
        const ref = await addDoc(collection(db, 'buses'), {
          ...payload,
          activo: true,
          createdAt: serverTimestamp()
        })
        busId = ref.id
      }

      // Reflejar asignaciones en documentos relacionados
      if (form.conductorId) {
        await updateDoc(doc(db, 'conductors', form.conductorId), {
          placaBusAsignado: form.placa.toUpperCase().trim(),
          busId
        })
      }
      if (form.rutaAsignada) {
        await updateDoc(doc(db, 'rutas', form.rutaAsignada), {
          busId
        })
      }

      setShowModal(false)
      await cargarTodo()
    } catch (error) {
      console.error('Error guardando bus:', error)
      setErrores([`Error al guardar: ${error.message}`])
    } finally {
      setGuardando(false)
    }
  }

  // ─── Eliminar ─────────────────────────────────────────────────────────────────
  const handleEliminar = async (id) => {
    try {
      await deleteDoc(doc(db, 'buses', id))
      setConfirmDelete(null)
      await cargarTodo()
    } catch (error) {
      console.error('Error eliminando bus:', error)
    }
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────────
  const getEstado = (val) => ESTADOS_BUS.find(e => e.value === val) || ESTADOS_BUS[0]

  const busesFiltrados = filtroEstado === 'todos'
    ? buses
    : buses.filter(b => b.estado === filtroEstado)

  // ─── Estadísticas ─────────────────────────────────────────────────────────────
  const stats = ESTADOS_BUS.map(e => ({
    ...e,
    count: buses.filter(b => b.estado === e.value).length
  }))

  // ─── Campo reutilizable ───────────────────────────────────────────────────────
  const Field = ({ label, children }) => (
    <div>
      <label className="block text-neon-500 text-sm font-semibold mb-1">{label}</label>
      {children}
    </div>
  )

  const inputClass = "w-full px-4 py-3 bg-dark-700 border-2 border-neon-500 text-white placeholder-neon-500 placeholder-opacity-40 rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-500"
  const selectClass = "w-full px-4 py-3 bg-dark-700 border-2 border-neon-500 text-neon-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-500"

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-dark-900 text-white">
      <main className="max-w-7xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-5xl font-bold text-neon-500 mb-2"
              style={{ textShadow: '0 0 20px rgba(0, 255, 65, 0.8)' }}>
              🚌 Gestión de Buses
            </h1>
            <div className="h-1 w-24 bg-gradient-to-r from-neon-500 to-transparent" />
          </div>
          <button onClick={handleNuevoBus}
            className="bg-gradient-to-r from-neon-500 to-neon-600 text-dark-900 font-bold py-3 px-6 rounded-lg hover:from-neon-400 hover:to-neon-500 transition transform hover:scale-105"
            style={{ boxShadow: '0 0 20px rgba(0, 255, 65, 0.5)' }}>
            ➕ Nuevo Bus
          </button>
        </div>

        {/* Estadísticas por estado */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {stats.map(s => (
            <div key={s.value}
              className="bg-dark-800 border-2 border-neon-500 rounded-xl p-4 text-center"
              style={{ boxShadow: '0 0 15px rgba(0,255,65,0.15)' }}>
              <p className="text-2xl mb-1">{s.icon}</p>
              <p className="text-3xl font-bold text-neon-500"
                style={{ textShadow: '0 0 10px rgba(0,255,65,0.6)' }}>{s.count}</p>
              <p className="text-neon-500 opacity-60 text-xs mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filtro por estado */}
        <div className="flex gap-2 flex-wrap mb-6">
          <button
            onClick={() => setFiltroEstado('todos')}
            className={`px-4 py-2 rounded-full text-sm font-semibold border transition ${
              filtroEstado === 'todos'
                ? 'bg-neon-500 text-dark-900 border-neon-500'
                : 'bg-transparent text-neon-500 border-neon-500 hover:bg-neon-500 hover:text-dark-900'
            }`}>
            Todos ({buses.length})
          </button>
          {ESTADOS_BUS.map(e => (
            <button key={e.value}
              onClick={() => setFiltroEstado(e.value)}
              className={`px-4 py-2 rounded-full text-sm font-semibold border transition ${
                filtroEstado === e.value
                  ? 'bg-neon-500 text-dark-900 border-neon-500'
                  : 'bg-transparent text-neon-500 border-neon-500 hover:bg-neon-500 hover:text-dark-900'
              }`}>
              {e.icon} {e.label}
            </button>
          ))}
        </div>

        {/* Tabla */}
        <div className="bg-dark-800 border-2 border-neon-500 rounded-xl overflow-hidden mb-8"
          style={{ boxShadow: '0 0 20px rgba(0,255,65,0.2)' }}>
          {isLoading ? (
            <div className="flex items-center justify-center p-12">
              <p className="text-neon-500">Cargando buses...</p>
            </div>
          ) : busesFiltrados.length === 0 ? (
            <div className="flex items-center justify-center p-12">
              <p className="text-neon-500 opacity-50">No hay buses en este estado</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-dark-700 border-b-2 border-neon-500">
                    {['Placa', 'N° Interno', 'Modelo / Año', 'Capacidad', 'Conductor', 'Ruta', 'Estado', 'Acciones'].map(h => (
                      <th key={h} className="text-left py-4 px-6 font-bold text-neon-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {busesFiltrados.map((bus, idx) => {
                    const conductor = conductores.find(c => c.id === bus.conductorId)
                    const ruta = rutas.find(r => r.id === bus.rutaAsignada)
                    const estado = getEstado(bus.estado)
                    return (
                      <tr key={idx}
                        className="border-b border-neon-500 border-opacity-30 hover:bg-dark-700 transition">
                        <td className="py-4 px-6 text-neon-500 font-mono font-bold">{bus.placa}</td>
                        <td className="py-4 px-6 text-neon-500 opacity-75">
                          {bus.numeroInterno || <span className="opacity-40">—</span>}
                        </td>
                        <td className="py-4 px-6 text-neon-500">
                          {bus.modelo || '—'}{bus.anio ? ` (${bus.anio})` : ''}
                        </td>
                        <td className="py-4 px-6 text-neon-500 text-center">
                          {bus.capacidad || '—'}
                        </td>
                        <td className="py-4 px-6 text-neon-500">
                          {conductor
                            ? `${conductor.nombre}`
                            : <span className="opacity-40">Sin asignar</span>}
                        </td>
                        <td className="py-4 px-6 text-neon-500">
                          {ruta
                            ? ruta.nombre
                            : <span className="opacity-40">Sin ruta</span>}
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${estado.color}`}
                            style={{ boxShadow: estado.shadow }}>
                            {estado.icon} {estado.label}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex gap-2">
                            <button onClick={() => handleEditar(bus)}
                              className="bg-dark-700 border border-neon-500 text-neon-500 px-3 py-2 rounded-lg hover:bg-neon-500 hover:text-dark-900 transition text-sm font-semibold">
                              ✏️ 
                            </button>
                            <button onClick={() => setConfirmDelete(bus.id)}
                              className="bg-dark-700 border border-red-500 text-red-400 px-3 py-2 rounded-lg hover:bg-red-500 hover:text-dark-900 transition text-sm font-semibold">
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* ─── Modal Crear / Editar ─────────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-800 border-2 border-neon-500 rounded-xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto"
            style={{ boxShadow: '0 0 40px rgba(0,255,65,0.3)' }}>

            <h2 className="text-2xl font-bold text-neon-500 mb-6"
              style={{ textShadow: '0 0 10px rgba(0,255,65,0.6)' }}>
              {editando ? '✏️ Editar Bus' : '➕ Nuevo Bus'}
            </h2>

            {errores.length > 0 && (
              <div className="bg-dark-700 border border-red-500 rounded-lg p-4 mb-6">
                {errores.map((e, i) => (
                  <p key={i} className="text-red-400 text-sm">⚠️ {e}</p>
                ))}
              </div>
            )}

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Placa *">
                  <input value={form.placa}
                    onChange={e => setForm({ ...form, placa: e.target.value })}
                    placeholder="Ej: ABC-1234"
                    className={inputClass} />
                </Field>
                <Field label="N° Interno">
                  <input value={form.numeroInterno}
                    onChange={e => setForm({ ...form, numeroInterno: e.target.value })}
                    placeholder="Ej: 042"
                    className={inputClass} />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Modelo">
                  <input value={form.modelo}
                    onChange={e => setForm({ ...form, modelo: e.target.value })}
                    placeholder="Ej: Mercedes Benz"
                    className={inputClass} />
                </Field>
                <Field label="Año">
                  <input type="number" value={form.anio}
                    onChange={e => setForm({ ...form, anio: e.target.value })}
                    placeholder="Ej: 2019"
                    className={inputClass} />
                </Field>
              </div>

              <Field label="Capacidad (pasajeros) *">
                <input type="number" value={form.capacidad}
                  onChange={e => setForm({ ...form, capacidad: e.target.value })}
                  placeholder="Ej: 40"
                  className={inputClass} />
              </Field>

              <Field label="Estado">
                <select value={form.estado}
                  onChange={e => setForm({ ...form, estado: e.target.value })}
                  className={selectClass}>
                  {ESTADOS_BUS.map(e => (
                    <option key={e.value} value={e.value}>
                      {e.icon} {e.label}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Conductor asignado">
                <select value={form.conductorId}
                  onChange={e => setForm({ ...form, conductorId: e.target.value })}
                  className={selectClass}>
                  <option value="">— Sin conductor —</option>
                  {conductores.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.nombre} {c.apellido}
                      {c.busId && c.busId !== editando?.id ? ' (asignado a otro bus)' : ''}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Ruta asignada">
                <select value={form.rutaAsignada}
                  onChange={e => setForm({ ...form, rutaAsignada: e.target.value })}
                  className={selectClass}>
                  <option value="">— Sin ruta —</option>
                  {rutas.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.codigo} - {r.nombre}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Notas (opcional)">
                <textarea value={form.notas}
                  onChange={e => setForm({ ...form, notas: e.target.value })}
                  placeholder="Observaciones del bus..."
                  rows={3}
                  className={`${inputClass} resize-none`} />
              </Field>
            </div>

            <div className="flex gap-4 mt-6">
              <button onClick={handleGuardar} disabled={guardando}
                className="flex-1 bg-gradient-to-r from-neon-500 to-neon-600 text-dark-900 font-bold py-3 rounded-lg hover:from-neon-400 hover:to-neon-500 transition disabled:opacity-50"
                style={{ boxShadow: '0 0 20px rgba(0,255,65,0.4)' }}>
                {guardando ? 'Guardando...' : editando ? 'Actualizar Bus' : 'Crear Bus'}
              </button>
              <button onClick={() => setShowModal(false)} disabled={guardando}
                className="flex-1 bg-dark-700 border-2 border-neon-500 text-neon-500 font-bold py-3 rounded-lg hover:bg-dark-600 transition disabled:opacity-50">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Modal Confirmar Eliminar ─────────────────────────────────────────── */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-800 border-2 border-red-500 rounded-xl p-8 w-full max-w-sm text-center"
            style={{ boxShadow: '0 0 40px rgba(255,0,0,0.3)' }}>
            <p className="text-4xl mb-4">⚠️</p>
            <h3 className="text-xl font-bold text-red-400 mb-2">¿Eliminar este bus?</h3>
            <p className="text-neon-500 opacity-70 text-sm mb-6">
              Esta acción no se puede deshacer. El conductor y la ruta asignados quedarán sin bus.
            </p>
            <div className="flex gap-4">
              <button onClick={() => handleEliminar(confirmDelete)}
                className="flex-1 bg-red-500 text-white font-bold py-3 rounded-lg hover:bg-red-600 transition">
                Sí, eliminar
              </button>
              <button onClick={() => setConfirmDelete(null)}
                className="flex-1 bg-dark-700 border-2 border-neon-500 text-neon-500 font-bold py-3 rounded-lg hover:bg-dark-600 transition">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}