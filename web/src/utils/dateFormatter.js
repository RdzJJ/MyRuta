/**
 * MyRuta Web - Date Formatting Utilities
 * 
 * Centraliza el formato de fechas para toda la aplicación
 * Soporta formatos: tiempo, fecha, fecha-hora completa, duración
 */

/**
 * Formatea una fecha/timestamp a formato "HH:MM:SS" (solo hora)
 * Ejemplo: "14:35:22"
 */
export function formatTime(dateOrTimestamp) {
  if (!dateOrTimestamp) return 'N/A'
  const date = typeof dateOrTimestamp === 'number' 
    ? new Date(dateOrTimestamp) 
    : new Date(dateOrTimestamp)
  
  return date.toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })
}

/**
 * Formatea una fecha/timestamp a formato "DD/MM/YYYY HH:MM" (fecha y hora)
 * Ejemplo: "19/05/2026 14:35"
 */
export function formatDateTime(dateOrTimestamp) {
  if (!dateOrTimestamp) return 'N/A'
  const date = typeof dateOrTimestamp === 'number' 
    ? new Date(dateOrTimestamp) 
    : new Date(dateOrTimestamp)
  
  return date.toLocaleString('es-CO', {
    dateStyle: 'short',
    timeStyle: 'short',
    hour12: false
  })
}

/**
 * Formatea una fecha/timestamp a formato "DD/MM/YYYY" (solo fecha)
 * Ejemplo: "19/05/2026"
 */
export function formatDate(dateOrTimestamp) {
  if (!dateOrTimestamp) return 'N/A'
  const date = typeof dateOrTimestamp === 'number' 
    ? new Date(dateOrTimestamp) 
    : new Date(dateOrTimestamp)
  
  return date.toLocaleDateString('es-CO', {
    dateStyle: 'short'
  })
}

/**
 * Formatea duración en minutos/horas
 * Ejemplo: "45 min" o "1h 30min"
 */
export function formatDuration(minutes) {
  if (!minutes || minutes <= 0) return 'N/A'
  
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  
  if (hours === 0) {
    return `${mins} min`
  } else if (mins === 0) {
    return `${hours}h`
  } else {
    return `${hours}h ${mins}min`
  }
}

/**
 * Formatea diferencia de tiempo (puede ser positiva o negativa)
 * Ejemplo: "-15 min" (llegó 15 minutos antes) o "+45 min" (llegó 45 minutos después)
 */
export function formatTimeDifference(minutes) {
  if (!minutes && minutes !== 0) return 'N/A'
  
  const sign = minutes >= 0 ? '+' : ''
  const formatted = formatDuration(Math.abs(minutes))
  
  return `${sign}${minutes >= 0 ? '' : '-'}${formatted}`
}

/**
 * Convierte una duración en segundos a formato "HH:MM:SS"
 */
export function formatSecondsToTime(seconds) {
  if (!seconds || seconds < 0) return '00:00:00'
  
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  
  return [hours, minutes, secs]
    .map(v => String(v).padStart(2, '0'))
    .join(':')
}

/**
 * Obtiene hace cuánto tiempo ocurrió algo (ejemplo: "hace 5 minutos")
 */
export function formatTimeAgo(dateOrTimestamp) {
  if (!dateOrTimestamp) return 'N/A'
  
  const date = typeof dateOrTimestamp === 'number' 
    ? new Date(dateOrTimestamp) 
    : new Date(dateOrTimestamp)
  
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  
  if (diffMins < 1) return 'hace unos segundos'
  if (diffMins < 60) return `hace ${diffMins} min`
  if (diffHours < 24) return `hace ${diffHours}h`
  return `hace ${diffDays}d`
}

/**
 * Valida si una fecha es válida
 */
export function isValidDate(dateOrTimestamp) {
  const date = typeof dateOrTimestamp === 'number' 
    ? new Date(dateOrTimestamp) 
    : new Date(dateOrTimestamp)
  
  return date instanceof Date && !isNaN(date)
}
