
type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

const Input = ({ label, className = "", ...props }: InputProps) => {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium">{label}</label>}

      <input
        className={
          "border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none " +
          className
        }
        {...props}
      />
    </div>
  );
};

export default Input;