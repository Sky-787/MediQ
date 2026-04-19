// src/pages/doctor/NotificationsPage.jsx
import React, { useState } from 'react';
import { Bell, Calendar, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import EmptyState from '../../components/shared/EmptyState';

const NotificationsPage = () => {
  // Simular notificaciones (luego conectar a API)
  const [notifications] = useState([
    {
      id: 1,
      type: 'appointment',
      title: 'Nueva cita asignada',
      message: 'Paciente Juan Pérez agendó una cita para mañana 10:00 AM',
      time: '2024-01-20T10:00:00',
      read: false,
      icon: Calendar,
      color: 'text-blue-500',
    },
    {
      id: 2,
      type: 'reminder',
      title: 'Recordatorio de citas',
      message: 'Tienes 5 citas programadas para hoy',
      time: '2024-01-20T08:00:00',
      read: false,
      icon: Clock,
      color: 'text-orange-500',
    },
    {
      id: 3,
      type: 'confirmation',
      title: 'Cita confirmada',
      message: 'La cita de María García ha sido confirmada',
      time: '2024-01-19T15:30:00',
      read: true,
      icon: CheckCircle,
      color: 'text-green-500',
    },
    {
      id: 4,
      type: 'cancellation',
      title: 'Cita cancelada',
      message: 'El paciente Carlos López canceló su cita',
      time: '2024-01-19T14:15:00',
      read: true,
      icon: XCircle,
      color: 'text-red-500',
    },
    {
      id: 5,
      type: 'system',
      title: 'Actualización del sistema',
      message: 'El sistema estará en mantenimiento esta noche',
      time: '2024-01-19T09:00:00',
      read: false,
      icon: AlertCircle,
      color: 'text-purple-500',
    },
  ]);

  // Contar citas de hoy
  const todayAppointments = notifications.filter(n => {
    const today = new Date().toDateString();
    const notifDate = new Date(n.time).toDateString();
    return n.type === 'appointment' && today === notifDate;
  }).length;

  // Formatear tiempo relativo
  const getRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `hace ${diffMins} minutos`;
    if (diffHours < 24) return `hace ${diffHours} horas`;
    return `hace ${diffDays} días`;
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6">
      {/* Reminder Badge */}
      {todayAppointments > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
          <Calendar className="w-5 h-5 text-blue-600" />
          <p className="text-blue-800">
            <span className="font-semibold">Hoy tienes {todayAppointments} citas</span>
            {todayAppointments === 1 ? ' programada' : ' programadas'}
          </p>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Bell className="w-6 h-6 text-gray-600" />
            <h2 className="text-xl font-semibold">Notificaciones</h2>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-sm px-2 py-1 rounded-full">
                {unreadCount} nuevas
              </span>
            )}
          </div>
          <button className="text-sm text-teal-700 hover:text-teal-800">
            Marcar todas como leídas
          </button>
        </div>
      </div>

      {/* Lista de notificaciones */}
      <div className="bg-white rounded-lg shadow divide-y">
        {notifications.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="No hay notificaciones"
            description="No tienes notificaciones nuevas en este momento"
          />
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-4 hover:bg-gray-50 transition-colors ${
                !notif.read ? 'bg-blue-50/30' : ''
              }`}
            >
              <div className="flex gap-4">
                <div className={`mt-1 ${notif.color}`}>
                  <notif.icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900">{notif.title}</h3>
                      <p className="text-gray-600 mt-1">{notif.message}</p>
                    </div>
                    {!notif.read && (
                      <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                    )}
                  </div>
                  <p className="text-sm text-gray-400 mt-2">
                    {getRelativeTime(notif.time)}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;