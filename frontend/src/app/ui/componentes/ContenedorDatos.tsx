import type React from "react";
import { cn } from "../../../lib/cn";

type ContDatosProps = React.HTMLAttributes<HTMLDivElement>  
    
    
const ContenedorDatos = ({className, children, ...Props}: ContDatosProps) => {
    
    return(
        <div className={cn("flex flex-col w-full px-6  bg-white p-4 rounded-xl shadow-md h-fit" , className )} 
        {...Props}>
            {children}
        </div>
    );
};

export default ContenedorDatos;