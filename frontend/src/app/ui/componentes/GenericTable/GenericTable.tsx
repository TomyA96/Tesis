import type { ReactNode } from "react";
import { renderCelda } from "../../../utils/genericTabla.utils";
/*<T> es genérico — T se reemplaza por el tipo real al usar el componente
  extends Record<string, any> significa: "T debe ser un objeto con propiedades"
  sin esto TypeScript no sabe que puede hacer row["nombre"], row["id"], etc.*/
type GenericTableProps<T extends Record<string, any>> = {
  columns: string[];
  data: T[];
  actions?: (row: T) => ReactNode;
  // ✅ Eliminé `titulo` de aquí — el título ahora vive en Header, no en la tabla
  // Nuevo prop — Partial porque no todas las columnas necesitan renderer
    // Record<string, ...> mapea nombre de columna → función que recibe el valor y devuelve JSX
    cellRenderers?: Partial<Record<string, (value: any) => ReactNode>>;
};

// ✅ Formatear el nombre de las columnas para que se vean bien
//    Convierte "nombreCompleto" → "Nombre Completo"
{/* Esto  convierte nombres de variables en texto legible.
  `/([A-Z])/g` es una **expresión regular** que busca todas las letras mayúsculas. Cuando encuentra una, 
  le agrega un espacio adelante (`" $1"` significa: espacio + la letra que encontré).
  **Paso 2:** `.replace(/^./, (s) => s.toUpperCase())`
  `/^./` significa: *"el primer carácter del texto"*. Lo convierte a mayúscula. */}
const formatColumnName = (col: string) =>
  col.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());



const GenericTable = <T extends Record<string, any>> ({ columns, data, actions, cellRenderers }: GenericTableProps<T>) => {
  return (
    // ✅ overflow-x-auto permite scroll horizontal en pantallas chicas (responsive)
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse">

        {/* ENCABEZADO */}
        <thead>
          
          <tr className="bg-gray-50 border-b-2 border-gray-200">
            {columns.map((col) => (
              <th
                key={col}
                /*tracking-wider Controla el espaciado entre letras */
                className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"

              >
                {/* ✅ formatColumnName convierte "id" → "ID", "nombre" → "Nombre" */}
                {col === "id" ? "#" : formatColumnName(col)}
              </th>
            ))}
            {actions && (
              // ✅ text-right alinea "Acciones" a la derecha, igual que los botones
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            )}
          </tr>
        </thead>

        {/* CUERPO */}
        <tbody>
          {data.length === 0 ? (
            // ✅ Estado vacío: si no hay datos, muestra un mensaje amigable
            <tr>
              <td
                colSpan={columns.length + (actions ? 1 : 0)}
                className="text-center py-12 text-gray-400 text-sm"
              >
                No hay datos para mostrar
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr
                key={i}
                // ✅ Hover sutil en gris claro — más profesional que amarillo
                // ✅ border-b en vez de filas alternadas de color — más limpio
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors last:border-none"
              >
                {columns.map((col) => (
                  <td key={col} className="px-6 py-4 text-sm text-gray-700">
                      {renderCelda(col, row[col], cellRenderers)}
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