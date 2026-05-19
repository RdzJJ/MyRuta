import { useState, useEffect } from 'react'
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp
} from 'firebase/firestore'
import { db } from '../../config/firebase'
import { getBuses } from '../../services/firestoreService'

const ESTADOS = ['Activa', 'Inactiva', 'Mantenimiento']

const RUTA_VACIA = {
  codigo: '',
  nombre: '',
  paradas: '',
  estado: 'Activa',
  descripcion: '',
  busId: ''
}

export default function GestionRutas() {
  const [rutas, setRutas] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState(RUTA_VACIA)
  const [errores, setErrores] = useState([])
  const [guardando, setGuardando] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [busesDisponibles, setBusesDisponibles] = useState([])

  // ─── Cargar rutas ────────────────────────────────────────────────────────────
  const cargarRutas = async () => {
    setIsLoading(true)
    try {
      const snap = await getDocs(collection(db, 'rutas'))
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      setRutas(data)
    } catch (error) {
      console.error('Error cargando rutas:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    cargarRutas()
  }, [])

  // ─── Cargar buses disponibles ────────────────────────────────────────────────
  const cargarBuses = async () => {
    try {
      const buses = await getBuses()
      setBusesDisponibles(buses)
    } catch (error) {
      console.error('Error cargando buses:', error)
    }
  }

  // ─── Validación ──────────────────────────────────────────────────────────────
  const validar = () => {
    const errs = []
    if (!form.codigo.trim()) errs.push('El código es obligatorio')
    if (!form.nombre.trim()) errs.push('El nombre es obligatorio')
    if (!form.paradas || isNaN(form.paradas) || Number(form.paradas) < 1)
      errs.push('El número de paradas debe ser mayor a 0')
    return errs
  }

  // ─── Abrir modal crear ───────────────────────────────────────────────────────
  const handleNuevaRuta = () => {
    setEditando(null)
    setForm(RUTA_VACIA)
    setErrores([])
    cargarBuses()
    setShowModal(true)
  }

  // ─── Abrir modal editar ──────────────────────────────────────────────────────
  const handleEditar = (ruta) => {
    setEditando(ruta)
    setForm({
      codigo: ruta.codigo || '',
      nombre: ruta.nombre || '',
      paradas: ruta.paradas?.toString() || '',
      estado: ruta.estado || 'Activa',
      descripcion: ruta.descripcion || '',
      busId: ruta.busId || ''
    })
    setErrores([])
    cargarBuses()
    setShowModal(true)
  }

  // ─── Guardar (crear o actualizar) ────────────────────────────────────────────
  const handleGuardar = async () => {
    const errs = validar()
    if (errs.length > 0) {
      setErrores(errs)
      return
    }

    setGuardando(true)
    try {
      const payload = {
        codigo: form.codigo.toUpperCase().trim(),
        nombre: form.nombre.trim(),
        paradas: Number(form.paradas),
        busId: form.busId || null,
        estado: form.estado,
        descripcion: form.descripcion.trim(),
        updatedAt: serverTimestamp()
      }

      let rutaId

      if (editando) {
        await updateDoc(doc(db, 'rutas', editando.id), payload)
        rutaId = editando.id
      } else {
        const docRef = await addDoc(collection(db, 'rutas'), {
          ...payload,
          creadoEn: serverTimestamp()
        })
        rutaId = docRef.id
      }

      // Actualizar el bus asignado con el id de la ruta
      if (form.busId) {
        await updateDoc(doc(db, 'buses', form.busId), {
          rutaAsignada: rutaId
        })
      }

      setShowModal(false)
      await cargarRutas()
    } catch (error) {
      console.error('Error guardando ruta:', error)
      setErrores([`Error al guardar: ${error.message}`])
    } finally {
      setGuardando(false)
    }
  }

  // ─── Eliminar ────────────────────────────────────────────────────────────────
  const handleEliminar = async (id) => {
    try {
      await deleteDoc(doc(db, 'rutas', id))
      setConfirmDelete(null)
      await cargarRutas()
    } catch (error) {
      console.error('Error eliminando ruta:', error)
    }
  }

  // ─── Estadísticas ────────────────────────────────────────────────────────────
  const totalRutas = rutas.length
  const rutasActivas = rutas.filter((r) => r.estado === 'Activa').length
  const totalParadas = rutas.reduce((acc, r) => acc + (Number(r.paradas) || 0), 0)

  // ─── Color de estado ─────────────────────────────────────────────────────────
  const colorEstado = (estado) => {
    if (estado === 'Activa') return { badge: 'bg-neon-500 bg-opacity-20 text-neon-500', shadow: '0 0 10px rgba(0,255,65,0.3)', icon: '🟢' }
    if (estado === 'Mantenimiento') return { badge: 'bg-yellow-500 bg-opacity-20 text-yellow-400', shadow: '0 0 10px rgba(255,255,0,0.2)', icon: '🟡' }
    return { badge: 'bg-red-500 bg-opacity-20 text-red-400', shadow: '0 0 10px rgba(255,0,0,0.2)', icon: '🔴' }
  }

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-dark-900 text-white">
      <main className="max-w-7xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-5xl font-bold text-neon-500 mb-2"
              style={{ textShadow: '0 0 20px rgba(0, 255, 65, 0.8)' }}>
              🛣️ Gestión de Rutas
            </h1>
            <div className="h-1 w-24 bg-gradient-to-r from-neon-500 to-transparent" />
          </div>
          <button
            onClick={handleNuevaRuta}
            className="bg-gradient-to-r from-neon-500 to-neon-600 text-dark-900 font-bold py-3 px-6 rounded-lg hover:from-neon-400 hover:to-neon-500 transition transform hover:scale-105"
            style={{ boxShadow: '0 0 20px rgba(0, 255, 65, 0.5)' }}>
            ➕ Nueva Ruta
          </button>
        </div>

        {/* Tabla */}
        <div className="bg-dark-800 border-2 border-neon-500 rounded-xl overflow-hidden mb-8"
          style={{ boxShadow: '0 0 20px rgba(0, 255, 65, 0.2)' }}>
          {isLoading ? (
            <div className="flex items-center justify-center p-12">
              <p className="text-neon-500 animate-pulse">Cargando rutas...</p>
            </div>
          ) : rutas.length === 0 ? (
            <div className="flex items-center justify-center p-12">
              <p className="text-neon-500 opacity-60">No hay rutas registradas. Crea la primera.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-dark-700 border-b-2 border-neon-500">
                    <th className="text-left py-4 px-6 font-bold text-neon-500">Código</th>
                    <th className="text-left py-4 px-6 font-bold text-neon-500">Nombre</th>
                    <th className="text-left py-4 px-6 font-bold text-neon-500">Paradas</th>
                    <th className="text-left py-4 px-6 font-bold text-neon-500">Bus Asignado</th>
                    <th className="text-left py-4 px-6 font-bold text-neon-500">Estado</th>
                    <th className="text-left py-4 px-6 font-bold text-neon-500">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {rutas.map((ruta) => {
                    const c = colorEstado(ruta.estado)
                    const busAsignado = busesDisponibles.find((b) => b.id === ruta.busId)
                    return (
                      <tr key={ruta.id}
                        className="border-b border-neon-500 border-opacity-30 hover:bg-dark-700 transition">
                        <td className="py-4 px-6 text-neon-500 font-mono font-bold">{ruta.codigo}</td>
                        <td className="py-4 px-6 text-neon-500">{ruta.nombre}</td>
                        <td className="py-4 px-6 text-neon-500 opacity-75">{ruta.paradas}</td>
                        <td className="py-4 px-6 text-neon-500 font-mono text-sm">
                          {busAsignado
                            ? busAsignado.placa
                            : <span className="opacity-40">Sin bus</span>}
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-4 py-2 rounded-full text-sm font-semibold ${c.badge}`}
                            style={{ boxShadow: c.shadow }}>
                            {c.icon} {ruta.estado}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditar(ruta)}
                              className="bg-dark-700 border border-neon-500 text-neon-500 px-4 py-2 rounded-lg hover:bg-neon-500 hover:text-dark-900 transition text-sm font-semibold">
                              ✏️ Editar
                            </button>
                            <button
                              onClick={() => setConfirmDelete(ruta.id)}
                              className="bg-dark-700 border border-red-500 text-red-400 px-4 py-2 rounded-lg hover:bg-red-500 hover:text-dark-900 transition text-sm font-semibold">
                              🗑️ Eliminar
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

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'Total de Rutas', value: totalRutas },
            { label: 'Total de Paradas', value: totalParadas },
            { label: 'Rutas Activas', value: rutasActivas }
          ].map((s) => (
            <div key={s.label}
              className="bg-dark-800 border-2 border-neon-500 rounded-xl p-6"
              style={{ boxShadow: '0 0 15px rgba(0, 255, 65, 0.2)' }}>
              <p className="text-neon-500 opacity-75 text-sm mb-2">{s.label}</p>
              <p className="text-4xl font-bold text-neon-500"
                style={{ textShadow: '0 0 10px rgba(0,255,65,0.6)' }}>{s.value}</p>
            </div>
          ))}
        </div>
      </main>

      {/* ─── Modal Crear / Editar ──────────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-800 border-2 border-neon-500 rounded-xl p-8 w-full max-w-lg max-h-screen overflow-y-auto"
            style={{ boxShadow: '0 0 40px rgba(0,255,65,0.3)' }}>

            <h2 className="text-2xl font-bold text-neon-500 mb-6"
              style={{ textShadow: '0 0 10px rgba(0,255,65,0.6)' }}>
              {editando ? '✏️ Editar Ruta' : '➕ Nueva Ruta'}
            </h2>

            {errores.length > 0 && (
              <div className="bg-dark-700 border border-red-500 rounded-lg p-4 mb-6">
                {errores.map((e, i) => (
                  <p key={i} className="text-red-400 text-sm">⚠️ {e}</p>
                ))}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-neon-500 text-sm font-semibold mb-1">Código *</label>
                <input
                  type="text"
                  value={form.codigo}
                  onChange={(e) => setForm({ ...form, codigo: e.target.value })}
                  placeholder="Ej: R001"
                  className="w-full px-4 py-3 bg-dark-700 border-2 border-neon-500 text-white placeholder-neon-500 placeholder-opacity-40 rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-500"
                />
              </div>

              <div>
                <label className="block text-neon-500 text-sm font-semibold mb-1">Nombre *</label>
                <input
                  type="text"
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  placeholder="Ej: Centro - Norte"
                  className="w-full px-4 py-3 bg-dark-700 border-2 border-neon-500 text-white placeholder-neon-500 placeholder-opacity-40 rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-500"
                />
              </div>

              <div>
                <label className="block text-neon-500 text-sm font-semibold mb-1">Número de Paradas *</label>
                <input
                  type="number"
                  min="1"
                  value={form.paradas}
                  onChange={(e) => setForm({ ...form, paradas: e.target.value })}
                  placeholder="Ej: 12"
                  className="w-full px-4 py-3 bg-dark-700 border-2 border-neon-500 text-white placeholder-neon-500 placeholder-opacity-40 rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-500"
                />
              </div>

              <div>
                <label className="block text-neon-500 text-sm font-semibold mb-1">Estado</label>
                <select
                  value={form.estado}
                  onChange={(e) => setForm({ ...form, estado: e.target.value })}
                  className="w-full px-4 py-3 bg-dark-700 border-2 border-neon-500 text-neon-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-500">
                  {ESTADOS.map((e) => (
                    <option key={e} value={e}>{e}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-neon-500 text-sm font-semibold mb-1">Bus Asignado (opcional)</label>
                <select
                  value={form.busId}
                  onChange={(e) => setForm({ ...form, busId: e.target.value })}
                  className="w-full px-4 py-3 bg-dark-700 border-2 border-neon-500 text-neon-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-500">
                  <option value="">— Sin bus asignado —</option>
                  {busesDisponibles.map((bus) => (
                    <option key={bus.id} value={bus.id}>
                      {bus.placa}
                      {bus.rutaAsignada && bus.rutaAsignada !== editando?.id
                        ? ' (asignado a otra ruta)'
                        : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-neon-500 text-sm font-semibold mb-1">Descripción (opcional)</label>
                <textarea
                  value={form.descripcion}
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                  placeholder="Descripción breve de la ruta..."
                  rows={3}
                  className="w-full px-4 py-3 bg-dark-700 border-2 border-neon-500 text-white placeholder-neon-500 placeholder-opacity-40 rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-500 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={handleGuardar}
                disabled={guardando}
                className="flex-1 bg-gradient-to-r from-neon-500 to-neon-600 text-dark-900 font-bold py-3 rounded-lg hover:from-neon-400 hover:to-neon-500 transition disabled:opacity-50"
                style={{ boxShadow: '0 0 20px rgba(0,255,65,0.4)' }}>
                {guardando ? 'Guardando...' : editando ? 'Actualizar Ruta' : 'Crear Ruta'}
              </button>
              <button
                onClick={() => setShowModal(false)}
                disabled={guardando}
                className="flex-1 bg-dark-700 border-2 border-neon-500 text-neon-500 font-bold py-3 rounded-lg hover:bg-dark-600 transition disabled:opacity-50">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Modal Confirmar Eliminar ──────────────────────────────────────────── */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-800 border-2 border-red-500 rounded-xl p-8 w-full max-w-sm text-center"
            style={{ boxShadow: '0 0 40px rgba(255,0,0,0.3)' }}>
            <p className="text-4xl mb-4">⚠️</p>
            <h3 className="text-xl font-bold text-red-400 mb-2">¿Eliminar esta ruta?</h3>
            <p className="text-neon-500 opacity-70 text-sm mb-6">
              Esta acción no se puede deshacer. Los buses asignados quedarán sin ruta.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => handleEliminar(confirmDelete)}
                className="flex-1 bg-red-500 text-white font-bold py-3 rounded-lg hover:bg-red-600 transition">
                Sí, eliminar
              </button>
              <button
                onClick={() => setConfirmDelete(null)}
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
