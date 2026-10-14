import { cn } from "../../../lib/cn";
import mosaico from "../../../assets/escudo-mosaico.png";

type FondoMosaicoProps = {
  // Permite ajustar el fondo en una página puntual (ej: "bg-size-[500px]").
  className?: string;
};

// Escudo repetido y tenue detrás del contenido de las páginas públicas.
// El <main> que lo contiene necesita "relative isolate" para que el fondo
// quede atrás del contenido y no se escape de la página.
const FondoMosaico = ({ className }: FondoMosaicoProps) => {
  return (
    <div
      aria-hidden="true"
      style={{ backgroundImage: `url(${mosaico})` }}
      className={cn(
        "absolute inset-0 -z-10 pointer-events-none opacity-10 bg-size-[400px] bg-repeat grayscale",
        className
      )}
    />
  );
};

export default FondoMosaico;
