import type React from "react";



type HeaderProps = React.HtmlHTMLAttributes<HTMLElement> & {
    encabezado: React.ReactNode;
    action?: React.ReactNode;
};

const Header = ({encabezado, action}: HeaderProps) => {
    return (
        <header className="flex items-center justify-between mb-4 bg-white rounded-xl shadow-md p-6">
            {encabezado}
            {action && <div className="mr-4">{action}</div>}
        </header>
    );
}
export default Header;