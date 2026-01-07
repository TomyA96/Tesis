
const DateRange = () => {
    return(
        <div className="flex  gap-4   ">
            
            <div className="flex flex-col">
                <label htmlFor="">Desde</label>
                <input type="date" 
                className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
            <div className="flex flex-col ">
                <label htmlFor="">Hasta</label>
                <input type="date" name="" id="" 
                className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                />
            </div>
        </div>
    );
}

export default DateRange;