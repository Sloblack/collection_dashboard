import { useState, useEffect } from 'react';
import { Map } from 'lucide-react';
import PageHeader from './shared/PageHeader';
import DataTable from './shared/DataTable';
import { collectionPointService, routeService, containerService } from '../services/api';

export default function CollectionPointsManagement() {
  const [collectionPoints, setCollectionPoints] = useState([]);
  const [selectedRouteId, setSelectedRouteId] = useState('');
  const [routes, setRoutes] = useState([]);
  const [editingPoint, setEditingPoint] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [availableContainers, setAvailableContainers] = useState([]);

  useEffect(() => {
    fetchCollectionPoints();
    fetchRoutes();
    fetchAvailableContainers();
  }, []);

  const fetchCollectionPoints = async () => {
    try {
      const response = await collectionPointService.getAll();
      setCollectionPoints(response.data);
    } catch (error) {
      console.error('Error fetching collection points:', error);
    }
  };

  const fetchRoutes = async () => {
    try {
      const response = await routeService.getAll();
    setRoutes(response.data);
    } catch (error) {
      console.error('Error fetching routes:', error);
    }
  };

  const fetchAvailableContainers = async () => {
    try {
      const [containersResponse, pointsResponse] = await Promise.all([
        containerService.getAll(),
        collectionPointService.getAll()
      ]);
  
      const allContainers = containersResponse.data;
      const assignedContainerIds = new Set(pointsResponse.data.map(point => point.contenedor.contenedor_ID));
  
      const availableContainers = allContainers.filter(container => !assignedContainerIds.has(container.contenedor_ID));
  
      setAvailableContainers(availableContainers);
    } catch (error) {
      console.error('Error fetching available containers:', error);
    }
  };

  const handleEdit = (point) => {
    setEditingPoint(point);
  }

  const handleSave = async (id, editedPoint) => {
    try {
      const pointData = {
        ruta_ID: parseInt(editedPoint.ruta_ID),
        contenedor_ID: parseInt(editedPoint.contenedor_ID),
        orden: parseInt(editedPoint.orden)
      };
      console.log('Intentando actualizar punto de recolección:', { pointData });
      await collectionPointService.update(id, pointData);
      setEditingPoint(null);
      fetchCollectionPoints();
      fetchAvailableContainers(); // Actualiza la lista de contenedores disponibles
      alert('Punto de recolección actualizado correctamente');
    } catch (error) {
      console.error('Error updating collection point:', error);
      alert('Error al actualizar el punto de recolección');
    }
  };

  const handleCreate = async (newPoint) => {
    try {
      const pointData = {
        ruta_ID: parseInt(newPoint.ruta_ID),
        contenedor_ID: parseInt(newPoint.contenedor_ID),
        orden: parseInt(newPoint.orden)
      };
      console.log('Intentando crear nuevo punto de recolección:', { pointData });
      await collectionPointService.create(pointData);
      setIsCreating(false);
      fetchCollectionPoints();
      alert('Punto de recolección creado correctamente');
    } catch (error) {
      console.error('Error creating collection point:', error);
      alert('Error al crear el punto de recolección');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este punto de recolección?')) {
      try {
        await collectionPointService.delete(id);
        fetchCollectionPoints();
        alert('Punto de recolección eliminado correctamente');
      } catch (error) {
        console.error('Error deleting collection point:', error);
        alert('Error al eliminar el punto de recolección');
      }
    }
  }

  const filteredPoints = selectedRouteId
    ? collectionPoints.filter(point => point.ruta.ruta_ID.toString() === selectedRouteId)
    : collectionPoints;

  const columns = [
    { header: 'ID', accessor: 'punto_ID' },
    { header: 'Ruta', accessor: 'ruta.nombre_ruta' },
    { header: 'Contenedor', accessor: 'contenedor.contenedor_ID' },
    { header: 'Ubicación', accessor: 'contenedor.ubicacion' },
    {
      header: 'Acciones',
      cell: (point) => (
        <div className="space-x-2">
          <button
            className="text-blue-600 hover:text-blue-800"
            onClick={() => handleEdit(point)}
          >
            Editar</button>
          <button
            className="text-red-600 hover:text-red-800"
            onClick={() => handleDelete(point.punto_ID)}
          >
            Eliminar</button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-medium">Puntos de Recolección</h2>
          <p className="text-gray-500 text-sm">Administra los puntos en las rutas de recolección</p>
        </div>
        <button
          className="w-full sm:w-auto bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          onClick={() => setIsCreating(true)}
        >
          Nuevo Punto
        </button>
      </div>
      
      <div className="bg-white shadow rounded-lg p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <label className="block text-sm font-medium text-gray-700">Filtrar por ruta:</label>
          <select 
            value={selectedRouteId}
            onChange={(e) => setSelectedRouteId(e.target.value)}
            className="w-full sm:w-auto border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            {routes.map(route => (
              <option key={route.ruta_ID} value={route.ruta_ID}>{route.nombre_ruta}</option>
            ))}
          </select>
        </div>
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
            {filteredPoints.map((point) => (
                <tr key={point.punto_ID}>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{point.punto_ID}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{point.ruta.nombre_ruta}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{point.contenedor.contenedor_ID}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{point.contenedor.ubicacion}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 space-x-2">
                    {columns[columns.length - 1].cell(point)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {editingPoint && (
        <EditPointModal
          point={editingPoint}
          onClose={() => setEditingPoint(null)}
          onSave={handleSave}
          routes={routes}
          availableContainers={availableContainers}
        />
      )}

      {isCreating && (
        <CreatePointModal
          onClose={() => setIsCreating(false)}
          onSave={handleCreate}
          routes={routes}
          availableContainers={availableContainers}
        />
      )}
    </div>
  );
}

function EditPointModal({ point, onClose, onSave, routes, availableContainers }) {
  const [editedPoint, setEditedPoint] = useState({
    ruta_ID: point.ruta.ruta_ID,
    contenedor_ID: point.contenedor.contenedor_ID,
    orden: point.orden
  });

  const handleChange = (e) => {
    setEditedPoint({ ...editedPoint, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(point.punto_ID, editedPoint);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Editar Punto de Recolección</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Ruta</label>
            <select
              name="ruta_ID"
              value={editedPoint.ruta_ID}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            >
              {routes.map(route => (
                <option key={route.ruta_ID} value={route.ruta_ID}>{route.nombre_ruta}</option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Contenedor</label>
            <select
              name="contenedor_ID"
              value={editedPoint.contenedor_ID}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            >
              <option value={point.contenedor.contenedor_ID}>
                {point.contenedor.contenedor_ID} - {point.contenedor.ubicacion} (Actual)
              </option>
              {availableContainers.map(container => (
                <option key={container.contenedor_ID} value={container.contenedor_ID}>
                  {container.contenedor_ID} - {container.ubicacion}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Orden</label>
            <input
              type="number"
              name="orden"
              value={editedPoint.orden}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
          <div className="flex justify-end">
            <button type="button" onClick={onClose} className="mr-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-md">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-md">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CreatePointModal({ onClose, onSave, routes, availableContainers }) {
  const [newPoint, setNewPoint] = useState({
    ruta_ID: '',
    contenedor_ID: '',
    orden: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewPoint(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(newPoint);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Crear Nuevo Punto de Recolección</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Ruta</label>
            <select
              name="ruta_ID"
              value={newPoint.ruta_ID}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            >
              <option value="">Seleccione una ruta</option>
              {routes.map(route => (
                <option key={route.ruta_ID} value={route.ruta_ID}>{route.nombre_ruta}</option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Contenedor</label>
            <select
              name="contenedor_ID"
              value={newPoint.contenedor_ID}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            >
              <option value="">Seleccione un contenedor</option>
              {availableContainers.map(container => (
                <option key={container.contenedor_ID} value={container.contenedor_ID}>
                  {container.contenedor_ID} - {container.ubicacion}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Orden</label>
            <input
              type="number"
              name="orden"
              value={newPoint.orden}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
          <div className="flex justify-end">
            <button type="button" onClick={onClose} className="mr-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-md">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-md">Crear</button>
          </div>
        </form>
      </div>
    </div>
  );
}