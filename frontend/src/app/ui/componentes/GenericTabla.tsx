import type { ReactNode } from 'react';


type GenericTableProps = {
  columns: string[];                 // Es una lista con los nombres de las columnas
  data: Record<string, any>[];       // lista de objetos, donde cada objeto representa una fila.
  actions?: (row: any) => ReactNode; // Funciones que devuelven botones (opcional)
  
};

const GenericTable = ({ columns, data, actions }: GenericTableProps) => {
  return (
    <div className="w-full overflow-x-auto shadow-md rounded-xl">
      <table className="w-full   border-collapse  rounded-xl overflow-hidden ">
        <thead>
          <tr className="bg-green-600 text-white ">
            {columns.map((col) => (
              <th key={col} className=" p-2 text-left font-semibold">
                {col}
              </th>
            ))}

            {/* Si hay acciones, agregamos columna vacía para los botones */}
            {actions && <th className=" p-2 font-semibold text-center">Acciones</th>}
          </tr>
        </thead>

        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="hover:bg-yellow-50 even:bg-gray-200  bg-gray-300  ">
              {columns.map((col) => (
                <td key={col} className=" p-2  ">
                  {row[col] instanceof Date ? (row[col] as Date).toLocaleString("es-AR") : row[col] } 
                </td>
              ))}

              {/* Render de las acciones (si existen) */}
              {actions && (
                <td className=" p-2 text-center justify-center gap-5">
                  {actions(row)}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GenericTable;