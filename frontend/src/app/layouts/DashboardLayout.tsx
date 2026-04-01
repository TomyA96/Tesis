import Sidebar from "../ui/navegacion/Sidebar"
import { Outlet } from "react-router-dom";

    
const DashboardLayout = () => {  
    return (
        <div className="flex h-screen">
            {/* Barra lateral de navegación */}
            <Sidebar />
            {/* Contenido principal */}
            <main className="flex-1 p-4 bg-[#E8E8E8] overflow-y-auto">
                <Outlet />
            </main>
        </div>
    );
}
export default DashboardLayout;