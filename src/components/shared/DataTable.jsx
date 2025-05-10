export default function DataTable({ columns, data, withPagination, totalItems }) {
    return (
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((column, index) => (
                  <th 
                    key={index} 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {columns.map((column, colIndex) => (
                    <td 
                      key={colIndex} 
                      className="px-4 py-4 whitespace-nowrap text-sm text-gray-500"
                    >
                      {column.cell ? column.cell(row) : row[column.accessor]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {withPagination && (
          <div className="px-4 py-4 sm:px-6 sm:py-4 flex flex-col sm:flex-row items-center justify-between border-t gap-4">
            <div className="text-sm text-gray-500">
              Mostrando <span className="font-medium">1</span> a <span className="font-medium">{data.length}</span> de <span className="font-medium">{totalItems}</span> resultados
            </div>
            <div className="flex space-x-2">
              <button className="px-3 py-1 border rounded text-sm text-gray-500" disabled>Anterior</button>
              <button className="px-3 py-1 border rounded text-sm text-gray-700 bg-gray-50">1</button>
              <button className="px-3 py-1 border rounded text-sm text-gray-500" disabled>Siguiente</button>
            </div>
          </div>
        )}
      </div>
    );
  }