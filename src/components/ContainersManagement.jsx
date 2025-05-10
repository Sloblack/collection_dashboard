import { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import PageHeader from './shared/PageHeader';
import DataTable from './shared/DataTable';
import { containerService } from '../services/api';

export default function ContainersManagement() {
  const [containers, setContainers] = useState([]);
  const [editingContainer, setEditingContainer] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchContainers();
  }, []);

  const fetchContainers = async () => {
    try {
      const response = await containerService.getAll();
      setContainers(response.data.sort((a, b) => a.contenedor_ID - b.contenedor_ID));
    } catch (error) {
      console.error('Error fetching containers:', error);
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este contenedor?')) {
      try {
        await containerService.delete(id);
        fetchContainers();
        alert('Contenedor eliminado correctamente');
      } catch (error) {
        console.error('Error deleting container:', error);
        alert('Error al eliminar el contenedor');
      }
    }
  }

  const handleEdit = (container) => {
    setEditingContainer(container);
  };

  const handleSave = async (id, editedContainer) => {
    try {
      await containerService.update(id, editedContainer);
      setEditingContainer(null);
      fetchContainers();
      alert('Contenedor actualizado correctamente');
    } catch (error) {
      console.error('Error updating container:', error);
      alert('Error al actualizar el contenedor');
    }
  };

  const handleCreate = async (newContainer) => {
    try {
      await containerService.create(newContainer);
      setIsCreating(false);
      fetchContainers();
      alert('Contenedor creado correctamente');
    } catch (error) {
      console.error('Error creating container:', error);
      alert('Error al crear el contenedor');
    }
  };

  const statusBadge = (status) => (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
      status ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
    }`}>
      {status ? 'Recolectado' : 'Pendiente'}
    </span>
  );

  const columns = [
    { header: 'ID', accessor: 'contenedor_ID' },
    { header: 'Ubicación', accessor: 'ubicacion' },
    { header: 'Código QR', accessor: 'codigo_QR' },
    { header: 'Código NFC', accessor: 'codigo_NFC' },
    {
      header: 'Estado', accessor: 'estadoRecoleccion',  // Agregar la columna 'estadoRecoleccion' al array de columnas y usar esta en la celda para mostrar el estado en badge
      cell: (row) => statusBadge(row.estadoRecoleccion)
    },
    {
      header: 'Última Actualización',
      accessor: 'ultima_actualizacion',
      cell: (row) => new Date(row.ultima_actualizacion).toLocaleString(
        'es-ES', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        }
      ),
    },
    {
      header: 'Acciones',
      cell: (row) => (
        <div className="space-x-2">
          <button className="text-blue-600 hover:text-blue-800" onClick={() => handleEdit(row)}>Editar</button>
          <button className="text-red-600 hover:text-red-800" onClick={() => handleDelete(row.contenedor_ID)}>Eliminar</button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-medium">Lista de Contenedores</h2>
          <p className="text-gray-500 text-sm">Administra los contenedores del sistema</p>
        </div>
        <button
          className="w-full sm:w-auto bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          onClick={() => setIsCreating(true)}
        >
          Nuevo Contenedor
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
              {containers.map((container) => (
                <tr key={container.contenedor_ID}>
                  {columns.map((column, index) => (
                    <td key={index} className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {column.cell 
                        ? column.cell(container)
                        : column.accessor.split('.').reduce((obj, key) => obj && obj[key], container)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {editingContainer && (
        <EditContainerModal
          container={editingContainer}
          onClose={() => setEditingContainer(null)}
          onSave={handleSave}
        />
      )}

      {isCreating && (
        <CreateContainerModal
          onClose={() => setIsCreating(false)}
          onSave={handleCreate}
        />
      )}
    </div>
  );
}

function CreateContainerModal({ onClose, onSave }) {
  const [newContainer, setNewContainer] = useState({
    ubicacion: '',
    codigo_QR: '',
    codigo_NFC: ''
  });

  const handleChange = (e) => {
    setNewContainer({ ...newContainer, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(newContainer);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Crear Nuevo Contenedor</h3>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="ubicacion"
            value={newContainer.ubicacion}
            onChange={handleChange}
            className="mb-2 w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Ubicación"
            required
          />
          <input
            type="text"
            name="codigo_QR"
            value={newContainer.codigo_QR}
            onChange={handleChange}
            className="mb-2 w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Código QR"
            required
          />
          <input
            type="text"
            name="codigo_NFC"
            value={newContainer.codigo_NFC}
            onChange={handleChange}
            className="mb-2 w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Código NFC"
            required
          />
          <div className="flex justify-end">
            <button type="button" onClick={onClose} className="mr-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-md">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-md">Crear</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditContainerModal({ container, onClose, onSave }) {
  const [editedContainer, setEditedContainer] = useState({
    ubicacion: container.ubicacion,
    codigo_QR: container.codigo_QR,
    codigo_NFC: container.codigo_NFC
  });

  const handleChange = (e) => {
    setEditedContainer({ ...editedContainer, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(container.contenedor_ID, editedContainer);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Editar Contenedor</h3>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="ubicacion"
            value={editedContainer.ubicacion}
            onChange={handleChange}
            className="mb-2 w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Ubicación"
            required
          />
          <input
            type="text"
            name="codigo_QR"
            value={editedContainer.codigo_QR}
            onChange={handleChange}
            className="mb-2 w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Código QR"
            required
          />
          <input
            type="text"
            name="codigo_NFC"
            value={editedContainer.codigo_NFC}
            onChange={handleChange}
            className="mb-2 w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Código NFC"
            required
          />
          <div className="flex justify-end">
            <button type="button" onClick={onClose} className="mr-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-md">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-md">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  );
}