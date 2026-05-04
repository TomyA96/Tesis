
// components/GenericTable/GenericTable.tsx
import type { ReactNode } from "react";
import type { Column } from "../GenericTable/GenericTable.types";

type GenericTableProps<T extends {id: number | string}> = {
  columns: Column<T>[];   
  data: T[];
  actions?: (row: T) => ReactNode;
};

const GenericTable = <T extends {id: number | string}>({
  columns,
  data,
  actions,
}: GenericTableProps<T>) => {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse">

        <thead>
          <tr className="bg-gray-50 border-b-2 border-gray-200">
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
              >
                {col.label}   
              </th>
            ))}
            {actions && (
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            )}
          </tr>
        </thead>

        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + (actions ? 1 : 0)}
                className="text-center py-12 text-gray-400 text-sm"
              >
                No hay datos para mostrar
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr
                key={row.id}  // antes: key={i} con el índice — ahora usamos el id real
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors last:border-none"
              >
                {columns.map((col) => (
                  <td key={String(col.key)} className="px-6 py-4 text-sm text-gray-700">
                    {col.render
                      ? col.render(row[col.key], row)  // si tiene renderer, lo usa
                      : String(row[col.key] ?? "")}    
                  </td>
                ))}
                {actions && (
                  <td className="px-6 py-4">
                    <div className="flex gap-2 justify-center">
                      {actions(row)}
                    </div>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default GenericTable;