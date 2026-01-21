import { cn } from "../../../lib/cn";

type FormularioProps = React.FormHTMLAttributes<HTMLFormElement> & {
    children: React.ReactNode;
}

const Formulario = ({children, className, ...props}: FormularioProps) =>{
    return(
        <form className={cn("flex flex-col gap-3", className)}  {...props}>
            {children}
        </form>
    );
};

export default Formulario;