import Sidebar from "./app/ui/navegacion/Sidebar";
import InicioEventos from "./app/features/eventos/pages/InicioEventos";


function App() {
  

  return (
    <>
      <div className="flex h-screen overflow-hidden">
        <Sidebar/>
        <main  className="flex-1 p-6 overflow-y-auto bg-gray-100">
           
        <InicioEventos/>
           
        </main>
        
      </div>
      
    </>
  )
}

export default App
