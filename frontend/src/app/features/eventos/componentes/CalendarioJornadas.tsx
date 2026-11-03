import { DayPicker } from "react-day-picker";
import { es } from "react-day-picker/locale";
import "react-day-picker/style.css";

type CalendarioJornadasProps = {
    // Los días marcados, como Date en hora local (a las 00:00 del día)
    seleccionados: Date[];
    // Días que ya tienen una jornada cargada: se marcan, pero se pueden elegir igual
    diasCargados: Date[];
    onChange: (dias: Date[]) => void;
};

/*
    Calendario para marcar los días de las jornadas. No guarda nada: los días
    elegidos viven en el padre (GeneradorJornadas), que los convierte en filas.

    DayPicker devuelve cada día como Date en hora LOCAL, así que no tiene la
    trampa de new Date("AAAA-MM-DD"), que se interpreta en UTC y en Argentina
    cae el día anterior.
*/
const CalendarioJornadas = ({ seleccionados, diasCargados, onChange }: CalendarioJornadasProps) => {
    // Los días anteriores a hoy no se pueden elegir
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    return (
        <DayPicker
            mode="multiple"
            locale={es}
            selected={seleccionados}
            onSelect={(dias) => onChange(dias ?? [])}
            disabled={{ before: hoy }}
            // A diferencia de disabled, un modifier solo marca: el día sigue siendo elegible (puede haber dos jornadas el mismo día)
            modifiers={{ cargado: diasCargados }}
            modifiersClassNames={{
                cargado:
                    "relative after:absolute after:bottom-1 after:left-1/2 after:h-1 after:w-1 after:-translate-x-1/2 after:rounded-full after:bg-amber-500",
            }}
            // TODO: ajustar colores y tamaño con Tailwind (prop classNames) o con las variables CSS de la librería
        />
    );
};

export default CalendarioJornadas;
