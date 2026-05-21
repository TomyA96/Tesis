import type React from "react";

type HeaderProps = {
  titulo: React.ReactNode;
  action?: React.ReactNode;
};

const Header = ({ titulo, action }: HeaderProps) => {
  return (
    // ✅ border-bottom separa visualmente el header de la tabla
    // ✅ padding uniforme px-7 py-5
    // ✅ Eliminé el mr-4 del action — era innecesario con justify-between
    <header className="flex items-center justify-between px-7 py-5 border-b border-gray-100">
      <h1 className="text-lg font-semibold text-gray-900 tracking-tight">
        {titulo}
      </h1>
      {action && <div>{action}</div>}
    </header>
  );
};

export default Header;