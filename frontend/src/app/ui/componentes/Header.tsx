


type HeaderProps = React.HtmlHTMLAttributes<HTMLElement> & {
    title: string;
    action?: React.ReactNode;
};

const Header = ({title, action}: HeaderProps) => {
    return (
        <header className="flex items-center justify-between mb-4 bg-white rounded-xl shadow-md p-6">
            <h1 className="font-bold text-2xl p-4">{title}</h1>
            {action && <div className="mr-4">{action}</div>}
        </header>
    );
}
export default Header;