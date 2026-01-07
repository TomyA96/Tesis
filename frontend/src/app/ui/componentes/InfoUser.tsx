
type InfoUserProps = {
    username: string;
    perfil: string;
   
};
/*Componente que muestra la informacion del usuario en el sidebar, se pasa como parametro el nombre de usuario y 
su perfil + el boton de cerrar sesion.*/
export function InfoUser({username, perfil}: InfoUserProps)  {
    return (
        
            <div className="p-4 border-t border-gray-700 rounded-xl w-5/6 m-auto">
                <h2 className="text-lg font-bold">{username}</h2>
                <p className="text-sm text-gray-400">{perfil}</p>
            </div>
            
            
       
        
    );
}   

export default InfoUser;
