import { Link, type LinkProps } from "react-router-dom";
import { claseBtn, type Variant, type Size } from "./Btn";

/*
    Para navegación (lleva a otra ruta), no para acciones (mutar datos, abrir
    algo en el lugar) — eso sigue siendo Btn. Se ve idéntico a un botón, pero
    por debajo es un <a> de verdad: abrir en pestaña nueva, copiar link, etc.
    funcionan como se espera, cosa que un Btn con onClick={() => navigate(...)}
    no puede ofrecer.
*/
type LinkBtnProps = LinkProps & {
    variant?: Variant;
    size?: Size;
};

const LinkBtn = ({ variant = "primary", size = "md", className = "", ...props }: LinkBtnProps) => (
    <Link className={claseBtn(variant, size, className)} {...props} />
);

export default LinkBtn;
