
type CardProps = {
    title: string;
    content: string | number;
};
const Card = ({title, content}: CardProps) => {
  return (
    <div className="p-12 bg-white rounded-xl w-80 h-30  shadow-md  flex flex-col justify-center items-center text-gray-600"  >
        <h1 className="font-bold text-2xl ">{content}</h1>
        <span className="">{title}</span>
    </div>
    );
}

export default Card;