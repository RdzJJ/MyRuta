/**
 * MyRuta Web - Admin Conductors Management Page
 * 
 * Gestiona conductores:
 * - Tabla con lista de conductores
 * - Estado en tiempo real (activo/inactivo)
 * - Crear, editar y desactivar conductores
 * - Asignar buses a conductores
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
import { obtenerBuses, crearNuevoBus, validarDatosBus } from '../../services/busService'
import Button from '../../components/Common/Button'
import LoadingSpinner from '../../components/Common/LoadingSpinner'

export default function GestionConductores() {
  const [conductores, setConductores] = useState([])
  const [rutas, setRutas] = useState([])
  const [buses, setBuses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [estadosTiempoReal, setEstadosTiempoReal] = useState({})
  const [showBusForm, setShowBusForm] = useState(false)
  
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    busId: '',
    rutaId: '',
    password: '',
    passwordConfirm: ''
  })
  
  const [busFormData, setBusFormData] = useState({
    placa: '',
    rutaAsignada: '',
    capacidad: 45,
    marca: '',
    modelo: '',
    año: new Date().getFullYear()
  })
  
  const [formErrors, setFormErrors] = useState([])
  const [busFormErrors, setBusFormErrors] = useState([])
  const [submitting, setSubmitting] = useState(false)

  // Cargar conductores, rutas y buses
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [conductoresData, rutasData, busesData] = await Promise.all([
          obtenerConductores(),
          getRutas(),
          obtenerBuses()
        ])
        setConductores(conductoresData)
        setRutas(rutasData)
        setBuses(busesData)
        setError('')
      } catch (err) {
        console.error('Error cargando datos:', err)
        setError('Error al cargar conductores, rutas y buses')
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
        busId: conductor.busId || '',
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
        busId: '',
        rutaId: '',
        password: '',
        passwordConfirm: ''
      })
    }
    setFormErrors([])
    setBusFormErrors([])
    setShowBusForm(false)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingId(null)
    setFormData({
      nombre: '',
      email: '',
      telefono: '',
      busId: '',
      rutaId: '',
      password: '',
      passwordConfirm: ''
    })
    setBusFormData({
      placa: '',
      rutaAsignada: '',
      capacidad: 45,
      marca: '',
      modelo: '',
      año: new Date().getFullYear()
    })
    setFormErrors([])
    setBusFormErrors([])
    setShowBusForm(false)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleBusInputChange = (e) => {
    const { name, value } = e.target
    setBusFormData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleCreateBus = async (e) => {
    e.preventDefault()
    setBusFormErrors([])
    setSubmitting(true)

    try {
      // Validar datos del bus
      const errores = validarDatosBus(busFormData)
      if (errores.length > 0) {
        setBusFormErrors(errores)
        setSubmitting(false)
        return
      }

      // Crear el bus
      const busId = await crearNuevoBus(busFormData)

      // Cargar los buses actualizados
      const busesActualizados = await obtenerBuses()
      setBuses(busesActualizados)

      // Asignar el bus al formulario de conductor
      setFormData((prev) => ({
        ...prev,
        busId,
        rutaId: busFormData.rutaAsignada
      }))

      // Cerrar el formulario de crear bus
      setShowBusForm(false)
      setBusFormData({
        placa: '',
        rutaAsignada: '',
        capacidad: 45,
        marca: '',
        modelo: '',
        año: new Date().getFullYear()
      })
    } catch (err) {
      console.error('Error creando bus:', err)
      setBusFormErrors([err.message || 'Error al crear el bus'])
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setFormErrors([])

    try {
      // Si no hay busId seleccionado, mostrar error
      if (!formData.busId) {
        setFormErrors(['Debe seleccionar un bus o crear uno nuevo'])
        setSubmitting(false)
        return
      }

      // Validar datos del conductor
      let datosAValidar = { ...formData }
      if (!editingId) {
        const errores = validarDatosConductor(datosAValidar)
        if (errores.length > 0) {
          setFormErrors(errores)
          setSubmitting(false)
          return
        }
      }

      const busSeleccionado = buses.find(b => b.id === formData.busId)

      if (editingId) {
        // Editar conductor
        await actualizarConductor(editingId, {
          nombre: formData.nombre,
          telefono: formData.telefono,
          busId: formData.busId,
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
                  busId: formData.busId,
                  rutaId: formData.rutaId,
                  placa: busSeleccionado?.placa
                }
              : c
          )
        )
      } else {
        // Crear conductor
        const newConductor = await crearConductor({
          email: formData.email,
          password: formData.password,
          nombre: formData.nombre,
          telefono: formData.telefono,
          busId: formData.busId,
          rutaId: formData.rutaId
        })
        
        setConductores((prev) => [
          ...prev,
          {
            id: newConductor.id,
            nombre: newConductor.nombre,
            email: newConductor.email,
            telefono: formData.telefono,
            busId: formData.busId,
            placa: busSeleccionado?.placa,
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
                    const busAsignado = buses.find((b) => b.id === conductor.busId)

                    return (
                      <tr key={conductor.id} className="border-b border-neon-500 border-opacity-30 hover:bg-dark-700 transition">
                        <td className="py-4 px-6 text-neon-500 font-medium">{conductor.nombre}</td>
                        <td className="py-4 px-6 text-neon-500 opacity-75 text-sm">{conductor.email}</td>
                        <td className="py-4 px-6 text-neon-500 opacity-75 font-mono">{busAsignado?.placa || 'N/A'}</td>
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
          <div className="bg-dark-800 border-2 border-neon-500 rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto" style={{ boxShadow: '0 0 30px rgba(0, 255, 65, 0.3)' }}>
            {!showBusForm ? (
              <>
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

                  {/* Bus Selection */}
                  <div className="bg-dark-700 border-2 border-neon-500 border-opacity-50 rounded-lg p-4">
                    <h3 className="text-neon-500 font-bold mb-3">Asignar Bus</h3>
                    
                    <div className="mb-4">
                      <label className="block text-neon-500 text-sm font-semibold mb-2">Bus Existente</label>
                      <select
                        name="busId"
                        value={formData.busId}
                        onChange={handleInputChange}
                        className="w-full bg-dark-600 border-2 border-neon-500 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-neon-400"
                        disabled={submitting}
                      >
                        <option value="">Seleccionar bus...</option>
                        {buses.map((bus) => {
                          const rutaBus = rutas.find(r => r.id === bus.rutaAsignada)
                          return (
                            <option key={bus.id} value={bus.id}>
                              {bus.placa} - {rutaBus?.nombre || 'Sin ruta'} {bus.conductorAsignado ? '(Asignado)' : ''}
                            </option>
                          )
                        })}
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowBusForm(true)}
                      className="w-full bg-neon-500 text-dark-900 font-bold py-2 px-4 rounded-lg hover:bg-neon-400 transition"
                      disabled={submitting}
                    >
                      + Crear Nuevo Bus
                    </button>
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
              </>
            ) : (
              /* Bus Creation Form */
              <>
                <h2 className="text-2xl font-bold text-neon-500 mb-6">Crear Nuevo Bus</h2>

                {busFormErrors.length > 0 && (
                  <div className="mb-4 p-3 bg-red-500 bg-opacity-20 border border-red-500 rounded-lg">
                    {busFormErrors.map((err, idx) => (
                      <p key={idx} className="text-red-400 text-sm">
                        {err}
                      </p>
                    ))}
                  </div>
                )}

                <form onSubmit={handleCreateBus} className="space-y-4">
                  <div>
                    <label className="block text-neon-500 text-sm font-semibold mb-2">Placa del Bus</label>
                    <input
                      type="text"
                      name="placa"
                      value={busFormData.placa}
                      onChange={handleBusInputChange}
                      placeholder="Ej: ABC-1234"
                      className="w-full bg-dark-700 border-2 border-neon-500 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-neon-400 uppercase"
                      disabled={submitting}
                    />
                  </div>

                  <div>
                    <label className="block text-neon-500 text-sm font-semibold mb-2">Ruta Asignada</label>
                    <select
                      name="rutaAsignada"
                      value={busFormData.rutaAsignada}
                      onChange={handleBusInputChange}
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

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-neon-500 text-sm font-semibold mb-2">Capacidad (pasajeros)</label>
                      <input
                        type="number"
                        name="capacidad"
                        value={busFormData.capacidad}
                        onChange={handleBusInputChange}
                        min="1"
                        max="100"
                        className="w-full bg-dark-700 border-2 border-neon-500 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-neon-400"
                        disabled={submitting}
                      />
                    </div>

                    <div>
                      <label className="block text-neon-500 text-sm font-semibold mb-2">Año</label>
                      <input
                        type="number"
                        name="año"
                        value={busFormData.año}
                        onChange={handleBusInputChange}
                        min="2000"
                        max={new Date().getFullYear() + 1}
                        className="w-full bg-dark-700 border-2 border-neon-500 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-neon-400"
                        disabled={submitting}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-neon-500 text-sm font-semibold mb-2">Marca (opcional)</label>
                    <input
                      type="text"
                      name="marca"
                      value={busFormData.marca}
                      onChange={handleBusInputChange}
                      placeholder="Ej: Volvo, Mercedes"
                      className="w-full bg-dark-700 border-2 border-neon-500 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-neon-400"
                      disabled={submitting}
                    />
                  </div>

                  <div>
                    <label className="block text-neon-500 text-sm font-semibold mb-2">Modelo (opcional)</label>
                    <input
                      type="text"
                      name="modelo"
                      value={busFormData.modelo}
                      onChange={handleBusInputChange}
                      placeholder="Ej: FH16"
                      className="w-full bg-dark-700 border-2 border-neon-500 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-neon-400"
                      disabled={submitting}
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      variant="primary"
                      size="md"
                      type="submit"
                      disabled={submitting}
                      className="flex-1"
                    >
                      {submitting ? 'Creando...' : 'Crear Bus'}
                    </Button>
                    <Button
                      variant="secondary"
                      size="md"
                      type="button"
                      onClick={() => {
                        setShowBusForm(false)
                        setBusFormErrors([])
                      }}
                      disabled={submitting}
                      className="flex-1"
                    >
                      Atrás
                    </Button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
