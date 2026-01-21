import Sidebar from "./app/ui/navegacion/Sidebar";

import Ventas from "./app/features/eventos/pages/Ventas";


function App() {
  

  return (
    <>
      <div className="flex h-screen overflow-hidden">
        <Sidebar/>
        <main  className="flex-1 p-6 overflow-y-auto bg-gray-100">
           
          <Ventas/>
           
        </main>
        
      </div>
      
    </>
  )
}

export default App
