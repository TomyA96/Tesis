import { cn } from "../../../lib/cn";

type FormProps = React.ComponentProps<"form"> & {
    children: React.ReactNode;
}

const Formulario = ({children, className, ...props}: FormProps) =>{
    return(
        <form className={cn("flex flex-col gap-3", className)}  {...props}>
            {children}
        </form>
    );
};

export default Formulario;