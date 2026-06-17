import React, { useCallback, useEffect, useState } from 'react';
import { Check, Edit, Filter, Plus, Search, UserCog, X } from 'lucide-react';
import useApi from '../../hooks/useApi';
import useToastStore from '../../stores/useToastStore';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Pagination from '../../components/shared/Pagination';
import EmptyState from '../../components/shared/EmptyState';
import ModalWrapper from '../../components/shared/ModalWrapper';

const SPECIALTIES = [
  'Medicina general',
  'Cardiologia',
  'Pediatria',
  'Dermatologia',
  'Ginecologia',
  'Neurologia',
];

const initialForm = {
  nombre: '',
  email: '',
  contrasena: '',
  rol: 'paciente',
  especialidad: '',
};

const getStatusMeta = (estado) =>
  estado === 'activo'
    ? { label: 'Activo', className: 'bg-green-100 text-green-800' }
    : { label: 'Inactivo', className: 'bg-gray-100 text-gray-800' };

const getRoleBadgeClass = (rol) => {
  switch (rol) {
    case 'admin':
      return 'bg-purple-100 text-purple-800';
    case 'medico':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-green-100 text-green-800';
  }
};

const UsersManagementPage = () => {
  const { fetchData, loading } = useApi();
  const { showToast } = useToastStore();
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('todos');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [pagination, setPagination] = useState({ page: 1, limit: 10 });
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState(initialForm);
  const [editingRole, setEditingRole] = useState({ userId: null, role: '' });

  const loadUsers = useCallback(async () => {
    try {
      const data = await fetchData({ url: '/users' });
      setUsers(data.data || []);
    } catch {
      showToast('Error al cargar usuarios', 'error');
    }
  }, [fetchData, showToast]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [searchTerm, roleFilter, statusFilter]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await fetchData({ url: `/users/${userId}`, method: 'PUT', data: { rol: newRole } });
      showToast('Rol actualizado exitosamente', 'success');
      setEditingRole({ userId: null, role: '' });
      await loadUsers();
    } catch {
      showToast('Error al actualizar rol', 'error');
    }
  };

  const handleCreateFormChange = (field, value) => {
    setCreateForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === 'rol' && value !== 'medico') {
        next.especialidad = '';
      }
      return next;
    });
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
    setCreateForm(initialForm);
  };

  const handleCreateUser = async (event) => {
    event.preventDefault();

    if (createForm.rol === 'medico' && !createForm.especialidad) {
      showToast('Selecciona una especialidad para el usuario médico', 'error');
      return;
    }

    try {
      await fetchData({
        url: '/users',
        method: 'POST',
        data: createForm,
      });
      showToast('Usuario creado exitosamente', 'success');
      closeCreateModal();
      await loadUsers();
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.errors?.[0]?.message ||
        'Error al crear usuario';
      showToast(message, 'error');
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      !searchTerm ||
      user.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'todos' || user.rol === roleFilter;
    const matchesStatus = statusFilter === 'todos' || user.estado === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const paginatedUsers = filteredUsers.slice(
    (pagination.page - 1) * pagination.limit,
    pagination.page * pagination.limit
  );

  if (loading && !users.length) {
    return <LoadingSpinner fullPage />;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-white dark:bg-gray-900 rounded-lg shadow p-4 sm:p-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            Gestión de Usuarios
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">
            Administra los usuarios del sistema y crea nuevos perfiles.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo usuario</span>
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          <h2 className="text-base sm:text-lg font-semibold dark:text-white">Filtros</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              aria-label="Buscar por nombre o email"
              placeholder="Buscar por nombre o email"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 focus:border-transparent focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <select
            aria-label="Filtrar usuarios por rol"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-teal-500"
          >
            <option value="todos">Todos los roles</option>
            <option value="admin">Admin</option>
            <option value="medico">Médico</option>
            <option value="paciente">Paciente</option>
          </select>
          <select
            aria-label="Filtrar usuarios por estado"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-teal-500"
          >
            <option value="todos">Todos los estados</option>
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </select>
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            {filteredUsers.length} usuarios encontrados
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
        {paginatedUsers.length === 0 ? (
          <EmptyState
            icon={UserCog}
            title="No hay usuarios"
            description="No se encontraron usuarios con los filtros aplicados"
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px]">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Nombre
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Email
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Rol
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Estado
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {paginatedUsers.map((user) => {
                    const statusMeta = getStatusMeta(user.estado);

                    return (
                      <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="px-4 sm:px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white text-sm">
                              {user.nombre}
                            </p>
                            {user.especialidad && (
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {user.especialidad}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-sm text-gray-600 dark:text-gray-400 max-w-[180px] truncate">
                          {user.email}
                        </td>
                        <td className="px-4 sm:px-6 py-4">
                          {editingRole.userId === user._id ? (
                            <div className="flex items-center gap-2">
                              <select
                                aria-label={`Cambiar rol de ${user.nombre}`}
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
                                aria-label="Confirmar cambio de rol"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setEditingRole({ userId: null, role: '' })}
                                className="text-red-600 hover:text-red-800"
                                aria-label="Cancelar cambio de rol"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 text-xs rounded-full ${getRoleBadgeClass(user.rol)}`}>
                                {user.rol}
                              </span>
                              <button
                                onClick={() => setEditingRole({ userId: user._id, role: user.rol })}
                                className="text-gray-400 hover:text-teal-700"
                                aria-label={`Editar rol de ${user.nombre}`}
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </td>
                        <td className="px-4 sm:px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${statusMeta.className}`}>
                            {statusMeta.label}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-4">
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowDetailsModal(true);
                            }}
                            className="text-teal-700 hover:text-teal-800 font-medium text-sm"
                          >
                            Ver detalles
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Pagination
              total={filteredUsers.length}
              page={pagination.page}
              limit={pagination.limit}
              onPageChange={(newPage) =>
                setPagination((prev) => ({ ...prev, page: newPage }))
              }
            />
          </>
        )}
      </div>

      <ModalWrapper
        isOpen={showCreateModal}
        onClose={closeCreateModal}
        title="Crear nuevo usuario"
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          <div>
            <label htmlFor="create-user-name" className="block text-sm font-medium text-gray-700 mb-1">
              Nombre
            </label>
            <input
              id="create-user-name"
              type="text"
              value={createForm.nombre}
              onChange={(e) => handleCreateFormChange('nombre', e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-teal-500"
              required
            />
          </div>

          <div>
            <label htmlFor="create-user-email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="create-user-email"
              type="email"
              value={createForm.email}
              onChange={(e) => handleCreateFormChange('email', e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-teal-500"
              required
            />
          </div>

          <div>
            <label htmlFor="create-user-password" className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              id="create-user-password"
              type="password"
              minLength={8}
              value={createForm.contrasena}
              onChange={(e) => handleCreateFormChange('contrasena', e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-teal-500"
              required
            />
          </div>

          <div>
            <label htmlFor="create-user-role" className="block text-sm font-medium text-gray-700 mb-1">
              Rol
            </label>
            <select
              id="create-user-role"
              value={createForm.rol}
              onChange={(e) => handleCreateFormChange('rol', e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-teal-500"
            >
              <option value="paciente">Paciente</option>
              <option value="medico">Médico</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {createForm.rol === 'medico' && (
            <div>
              <label htmlFor="create-user-specialty" className="block text-sm font-medium text-gray-700 mb-1">
                Especialidad
              </label>
              <select
                id="create-user-specialty"
                value={createForm.especialidad}
                onChange={(e) => handleCreateFormChange('especialidad', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-teal-500"
                required
              >
                <option value="">Selecciona una especialidad</option>
                {SPECIALTIES.map((specialty) => (
                  <option key={specialty} value={specialty}>
                    {specialty}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={closeCreateModal}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-60 transition-colors"
            >
              {loading ? 'Creando...' : 'Crear usuario'}
            </button>
          </div>
        </form>
      </ModalWrapper>

      <ModalWrapper
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
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
              <p className="text-gray-900 bg-gray-50 p-2 rounded capitalize">{selectedUser.estado || 'activo'}</p>
            </div>
            {selectedUser.especialidad && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Especialidad</label>
                <p className="text-gray-900 bg-gray-50 p-2 rounded">{selectedUser.especialidad}</p>
              </div>
            )}
            {selectedUser.registroMedico && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Registro médico</label>
                <p className="text-gray-900 bg-gray-50 p-2 rounded">{selectedUser.registroMedico}</p>
              </div>
            )}
            <div className="flex justify-end pt-4">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 bg-teal-700 text-white rounded-lg hover:bg-teal-800"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </ModalWrapper>
    </div>
  );
};

export default UsersManagementPage;
