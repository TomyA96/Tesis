import Btn from "./Btn";
type ModalProps ={
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
};

const Modal = ({isOpen, onClose, title, children}: ModalProps) => {
    if (!isOpen) return null;
    return(
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Overlay */}
            <div
            className="absolute inset-0 bg-black/50"
            onClick={onClose}
            />
            <div className="relative bg-white rounded-lg   p-6 z-10">
                <div className="flex justify-between mb-4">
                    {/* Header */}
                    {title && <h2 className="text-2xl font-bold">{title}</h2>}
                    
                    <Btn 
                    variant="danger"
                    size="sm"
                    onClick={onClose}
                    >
                        X
                    </Btn>
                </div>
                <div>
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;