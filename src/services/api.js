import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:3000/',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Servicios para cada entidad

// Servicio de Autenticación
export const authService = {
  login: async (credentials) => {
    const response = await apiClient.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
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
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
  isAdmin: () => {
    const user = authService.getCurrentUser();
    return user && user.rol === 'administrador';
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
  getUsersroutes: async (routeId) => {
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