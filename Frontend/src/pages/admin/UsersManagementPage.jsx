// src/pages/admin/UsersManagementPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Edit, Search, Filter, UserCog, Check, X } from 'lucide-react';
import useApi from '../../hooks/useApi';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Pagination from '../../components/shared/Pagination';
import EmptyState from '../../components/shared/EmptyState';
import ModalWrapper from '../../components/shared/ModalWrapper';
import ToastNotification from '../../components/shared/ToastNotification';

const UsersManagementPage = () => {
  const { fetchData, loading } = useApi();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('todos');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRole, setEditingRole] = useState({ userId: null, role: '' });
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

  // Cargar usuarios
  const loadUsers = useCallback(async () => {
    try {
      const data = await fetchData({ url: '/users' });
      setUsers(data.data || []);
      setPagination(prev => ({
        ...prev,
        total: data.data?.length || 0,
      }));
    } catch (error) {
      setToast({ show: true, message: 'Error al cargar usuarios', type: 'error' });
    }
  }, [fetchData]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Filtrar usuarios
  useEffect(() => {
    let filtered = [...users];

    // Filtro por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por rol
    if (roleFilter !== 'todos') {
      filtered = filtered.filter(user => user.rol === roleFilter);
    }

    // Filtro por estado
    if (statusFilter !== 'todos') {
      filtered = filtered.filter(user => 
        statusFilter === 'activo' ? user.activo : !user.activo
      );
    }

    setFilteredUsers(filtered);
    setPagination(prev => ({
      ...prev,
      total: filtered.length,
    }));
  }, [users, searchTerm, roleFilter, statusFilter]);

  // Cambiar rol de usuario
  const handleRoleChange = async (userId, newRole) => {
    try {
      await fetchData({
        url: `/users/${userId}`,
        method: 'PUT',
        data: { rol: newRole },
      });
      
      setToast({ show: true, message: 'Rol actualizado exitosamente', type: 'success' });
      setEditingRole({ userId: null, role: '' });
      loadUsers();
    } catch (error) {
      setToast({ show: true, message: 'Error al actualizar rol', type: 'error' });
    }
  };

  // Paginación
  const paginatedUsers = filteredUsers.slice(
    (pagination.page - 1) * pagination.limit,
    pagination.page * pagination.limit
  );

  if (loading && !users.length) {
    return <LoadingSpinner fullPage />;
  }

  return (
    <div className="space-y-6">
      {/* Header con título */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
        <p className="text-gray-600 mt-1">Administra los usuarios del sistema</p>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-500" />
          <h2 className="text-lg font-semibold">Filtros</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o email"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          {/* Filtro por rol */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          >
            <option value="todos">Todos los roles</option>
            <option value="admin">Admin</option>
            <option value="medico">Médico</option>
            <option value="paciente">Paciente</option>
          </select>

          {/* Filtro por estado */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          >
            <option value="todos">Todos los estados</option>
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </select>

          {/* Contador de resultados */}
          <div className="flex items-center text-sm text-gray-600">
            {filteredUsers.length} usuarios encontrados
          </div>
        </div>
      </div>

      {/* Tabla de usuarios */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {paginatedUsers.length === 0 ? (
          <EmptyState
            icon={UserCog}
            title="No hay usuarios"
            description="No se encontraron usuarios con los filtros aplicados"
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rol</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{user.nombre}</p>
                          {user.especialidad && (
                            <p className="text-xs text-gray-500">{user.especialidad}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                      <td className="px-6 py-4">
                        {editingRole.userId === user._id ? (
                          <div className="flex items-center gap-2">
                            <select
                              value={editingRole.role}
                              onChange={(e) => setEditingRole({ userId: user._id, role: e.target.value })}
                              className="text-sm border border-gray-300 rounded px-2 py-1"
                              autoFocus
                            >
                              <option value="admin">Admin</option>
                              <option value="medico">Médico</option>
                              <option value="paciente">Paciente</option>
                            </select>
                            <button
                              onClick={() => handleRoleChange(user._id, editingRole.role)}
                              className="text-green-600 hover:text-green-800"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setEditingRole({ userId: null, role: '' })}
                              className="text-red-600 hover:text-red-800"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              user.rol === 'admin' ? 'bg-purple-100 text-purple-800' :
                              user.rol === 'medico' ? 'bg-blue-100 text-blue-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {user.rol}
                            </span>
                            <button
                              onClick={() => setEditingRole({ userId: user._id, role: user.rol })}
                              className="text-gray-400 hover:text-teal-700"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${
                          user.activo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowEditModal(true);
                          }}
                          className="text-teal-700 hover:text-teal-800 font-medium text-sm"
                        >
                          Ver detalles
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            <Pagination
              total={pagination.total}
              page={pagination.page}
              limit={pagination.limit}
              onPageChange={(newPage) => setPagination(prev => ({ ...prev, page: newPage }))}
            />
          </>
        )}
      </div>

      {/* Modal de detalles de usuario */}
      <ModalWrapper
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Detalles del Usuario"
      >
        {selectedUser && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <p className="text-gray-900 bg-gray-50 p-2 rounded">{selectedUser.nombre}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <p className="text-gray-900 bg-gray-50 p-2 rounded">{selectedUser.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
              <p className="text-gray-900 bg-gray-50 p-2 rounded capitalize">{selectedUser.rol}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <p className="text-gray-900 bg-gray-50 p-2 rounded">
                {selectedUser.activo ? 'Activo' : 'Inactivo'}
              </p>
            </div>
            {selectedUser.especialidad && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Especialidad</label>
                <p className="text-gray-900 bg-gray-50 p-2 rounded">{selectedUser.especialidad}</p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
              <p className="text-gray-900 bg-gray-50 p-2 rounded">{selectedUser.telefono || 'No registrado'}</p>
            </div>
            <div className="flex justify-end pt-4">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 bg-teal-700 text-white rounded-lg hover:bg-teal-800"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </ModalWrapper>

      {/* Toast Notifications */}
      {toast.show && (
        <ToastNotification
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}
    </div>
  );
};

export default UsersManagementPage;