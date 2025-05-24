import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,//'http://localhost:3000/',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Token stored');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Servicio de Autenticación
export const authService = {
  login: async (credentials) => {
    const response = await apiClient.post('/auth/login', credentials);
    if (response.data.accessToken) {
      localStorage.setItem('token', response.data.accessToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      console.log('Token stored', response.data.accessToken);
    }
    return response.data;
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  register: async (userData) => {
    return await apiClient.post('/auth/register', userData);
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch (e) {
      console.error("Error parsing user data:", e);
      return null;
    }
  },
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
  isAdmin: () => {
    const user = authService.getCurrentUser();
    return user && user.rol === 'administrador';
  },
  getProfile: async () => {
    try {
      const response = await apiClient.get('/auth/profile');
      if (response.status === 200 || response.status === 201) {
        return true;
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        authService.logout();
        return false;
        //throw new Error('Sesión expirada, por favor inicia sesión nuevamente.');
      }
      throw error;
    }
  }
};

// Servicio de Usuarios
export const userService = {
  getAll: async () => {
    return await apiClient.get('/usuarios');
  },
  getById: async (id) => {
    return await apiClient.get(`/usuarios/${id}`);
  },
  create: async (userData) => {
    console.log('Intentando actualizar usuario:', {userData });
    return await apiClient.post('/usuarios', userData);
  },
  update: async (id, userData) => {
    if (!id) {
      throw new Error('ID de usuario no proporcionado');
    }
    return await apiClient.patch(`/usuarios/${id}`, userData);
  },
  delete: async (id) => {
    return await apiClient.delete(`/usuarios/${id}`);
  },
  updatePassword: async (id, passwordData) => {
    return await apiClient.post(`/usuarios/${id}/change-password`, passwordData);
  },
  assignRoute: async (id, routeId) => {
    return await apiClient.post(`/usuarios/${id}/rutas/${routeId}`);
  },
  unassignRoute: async (id, routeId) => {
    return await apiClient.delete(`/usuarios/${id}/rutas/${routeId}`);
  },
  getAssignedRoutes: async (id) => {
    return await apiClient.get(`/usuarios/${id}/rutas`);
  },
  getUsersRoutes: async (routeId) => {
    return await apiClient.get(`/usuarios/${routeId}/usuarios`);
  },
  getUserColletions: async (id) => {
    return await apiClient.get(`/usuarios/${id}/recolecciones`);
  },
  restorePassword: async (phone) => {
    return await apiClient.get(`/usuarios/${phone}/restore-password`);
  }
};

// Servicio de Contenedores
export const containerService = {
  getAll: async () => {
    return await apiClient.get('/contenedores');
  },
  getById: async (id) => {
    return await apiClient.get(`/contenedores/${id}`);
  },
  create: async (containerData) => {
    return await apiClient.post('/contenedores', containerData);
  },
  update: async (id, containerData) => {
    return await apiClient.patch(`/contenedores/${id}`, containerData);
  },
  delete: async (id) => {
    return await apiClient.delete(`/contenedores/${id}`);
  },
  getByCode: async (code) => {
    return await apiClient.get(`/contenedores/${code}/contenedor`);
  },
  stateCollection: async (id, estado) => {
    return await apiClient.patch(`/contenedores/${id}/estado-recoleccion`, estado);
  }
};

// Servicio de Rutas
export const routeService = {
  getAll: async () => {
    return await apiClient.get('/rutas');
  },
  getById: async (id) => {
    return await apiClient.get(`/rutas/${id}`);
  },
  create: async (routeData) => {
    return await apiClient.post('/rutas', routeData);
  },
  update: async (id, routeData) => {
    console.log('Intentando actualizar ruta:', { routeData });
    return await apiClient.patch(`/rutas/${id}`, routeData);
  },
  delete: async (id) => {
    return await apiClient.delete(`/rutas/${id}`);
  },
  updateHour: async (id, hour) => {
    return await apiClient.patch(`/rutas/${id}/cambiar_hora/${hour}`);
  }
};

// Servicio de Recolecciones
export const collectionService = {
  getAll: async () => {
    return await apiClient.get('/recolecciones');
  },
  getById: async (id) => {
    return await apiClient.get(`/recolecciones/${id}`);
  },
  create: async (collectionData) => {
    return await apiClient.post('/recolecciones', collectionData);
  },
  update: async (id, collectionData) => {
    return await apiClient.patch(`/recolecciones/${id}`, collectionData);
  },
  delete: async (id) => {
    return await apiClient.delete(`/recolecciones/${id}`);
  },
};

// Servicio de Puntos de Recolección
export const collectionPointService = {
  getAll: async () => {
    return await apiClient.get('/puntos-recoleccion');
  },
  getById: async (id) => {
    return await apiClient.get(`/puntos-recoleccion/${id}`);
  },
  create: async (pointData) => {
    return await apiClient.post('/puntos-recoleccion', pointData);
  },
  update: async (id, pointData) => {
    console.log('Intentando actualizar punto de recolección:', { pointData });
    return await apiClient.patch(`/puntos-recoleccion/${id}`, pointData);
  },
  delete: async (id) => {
    return await apiClient.delete(`/puntos-recoleccion/${id}`);
  },
};

// Exportar todos los servicios
export default {
  auth: authService,
  users: userService,
  containers: containerService,
  routes: routeService,
  collections: collectionService,
  collectionPoints: collectionPointService
};