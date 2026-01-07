

type FormularioProps = React.FormHTMLAttributes<HTMLFormElement> & {
    children: React.ReactNode;
}

const Formulario = ({children, ...props}: FormularioProps) =>{
    return(
        <form className="flex flex-col gap-4" {...props}>
            {children}
        </form>
    );
};

export default Formulario;