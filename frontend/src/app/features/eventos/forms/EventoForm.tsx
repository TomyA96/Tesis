import Formulario from "../../../ui/componentes/Formulario";
import Input from "../../../ui/componentes/Input";
import Btn from "../../../ui/componentes/Btn";
import type { ModoEventoPage } from "../pages/EventoPage";

type EventoFormProps = {
    modo: ModoEventoPage;
}   

const EventoForm = ({modo}: EventoFormProps) => {
    
    return (
        
        <Formulario autoComplete="off" className="border border-gray-200 rounded-lg p-4">
            <div>
                {modo!=="ver" &&  (<Input label="Nombre del Evento" name="nombre" type="text" required />)}
                <Input label="Fecha Inicio" name="fechaIni" type="date" disabled={modo==="ver"} />
                <Input label="Hora Inicio" name="horaIni" type="time" disabled={modo==="ver"} />
                
                <Input label="Fecha Fin" name="fechaFin" type="date" disabled={modo==="ver"} />
                <Input label="Hora Fin" name="horaFin" type="time" disabled={modo==="ver"} />
                <Input label="Lugar del Evento" name="lugar" type="text" disabled={modo==="ver"} />
                <Input label="Capacidad" name="capacidad" type="number"disabled={modo==="ver"} />
                <Input label="Descripción" name="descripcion" type="text" disabled={modo==="ver"} />
                <Input label="Imagen Promocional" name="imagen" type="file" accept="image/*" disabled={modo==="ver"} />
            </div>
            {modo !== "ver" && (<div className="flex justify-end gap-4 mt-4">
                <Btn type="submit" className="min-w-[150px]" >Guardar</Btn>
                <Btn variant="ghost" className="min-w-[150px]" type="reset" >Cancelar</Btn>
            </div>)}
            
        </Formulario>
    );
}

export default EventoForm;