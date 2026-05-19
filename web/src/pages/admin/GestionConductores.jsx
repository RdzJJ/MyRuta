/**
 * MyRuta Web - Admin Conductors Management Page
 * 
 * Gestiona conductores:
 * - Tabla con lista de conductores
 * - Estado en tiempo real (activo/inactivo)
 * - Crear, editar y desactivar conductores
 * - Estadísticas de conductores
 */

import { useState, useEffect } from 'react'
import {
  crearConductor,
  obtenerConductores,
  actualizarConductor,
  desactivarConductor,
  reactivarConductor,
  validarDatosConductor,
  suscribirseAlEstadoEnTiempoReal
} from '../../services/conductorService'
import { getRutas } from '../../services/firestoreService'
import Button from '../../components/Common/Button'
import LoadingSpinner from '../../components/Common/LoadingSpinner'

export default function GestionConductores() {
  const [conductores, setConductores] = useState([])
  const [rutas, setRutas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [estadosTiempoReal, setEstadosTiempoReal] = useState({})
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    placa: '',
    rutaId: '',
    password: '',
    passwordConfirm: ''
  })
  const [formErrors, setFormErrors] = useState([])
  const [submitting, setSubmitting] = useState(false)

  // Cargar conductores y rutas
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [conductoresData, rutasData] = await Promise.all([
          obtenerConductores(),
          getRutas()
        ])
        setConductores(conductoresData)
        setRutas(rutasData)
        setError('')
      } catch (err) {
        console.error('Error cargando datos:', err)
        setError('Error al cargar conductores y rutas')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Suscribirse a estado en tiempo real de cada conductor
  useEffect(() => {
    const unsubscribers = []

    conductores.forEach((conductor) => {
      const unsubscribe = suscribirseAlEstadoEnTiempoReal(conductor.id, (estado) => {
        setEstadosTiempoReal((prev) => ({
          ...prev,
          [conductor.id]: estado
        }))
      })
      unsubscribers.push(unsubscribe)
    })

    return () => {
      unsubscribers.forEach((unsub) => unsub && unsub())
    }
  }, [conductores])

  const handleOpenModal = (conductor = null) => {
    if (conductor) {
      setEditingId(conductor.id)
      setFormData({
        nombre: conductor.nombre || '',
        email: conductor.email || '',
        telefono: conductor.telefono || '',
        placa: conductor.placa || '',
        rutaId: conductor.rutaId || '',
        password: '',
        passwordConfirm: ''
      })
    } else {
      setEditingId(null)
      setFormData({
        nombre: '',
        email: '',
        telefono: '',
        placa: '',
        rutaId: '',
        password: '',
        passwordConfirm: ''
      })
    }
    setFormErrors([])
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingId(null)
    setFormData({
      nombre: '',
      email: '',
      telefono: '',
      placa: '',
      rutaId: '',
      password: '',
      passwordConfirm: ''
    })
    setFormErrors([])
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setFormErrors([])

    try {
      // Validar datos
      let datosAValidar = { ...formData }
      if (!editingId) {
        const errores = validarDatosConductor(datosAValidar)
        if (errores.length > 0) {
          setFormErrors(errores)
          setSubmitting(false)
          return
        }
      }

      if (editingId) {
        // Editar conductor
        await actualizarConductor(editingId, {
          nombre: formData.nombre,
          telefono: formData.telefono,
          placa: formData.placa,
          rutaId: formData.rutaId
        })

        // Actualizar lista local
        setConductores((prev) =>
          prev.map((c) =>
            c.id === editingId
              ? {
                  ...c,
                  nombre: formData.nombre,
                  telefono: formData.telefono,
                  placa: formData.placa,
                  rutaId: formData.rutaId
                }
              : c
          )
        )
      } else {
        // Crear conductor
        const newConductor = await crearConductor(formData)
        setConductores((prev) => [
          ...prev,
          {
            id: newConductor.id,
            nombre: newConductor.nombre,
            email: newConductor.email,
            telefono: formData.telefono,
            placa: formData.placa,
            rutaId: formData.rutaId,
            activo: true,
            creadoEn: new Date()
          }
        ])
      }

      handleCloseModal()
    } catch (err) {
      console.error('Error en formulario:', err)
      setFormErrors([err.message || 'Error al procesar conductor'])
    } finally {
      setSubmitting(false)
    }
  }

  const handleDesactivar = async (conductorId, activo) => {
    if (!confirm(activo ? 'Desactivar este conductor?' : 'Reactivar este conductor?')) {
      return
    }

    try {
      if (activo) {
        await desactivarConductor(conductorId)
      } else {
        await reactivarConductor(conductorId)
      }

      setConductores((prev) =>
        prev.map((c) => (c.id === conductorId ? { ...c, activo: !activo } : c))
      )
    } catch (err) {
      console.error('Error:', err)
      setError('Error al cambiar estado del conductor')
    }
  }

  const getEstadoDisplay = (conductorId, esActivo) => {
    const estadoTiempoReal = estadosTiempoReal[conductorId]

    if (!esActivo) {
      return {
        texto: 'Desactivado',
        colorBg: 'bg-red-500 bg-opacity-20',
        colorText: 'text-red-400',
        boxShadow: '0 0 10px rgba(255, 0, 0, 0.2)'
      }
    }

    if (!estadoTiempoReal) {
      return {
        texto: 'Sin ubicación',
        colorBg: 'bg-gray-500 bg-opacity-20',
        colorText: 'text-gray-400',
        boxShadow: '0 0 10px rgba(128, 128, 128, 0.2)'
      }
    }

    if (estadoTiempoReal.activo) {
      return {
        texto: 'En línea',
        colorBg: 'bg-neon-500 bg-opacity-20',
        colorText: 'text-neon-500',
        boxShadow: '0 0 10px rgba(0, 255, 65, 0.3)'
      }
    } else {
      return {
        texto: 'Sin reportes',
        colorBg: 'bg-yellow-500 bg-opacity-20',
        colorText: 'text-yellow-400',
        boxShadow: '0 0 10px rgba(255, 193, 7, 0.2)'
      }
    }
  }

  const statsActivos = conductores.filter((c) => c.activo && estadosTiempoReal[c.id]?.activo).length
  const statsTotal = conductores.length
  const statsInactivos = conductores.filter((c) => !c.activo).length

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="min-h-screen bg-dark-900 text-white">
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-5xl font-bold text-neon-500 mb-2" style={{ textShadow: '0 0 20px rgba(0, 255, 65, 0.8)' }}>
              Gestión de Conductores
            </h1>
            <div className="h-1 w-24 bg-gradient-to-r from-neon-500 to-transparent"></div>
          </div>
          <Button variant="primary" size="lg" onClick={() => handleOpenModal()}>
            Nuevo Conductor
          </Button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500 bg-opacity-20 border-2 border-red-500 rounded-lg text-red-400">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-dark-800 border-2 border-neon-500 rounded-xl p-6" style={{ boxShadow: '0 0 15px rgba(0, 255, 65, 0.2)' }}>
            <p className="text-neon-500 opacity-75 text-sm mb-2">Total de Conductores</p>
            <p className="text-4xl font-bold text-neon-500">{statsTotal}</p>
          </div>
          <div className="bg-dark-800 border-2 border-neon-500 rounded-xl p-6" style={{ boxShadow: '0 0 15px rgba(0, 255, 65, 0.2)' }}>
            <p className="text-neon-500 opacity-75 text-sm mb-2">En Línea</p>
            <p className="text-4xl font-bold text-neon-500">{statsActivos}</p>
          </div>
          <div className="bg-dark-800 border-2 border-red-500 rounded-xl p-6" style={{ boxShadow: '0 0 15px rgba(255, 0, 0, 0.2)' }}>
            <p className="text-red-400 opacity-75 text-sm mb-2">Desactivados</p>
            <p className="text-4xl font-bold text-red-400">{statsInactivos}</p>
          </div>
        </div>

        {/* Table Card */}
        <div className="bg-dark-800 border-2 border-neon-500 rounded-xl overflow-hidden" style={{ boxShadow: '0 0 20px rgba(0, 255, 65, 0.2)' }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-dark-700 border-b-2 border-neon-500">
                  <th className="text-left py-4 px-6 font-bold text-neon-500">Nombre</th>
                  <th className="text-left py-4 px-6 font-bold text-neon-500">Email</th>
                  <th className="text-left py-4 px-6 font-bold text-neon-500">Placa</th>
                  <th className="text-left py-4 px-6 font-bold text-neon-500">Ruta</th>
                  <th className="text-left py-4 px-6 font-bold text-neon-500">Estado</th>
                  <th className="text-left py-4 px-6 font-bold text-neon-500">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {conductores.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-gray-400">
                      No hay conductores registrados
                    </td>
                  </tr>
                ) : (
                  conductores.map((conductor) => {
                    const estadoDisplay = getEstadoDisplay(conductor.id, conductor.activo)
                    const rutaAsignada = rutas.find((r) => r.id === conductor.rutaId)

                    return (
                      <tr key={conductor.id} className="border-b border-neon-500 border-opacity-30 hover:bg-dark-700 transition">
                        <td className="py-4 px-6 text-neon-500 font-medium">{conductor.nombre}</td>
                        <td className="py-4 px-6 text-neon-500 opacity-75 text-sm">{conductor.email}</td>
                        <td className="py-4 px-6 text-neon-500 opacity-75">{conductor.placa}</td>
                        <td className="py-4 px-6 text-neon-500 opacity-75">{rutaAsignada?.nombre || 'Sin asignar'}</td>
                        <td className="py-4 px-6">
                          <span
                            className={`px-4 py-2 rounded-full text-sm font-semibold ${estadoDisplay.colorBg} ${estadoDisplay.colorText}`}
                            style={{ boxShadow: estadoDisplay.boxShadow }}
                          >
                            {estadoDisplay.texto}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex gap-2">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleOpenModal(conductor)}
                            >
                              Editar
                            </Button>
                            <Button
                              variant={conductor.activo ? 'danger' : 'outline'}
                              size="sm"
                              onClick={() => handleDesactivar(conductor.id, conductor.activo)}
                            >
                              {conductor.activo ? 'Desactivar' : 'Reactivar'}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-800 border-2 border-neon-500 rounded-xl p-8 max-w-md w-full" style={{ boxShadow: '0 0 30px rgba(0, 255, 65, 0.3)' }}>
            <h2 className="text-2xl font-bold text-neon-500 mb-6">
              {editingId ? 'Editar Conductor' : 'Nuevo Conductor'}
            </h2>

            {formErrors.length > 0 && (
              <div className="mb-4 p-3 bg-red-500 bg-opacity-20 border border-red-500 rounded-lg">
                {formErrors.map((err, idx) => (
                  <p key={idx} className="text-red-400 text-sm">
                    {err}
                  </p>
                ))}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-neon-500 text-sm font-semibold mb-2">Nombre</label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  className="w-full bg-dark-700 border-2 border-neon-500 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-neon-400"
                  disabled={submitting}
                />
              </div>

              {!editingId && (
                <div>
                  <label className="block text-neon-500 text-sm font-semibold mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full bg-dark-700 border-2 border-neon-500 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-neon-400"
                    disabled={submitting}
                  />
                </div>
              )}

              <div>
                <label className="block text-neon-500 text-sm font-semibold mb-2">Teléfono</label>
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleInputChange}
                  className="w-full bg-dark-700 border-2 border-neon-500 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-neon-400"
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="block text-neon-500 text-sm font-semibold mb-2">Placa del Bus</label>
                <input
                  type="text"
                  name="placa"
                  value={formData.placa}
                  onChange={handleInputChange}
                  className="w-full bg-dark-700 border-2 border-neon-500 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-neon-400"
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="block text-neon-500 text-sm font-semibold mb-2">Ruta Asignada</label>
                <select
                  name="rutaId"
                  value={formData.rutaId}
                  onChange={handleInputChange}
                  className="w-full bg-dark-700 border-2 border-neon-500 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-neon-400"
                  disabled={submitting}
                >
                  <option value="">Seleccionar ruta...</option>
                  {rutas.map((ruta) => (
                    <option key={ruta.id} value={ruta.id}>
                      {ruta.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {!editingId && (
                <>
                  <div>
                    <label className="block text-neon-500 text-sm font-semibold mb-2">Contraseña</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full bg-dark-700 border-2 border-neon-500 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-neon-400"
                      disabled={submitting}
                    />
                  </div>

                  <div>
                    <label className="block text-neon-500 text-sm font-semibold mb-2">Confirmar Contraseña</label>
                    <input
                      type="password"
                      name="passwordConfirm"
                      value={formData.passwordConfirm}
                      onChange={handleInputChange}
                      className="w-full bg-dark-700 border-2 border-neon-500 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-neon-400"
                      disabled={submitting}
                    />
                  </div>
                </>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  variant="primary"
                  size="md"
                  type="submit"
                  disabled={submitting}
                  className="flex-1"
                >
                  {submitting ? 'Procesando...' : editingId ? 'Guardar Cambios' : 'Crear Conductor'}
                </Button>
                <Button
                  variant="secondary"
                  size="md"
                  type="button"
                  onClick={handleCloseModal}
                  disabled={submitting}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
