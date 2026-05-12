import { useEffect, useState, useRef } from 'react'
import { Bell, Check, Clock } from 'lucide-react'
import axiosInstance from '../../api/axiosInstance'
import { useAuthStore } from '../../stores/useAuthStore'

function relativeTime(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = date - now
  const diffMins = Math.round(diffMs / 60000)
  if (diffMins <= 0) return 'ahora'
  if (diffMins < 60) return `en ${diffMins} min`
  const hrs = Math.round(diffMins / 60)
  if (hrs < 24) return `en ${hrs} h`
  const days = Math.round(hrs / 24)
  return `en ${days} d`
}

export default function NotificationsBell({ pollInterval = 45000 }) {
  const { user, isAuthenticated, isLoading } = useAuthStore()
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState([])
  const [unread, setUnread] = useState(0)
  const mounted = useRef(false)

  useEffect(() => {
    mounted.current = true
    return () => { mounted.current = false }
  }, [])

  // Fetch notifications / upcoming appointments
  const fetchNotifications = async (signal) => {
    if (!isAuthenticated || !user) return setItems([])

    try {
      // Intentar obtener citas próximos desde el backend
      const res = await axiosInstance.get('/appointments', {
        params: { page: 1, limit: 5 },
        signal,
      })
      const data = res.data?.data || []
      const mapped = data.map(a => ({
        id: a._id || a.id,
        title: a.motivo || 'Cita',
        when: a.fechaHora || a.fecha || a.date,
        patient: a.pacienteId?.nombre || a.paciente?.nombre || '',
        status: a.estado || 'pendiente',
        type: 'appointment',
        read: false,
      }))
      if (!mounted.current) return
      setItems(mapped)
      setUnread(mapped.filter(i => !i.read).length)
    } catch (err) {
      // Fallback: mock datos locales (no romper si el backend no implementa endpoint)
      if (!mounted.current) return
      const mock = [
        { id: 'm1', title: 'Paciente X - consulta', when: new Date(Date.now()+3600*1000).toISOString(), patient: 'Paciente X', status: 'pendiente', type: 'appointment', read: false },
      ]
      setItems(mock)
      setUnread(mock.length)
    }
  }

  useEffect(() => {
    const controller = new AbortController()
    fetchNotifications(controller.signal)
    const timer = setInterval(() => fetchNotifications(controller.signal), pollInterval)
    return () => {
      controller.abort()
      clearInterval(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user])

  const toggle = () => setOpen(v => !v)

  const markRead = (id) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, read: true } : i))
    setUnread(prev => Math.max(0, prev - 1))
  }

  // Mostrar el botón aún si el store está en estado de carga inicial.
  // Evitamos ocultar la campana por un `isLoading` temporal.

  return (
    <div className="relative">
      <button
        aria-label="Notificaciones"
        onClick={toggle}
        className="p-2 rounded-lg text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-semibold bg-red-500 text-white rounded-full">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black/5 z-50">
          <div className="p-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-600" />
              <h4 className="font-medium">Notificaciones</h4>
            </div>
            <button onClick={() => { setItems([]); setUnread(0) }} className="text-sm text-teal-600">Limpiar</button>
          </div>

          <div className="max-h-64 overflow-auto">
            {items.length === 0 ? (
              <div className="p-4 text-sm text-gray-500">No hay notificaciones</div>
            ) : (
              items.map(item => (
                <div key={item.id} className={`p-3 flex gap-3 items-start hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${!item.read ? 'bg-blue-50/30' : ''}`}>
                  <div className="flex-shrink-0 mt-1 text-teal-600">
                    <Check className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-gray-100">{item.title}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">{item.patient}</div>
                      </div>
                      <div className="text-xs text-gray-400">{relativeTime(item.when)}</div>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600">{item.status}</span>
                      {!item.read && (
                        <button onClick={() => markRead(item.id)} className="text-xs text-teal-600">Marcar leído</button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
