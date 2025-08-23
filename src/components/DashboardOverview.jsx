import { useState, useEffect } from 'react';
import React from 'react';
import { Trash2, Route, Box, Users } from 'lucide-react';
import { userService, containerService, collectionService, routeService } from '../services/api';
import ContainersMap from './ContainersMap';


function DashboardOverview() {

  const [users, setUsers] = useState([]);
  const [containers, setContainers] = useState([]);
  const [collections, setCollections] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [recentCollections, setRecentCollections] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState('all');
  const [selectedDate, setSelectedDate] = useState(new Date().toLocaleDateString('en-CA'));

  useEffect(() => {
    fetchUsers(),
    fetchContainers(),
    fetchCollections(),
    fetchRoutes()
  }, [selectedDate])

  const fetchUsers = async () => {
    try {
      const response = await userService.getAll();
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  }

  const fetchContainers = async () => {
    try {
      const response = await containerService.getAll();
      setContainers(response.data);
    } catch (error) {
      console.error('Error fetching containers:', error);
    }
  }

  const fetchCollections = async () => {
    try {
      const response = await collectionService.getAll();
      const filteredCollections = response.data.filter(collection => {
        const collectionDate = new Date(collection.fecha_recoleccion);
        return collectionDate.toLocaleDateString('en-CA') === selectedDate;
      }
      );
      const sortedCollections = filteredCollections.sort((a, b) =>
        b.recoleccion_ID - a.recoleccion_ID
      );
      setCollections(sortedCollections);
      setRecentCollections(sortedCollections.slice(0, 10)); // Mostrar solo las 10 más recientes
    } catch (error) {
      console.error('Error fetching collections:', error);s
    }
  };

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
  }

  const fetchRoutes = async () => {
    try {
      const response = await routeService.getAll();
      setRoutes(response.data);
    } catch (error) {
      console.error('Error fetching routes:', error);
    }
  }

  const filteredContainers = React.useMemo(() => {
    if (selectedRoute === 'all') {
      return containers;
    } else if (selectedRoute === 'unassigned') {
      return containers.filter(container =>
        !container.puntoRecoleccion || !container.puntoRecoleccion.ruta
      );
    } else {
      return containers.filter(container =>
        container.puntoRecoleccion &&
        container.puntoRecoleccion.ruta &&
        container.puntoRecoleccion.ruta.ruta_ID === parseInt(selectedRoute)
      );
    }
  }, [containers, selectedRoute]);

  const countCollectedContainers = (containers, date) => {
    return containers.filter(container => {
      const containerCollections = collections.filter(collection =>
        collection.contenedor.contenedor_ID === container.contenedor_ID &&
        //new Date(collection.fecha_recoleccion).toISOString().split('T')[0] === date);
        new Date(collection.fecha_recoleccion).toLocaleDateString('en-CA') === date);
      return containerCollections.length > 0;
    }).length;
  };

  const stats = [
    { title: 'Contenedores recolectados', value: `${countCollectedContainers(filteredContainers, selectedDate)}/${filteredContainers.length}`, icon: <Trash2 size={24} />, color: 'bg-green-500' },
    { title: 'Recolecciones', value: collections.length, icon: <Box size={24} />, color: 'bg-yellow-500' },
    { title: 'Contenedores Totales', value: containers.length, icon: <Trash2 size={24} />, color: 'bg-blue-500' },
    { title: 'Rutas', value: routes.length, icon: <Route size={24} />, color: 'bg-green-500' },
    { title: 'Usuarios', value: users.length, icon: <Users size={24} />, color: 'bg-purple-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 sm:gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="flex items-center">
              <div className={`${stat.color} text-white p-2 sm:p-3 rounded-lg`}>
                {stat.icon}
              </div>
              <div className="ml-3 sm:ml-4">
                <h3 className="text-gray-500 text-sm font-medium">{stat.title}</h3>
                <p className="text-xl sm:text-2xl font-bold">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center grid grid-rows-2 text-gray-500 text-sm font-medium"> Filtrar por fecha
            <input
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              className="border border-gray-300 rounded-md px-3 py-2 mr-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
        </div>
        </div>
        
      </div>
      
      {/* Map Section */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Mapa de Contenedores</h3>
          <select
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedRoute}
            onChange={(e) => setSelectedRoute(e.target.value)}
          >
            <option value="all">Todas las rutas</option>
            {routes.map((route) => (
              <option key={route.ruta_ID} value={route.ruta_ID}>
                {route.nombre_ruta}
              </option>
            ))}
            <option value="unassigned">Sin ruta asignada</option>
          </select>
        </div>
        
        <ContainersMap containers={filteredContainers} />
      </div>

      {/* Recent Collections */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 sm:p-6 border-b">
          <h3 className="text-lg font-medium">Recolecciones {selectedDate}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
            <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Método</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recolector</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contenedor</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lugar</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ruta</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
            {recentCollections.map((collection) => (
                <tr key={collection.recoleccion_ID}>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{collection.recoleccion_ID}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(collection.fecha_recoleccion).toLocaleString(
                      'es-ES', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      }
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      collection.metodo_recoleccion === 'QR' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {collection.metodo_recoleccion}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{collection.usuario.nombre}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{collection.contenedor.contenedor_ID}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{collection.contenedor.lugar}</td>
                  
                  
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    {collection.contenedor.puntoRecoleccion?.ruta?.nombre_ruta || 'Sin ruta asignada'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );s
}

export default DashboardOverview;