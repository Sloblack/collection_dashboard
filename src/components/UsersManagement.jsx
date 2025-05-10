import { useState, useEffect } from 'react';
import { Users } from 'lucide-react';
import { userService, routeService } from '../services/api';

export default function UsersManagement() {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [message, setMessage] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [managingRoutes, setManagingRoutes] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await userService.getAll();
      const usersWithRoutes = await Promise.all(response.data.map(async (user) => {
        const routesResponse = await userService.getAssignedRoutes(user.usuario_ID);
        return {...user, routes: routesResponse.data };
      }));
      setUsers(usersWithRoutes.sort((a, b) => a.usuario_ID - b.usuario_ID));
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
  }
  
  const handleSave = async (editedUser) => {
    try {
      if (!editingUser || !editingUser.usuario_ID) {
        console.error('No se puede actualizar el usuario: ID no definido');
        return;
      }
      await userService.update(editingUser.usuario_ID, editedUser);
      setEditingUser(null);
      fetchUsers();
      alert('Usuario actualizado exitosamente');
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Error al actualizar usuario');
    }
  }

  const handleCreate = async (newUser) => {
    try {
      await userService.create(newUser);
      fetchUsers();
      setIsCreating(false);
      alert('Usuario creado exitosamente');
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Error al crear usuario');
    }
  }

  const restorePassword = async (telefono) => {
    if (window.confirm('¿Estás seguro de restaurar la contraseña de este usuario?')) {
      try {
        await userService.restorePassword(telefono);
        alert('Contraseña restaurada exitosamente');
      } catch (error) {
        console.error('Error restaurando contraseña:', error);
        alert('Error al restaurar la contraseña');
      }
    }
  }

  const handleDelete = async (userID) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      try {
        await userService.delete(userID);
        fetchUsers();
        alert('Usuario eliminado exitosamente');
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Error al eliminar usuario');
      }
    }
  }

  const handleManageRoutes = (user) => {
    setManagingRoutes(user);
  }

  const handleAssignRoute = async (userId, routeId) => {
    try {
      await userService.assignRoute(userId, routeId);
      fetchUsers();
      alert('Ruta asignada exitosamente');
    } catch (error) {
      console.error('Error assigning route:', error);
      alert('Error al asignar ruta');
    }
  }

  const handleUnassignRoute = async (userId, routeId) => {
    try {
      await userService.unassignRoute(userId, routeId);
      fetchUsers();
      alert('Ruta desasignada exitosamente');
    } catch (error) {
      console.error('Error unassigning route:', error);
      alert('Error al desasignar ruta');
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {message && (
        <MessageBox
          message={message.text}
          type={message.type}
          onClose={() => setMessage(null)}
        />
      )}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-medium">Lista de Usuarios</h2>
          <p className="text-gray-500 text-sm">Gestiona los usuarios del sistema</p>
        </div>
        <button
          className="w-full sm:w-auto bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          onClick={() => setIsCreating(true)}
          >
          Nuevo Usuario
        </button>
      </div>
      
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teléfono</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rutas</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.usuario_ID}>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{user.usuario_ID}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{user.nombre}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{user.telefono}</td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      user.rol === 'administrador' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user.rol.charAt(0).toUpperCase() + user.rol.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.routes && user.routes.length > 0 ? (
                    user.routes.map((route) => (
                    <span key={route.ruta_ID} className="inline-block bg-gray-200 rounded-full px-2 py-0 text-sm font-semibold text-gray-700 mr-2 mb-2">
                      {route.nombre_ruta}
                    </span>
                    ))
                    ) : (
                    <span className="text-gray-400">Sin rutas asignadas</span>
                      )}
                    </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 space-x-2">
                    <button
                    className="text-blue-600 hover:text-blue-800"
                      onClick={() => handleEdit(user)}
                    >
                      Editar</button>
                    <button
                    className="text-red-600 hover:text-red-800"
                      onClick={() => handleDelete(user.usuario_ID)}
                    >
                      Eliminar</button>
                    <button
                      className="text-blue-600 hover:text-blue-800"
                      onClick={() => restorePassword(user.telefono)}
                    >
                      Restaurar Contraseña</button>
                    <button
                      className="text-green-600 hover:text-green-800"
                      onClick={() => handleManageRoutes(user)}
                    >
                      Gestionar rutas
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editingUser && (
        <EditUserModal
        user={editingUser}
        onClose={() => setEditingUser(null)}
        onSave={handleSave}
        />
      )}
      
      {isCreating && (
        <CreateUserModal
          onClose={() => setIsCreating(false)}
          onSave={handleCreate}
        />
      )}

      {managingRoutes && (
        <ManageRoutesModal
          user={managingRoutes}
          onClose={() => setManagingRoutes(null)}
          onAssign={handleAssignRoute}
          onUnassign={handleUnassignRoute}
        />
      )}
    </div>
  );
}

function EditUserModal({ user, onClose, onSave }) {
  const [editedUser, setEditedUser] = useState({
    nombre: user.nombre,
    telefono: user.telefono,
    rol: user.rol
  });

  const handleChange = (e) => {
    setEditedUser({ ...editedUser, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(editedUser);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Editar Usuario</h3>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="nombre"
            value={editedUser.nombre}
            onChange={handleChange}
            className="mb-2 w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Nombre"
          />
          <input
            type="text"
            name="telefono"
            value={editedUser.telefono}
            onChange={handleChange}
            className="mb-2 w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Teléfono"
          />
          <select
            name="rol"
            value={editedUser.rol}
            onChange={handleChange}
            className="mb-4 w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="recolector">Recolector</option>
            <option value="administrador">Administrador</option>
          </select>
          <div className="flex justify-end">
            <button type="button" onClick={onClose} className="mr-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-md">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-md">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CreateUserModal({ onClose, onSave }) {
  const [newUser, setNewUser] = useState({
    nombre: '',
    contrasenia: '',
    telefono: '',
    rol: 'recolector',
  });

  const handleChange = (e) => {
    setNewUser({ ...newUser, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(newUser);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Crear Nuevo Usuario</h3>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="nombre"
            value={newUser.nombre}
            onChange={handleChange}
            className="mb-2 w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Nombre"
            required
          />
          <input
            type="text"
            name="telefono"
            value={newUser.telefono}
            onChange={handleChange}
            className="mb-2 w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Teléfono"
            required
          />
          <input
            type="password"
            name="contrasenia"
            value={newUser.password}
            onChange={handleChange}
            className="mb-2 w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Contraseña"
            required
          />
          <select
            name="rol"
            value={newUser.rol}
            onChange={handleChange}
            className="mb-4 w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="recolector">Recolector</option>
            <option value="administrador">Administrador</option>
          </select>
          <div className="flex justify-end">
            <button type="button" onClick={onClose} className="mr-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-md">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-md">Crear</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function MessageBox({ message, type, onClose }) {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-xl">
        <p className={`text-lg ${type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
          {message}
        </p>
        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}

function ManageRoutesModal({ user, onClose, onAssign, onUnassign }) {
  const [availableRoutes, setAvailableRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState('');

  useEffect(() => {
    fetchAvailableRoutes();
  }, []);

  const fetchAvailableRoutes = async () => {
    try {
      const response = await routeService.getAll();
      setAvailableRoutes(response.data);
    } catch (error) {
      console.error('Error fetching routes:', error);
    }
  };

  const handleAssign = () => {
    if (selectedRoute) {
      onAssign(user.usuario_ID, selectedRoute);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <form onSubmit={onClose}>
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Gestionar Rutas para {user.nombre}</h3>
        <div className="mb-4">
          <h4 className="text-md font-medium mb-2">Rutas Asignadas:</h4>
          {user.routes && user.routes.length > 0 ? (
            user.routes.map((route) => (
              <div key={route.ruta_ID} className="flex justify-between items-center mb-2">
                <span>{route.nombre_ruta}</span>
                <button
                  onClick={() => {
                    if (window.confirm('¿Desea quitar la ruta de este usuario?')) {
                      onUnassign(user.usuario_ID, route.ruta_ID)
                    }
                  }}
                  className="px-2 py-1 bg-red-500 text-white rounded-md text-sm"
                >
                  Quitar
                </button>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No hay rutas asignadas</p>
          )}
        </div>
        <div className="mb-4">
          <h4 className="text-md font-medium mb-2">Asignar Nueva Ruta:</h4>
          <select
            value={selectedRoute}
            onChange={(e) => setSelectedRoute(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">Seleccionar ruta</option>
            {availableRoutes.map((route) => (
              <option key={route.ruta_ID} value={route.ruta_ID}>
                {route.nombre_ruta}
              </option>
            ))}
          </select>
        </div>
        <div className="flex justify-end">
          <button onClick={onClose} className="mr-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-md">
            Cerrar
          </button>
          <button onClick={handleAssign} className="px-4 py-2 bg-blue-500 text-white rounded-md">
            Asignar Ruta
          </button>
        </div>
      </div>
      </form>
    </div>
  );
}