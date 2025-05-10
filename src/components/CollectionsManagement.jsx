import { useState, useEffect } from 'react';
import { Box, X } from 'lucide-react';
import { collectionService } from '../services/api';

export default function CollectionsManagement() {
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState(null);

  useEffect(() => {
    fetchCollections();
  },[]);

  const fetchCollections = async () => {
    try {
      const response = await collectionService.getAll();
      const sortedCollections = response.data.sort((a, b) =>
        b.recoleccion_ID - a.recoleccion_ID
      );
      setCollections(sortedCollections);
    } catch (error) {
      console.error('Error fetching collections:', error);
    }
  };

  const methodBadge = (method) => (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
      method === 'QR' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
    }`}>
      {method}
    </span>
  );

  const handleViewDetails = (collection) => {
    setSelectedCollection(collection);
  }

const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const columns = [
    { header: 'ID', accessor: 'recoleccion_ID' },
    {
      header: 'Fecha',
      accessor: 'fecha_recoleccion',
      cell: (row) => formatDate(row.fecha_recoleccion)
    },
    {
      header: 'Método',
      accessor: 'metodo_recoleccion',
      cell: (row) => methodBadge(row.metodo_recoleccion)
    },
    {
      header: 'Recolector',
      accessor: 'usuario.nombre'
    },
    {
      header: 'Contenedor',
      accessor: 'contenedor.contenedor_ID'
    },
    {
      header: 'Ubicación',
      accessor: 'contenedor.ubicacion'
    },
    {
      header: 'Ruta',
      accessor: 'contenedor.puntoRecoleccion.ruta.nombre_ruta'
    },
    {
      header: 'Acciones',
      cell: (row) => (
        <button
          className="text-blue-600 hover:text-blue-800"
          onClick={() => handleViewDetails(row)}
        >
          Ver Detalles</button>
      )
    }
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-medium">Registro de Recolecciones</h2>
          <p className="text-gray-500 text-sm">Visualiza el historial de recolecciones</p>
        </div>
        <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-2">
          <button className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            Filtrar
          </button>
          <button className="w-full sm:w-auto bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
            Exportar
          </button>
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
            {collections.map((collection) => (
                <tr key={collection.recoleccion_ID}>
                  {columns.map((column, index) => (
                    <td key={index} className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {column.cell
                        ? column.cell(collection)
                        : column.accessor.split('.').reduce((obj, key) => obj && obj[key], collection)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="px-4 py-4 sm:px-6 sm:py-4 flex flex-col sm:flex-row items-center justify-between border-t gap-4">
          <div className="text-sm text-gray-500">
            Mostrando <span className="font-medium">1</span> a <span className="font-medium">4</span> de <span className="font-medium">4</span> resultados
          </div>
          <div className="flex space-x-2">
            <button className="px-3 py-1 border rounded text-sm text-gray-500" disabled>Anterior</button>
            <button className="px-3 py-1 border rounded text-sm text-gray-700 bg-gray-50">1</button>
            <button className="px-3 py-1 border rounded text-sm text-gray-500" disabled>Siguiente</button>
          </div>
        </div>
      </div>
      {selectedCollection && (
        <CollectionDetailsModal
          collection={selectedCollection}
          onClose={() => setSelectedCollection(null)}
        />
      )}
    </div>
  );
}


function CollectionDetailsModal({ collection, onClose }) {

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" onClick={onClose}>
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Detalles de Recolección</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X size={24} />
          </button>
        </div>
        <div className="space-y-3">
          <p><strong>ID:</strong> {collection.recoleccion_ID}</p>
          <p><strong>Fecha:</strong> {formatDate(collection.fecha_recoleccion)}</p>
          <p><strong>Método:</strong> {collection.metodo_recoleccion}</p>
          <p><strong>Recolector:</strong> {collection.usuario.nombre}</p>
          <p><strong>Contenedor QR:</strong> {collection.contenedor.codigo_QR}</p>
          <p><strong>Contenedor NFC:</strong> {collection.contenedor.codigo_NFC}</p>
          <p><strong>Ubicación:</strong> {collection.contenedor.ubicacion}</p>
          <p><strong>Ruta:</strong> {collection.contenedor.puntoRecoleccion.ruta.nombre_ruta}</p>
          <p><strong>Descripción de ruta:</strong> {collection.contenedor.puntoRecoleccion.ruta.descripcion}</p>
        </div>
      </div>
    </div>
  );
}