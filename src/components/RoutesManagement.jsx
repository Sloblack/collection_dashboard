import { useState, useEffect } from 'react';
import { Route } from 'lucide-react';
import PageHeader from './shared/PageHeader';
import DataTable from './shared/DataTable';
import { routeService, collectionPointService, containerService } from '../services/api';

export default function RoutesManagement() {
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null);
  const [isAddContainerModalOpen, setIsAddContainerModalOpen] = useState(false);
  const [selectedRouteForContainer, setSelectedRouteForContainer] = useState(null);

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    try {
      const response = await routeService.getAll();
      setRoutes(response.data.sort((a,b) => a.ruta_ID - b.ruta_ID));
    } catch (error) {
      console.error('Error fetching routes:', error);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleViewPoints = (route) => {
    setSelectedRoute(route);
  }

  const handleDeleteRoute = async (routeId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta ruta?')) {
      try {
        await routeService.delete(routeId);
        fetchRoutes();
        alert('Ruta eliminada exitosamente');
      } catch (error) {
        console.error('Error deleting route:', error);
        alert('Error al eliminar la ruta');
      }
    }
  }

  const handleEditRoute = (route) => {
    setEditingRoute(route);
    setIsFormModalOpen(true);
  }

  const handleCreateRoute = () => {
    setIsFormModalOpen(true);
    setEditingRoute(null);
  }

  const handleAddContainer = (route) => {
    setIsAddContainerModalOpen(true);
    setSelectedRouteForContainer(route);
  }

  const handleDeletePoint = async (puntoId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este punto de recolección?')) {
      try {
        await collectionPointService.delete(puntoId);
        // Actualizar la ruta seleccionada
        const updatedRoute = await routeService.getById(selectedRoute.ruta_ID);
        setSelectedRoute(updatedRoute.data);
        // Actualizar la lista de rutas
        fetchRoutes();
        alert('Punto de recolección eliminado exitosamente');
      } catch (error) {
        console.error('Error deleting collection point:', error);
        alert('Error al eliminar el punto de recolección');
      }
    }
  };

  const handleSaveRoute = async (routeData) => {
    try {
      const dataToSend = {
        nombre_ruta: routeData.nombre_ruta,
        descripcion: routeData.descripcion
      };
  
      if (editingRoute) {
        await routeService.update(editingRoute.ruta_ID, dataToSend);
      } else {
        await routeService.create(dataToSend);
      }
      setIsFormModalOpen(false);
      fetchRoutes();
      setEditingRoute(null);
      alert(editingRoute ? 'Ruta actualizada exitosamente' : 'Ruta creada exitosamente');
    } catch (error) {
      console.error('Error saving route:', error);
      alert('Error al guardar la ruta');
    }
  }

  const handleAddContainerToRoute = async (routeId, containerId) => {
    try {
      await collectionPointService.create({
        ruta_ID: routeId,
        contenedor_ID: containerId,
        orden: 0,
      });
      setIsAddContainerModalOpen(false);
      fetchRoutes(); // Actualizamos la lista de rutas
      alert('Contenedor agregado exitosamente a la ruta');
    } catch (error) {
      console.error('Error adding container to route:', error);
      alert('Error al agregar el contenedor a la ruta');
    }
  }

  const columns = [
    { header: 'ID', accessor: 'ruta_ID' },
    { header: 'Nombre', accessor: 'nombre_ruta' },
    { header: 'Descripción', accessor: 'descripcion' },
    {
      header: 'Fecha Creación',
      accessor: 'fecha_creacion',
      cell: (row) => formatDate(row.fecha_creacion)
    },
    {
      header: 'Contenedores',
      accessor: 'puntosRecoleccion',
      cell: (row) => row.puntosRecoleccion.length
    },
    {
      header: 'Acciones',
      cell: (row) => (
        <div className="space-x-2">
          <button
            className="text-blue-600 hover:text-blue-800"
            onClick={() => handleEditRoute(row)}
          >
            Editar
          </button>
          <button
            className="text-green-600 hover:text-green-800"
            onClick={() => handleViewPoints(row)}
          >
            Ver Puntos
          </button>
          <button
            className="text-purple-600 hover:text-purple-800"
            onClick={() => handleAddContainer(row)}
          >
            Agregar Contenedor
          </button>
          <button
            className="text-red-600 hover:text-red-800"
            onClick={() => handleDeleteRoute(row.ruta_ID)}
          >
            Eliminar
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-medium">Lista de Rutas</h2>
          <p className="text-gray-500 text-sm">Administra las rutas de recolección</p>
        </div>
        <button
          className="w-full sm:w-auto bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          onClick={handleCreateRoute}
        >
          Nueva Ruta
        </button>
      </div>
      
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
            <tr>
                {columns.map((column, index) => (
                  <th key={index} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {routes.map((route) => (
                <tr key={route.ruta_ID}>
                  {columns.map((column, index) => (
                    <td key={index} className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {column.cell
                        ? column.cell(route)
                        : column.accessor.split('.').reduce((obj, key) => obj && obj[key], route)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {selectedRoute && (
        <ViewPointsModal
          route={selectedRoute}
          onClose={() => setSelectedRoute(null)}
          onDeletePoint={handleDeletePoint}
        />
      )}
      {isFormModalOpen && (
        <RouteFormModal
          route={editingRoute}
          onClose={() => {
            setIsFormModalOpen(false);
            setEditingRoute(null);
          }}
          onSave={handleSaveRoute}
        />
      )}

      {isAddContainerModalOpen && (
        <AddContainerModal
          route={selectedRouteForContainer}
          onClose={() => {
            setIsAddContainerModalOpen(false);
            setSelectedRouteForContainer(null);
          }}
          onAdd={handleAddContainerToRoute}
        />
      )}
    </div>
  );
}

function ViewPointsModal({ route, onClose, onDeletePoint }) {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full content-center
">
      <div className="relative bottom-20 left-20 mx-auto p-5 border w-3/4 shadow-lg rounded-md bg-white">
        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
          Puntos de Recolección - {route.nombre_ruta}
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
            <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Contenedor</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ubicación</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código QR</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código NFC</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
            {route.puntosRecoleccion.map((punto) => (
                <tr key={punto.punto_ID}>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{punto.contenedor.contenedor_ID}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{punto.contenedor.ubicacion}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{punto.contenedor.codigo_QR}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{punto.contenedor.codigo_NFC}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                    {punto.contenedor.estadoRecoleccion ? 'Recolectado' : 'Pendiente'}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                    <button
                      className="text-red-600 hover:text-red-800"
                      onClick={() => onDeletePoint(punto.punto_ID)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

function RouteFormModal({ route, onClose, onSave }) {
  const [formData, setFormData] = useState(route || { nombre_ruta: '', descripcion: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
          {route ? 'Editar Ruta' : 'Crear Nueva Ruta'}
        </h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="nombre_ruta" className="block text-sm font-medium text-gray-700">Nombre de la Ruta</label>
            <input
              type="text"
              name="nombre_ruta"
              id="nombre_ruta"
              value={formData.nombre_ruta}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700">Descripción</label>
            <textarea
              name="descripcion"
              id="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              rows="3"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            ></textarea>
          </div>
          <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
            <button
              type="button"
              onClick={onClose}
              className="mr-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-md"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AddContainerModal({ route, onClose, onAdd }) {
  const [containers, setContainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedContainerId, setSelectedContainerId] = useState('');

  useEffect(() => {
    fetchContainers();
  }, []);

  const fetchContainers = async () => {
    try {
      setLoading(true);
      const response = await containerService.getAll();
      // Filtrar solo los contenedores disponibles (sin puntoRecoleccion)
      const availableContainers = response.data.filter(container => !container.puntoRecoleccion);
      setContainers(availableContainers);
    } catch (error) {
      console.error('Error fetching containers:', error);
      setError('Error al cargar los contenedores');
    } finally {
      setLoading(false);
    }
  };

  const handleAddContainer = (e) => {
    e.preventDefault();
    if (selectedContainerId) {
      onAdd(route.ruta_ID, parseInt(selectedContainerId));
    }
  };

  if (loading) return <div>Cargando contenedores...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
          Agregar Contenedor a la Ruta: {route.nombre_ruta}
        </h3>
        <form onSubmit={handleAddContainer}>
          <div className="mb-4">
            <label htmlFor="container-select" className="block text-sm font-medium text-gray-700">
              Seleccionar Contenedor
            </label>
            <select
              id="container-select"
              value={selectedContainerId}
              onChange={(e) => setSelectedContainerId(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="">Seleccione un contenedor</option>
              {containers.map((container) => (
                <option key={container.contenedor_ID} value={container.contenedor_ID}>
                  ID: {container.contenedor_ID} - Ubicación: {container.ubicacion}
                </option>
              ))}
            </select>
          </div>
          <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
            <button
              type="button"
              onClick={onClose}
              className="mr-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-md"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!selectedContainerId}
              className={`px-4 py-2 bg-blue-500 text-white rounded-md ${
                !selectedContainerId ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              Agregar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}