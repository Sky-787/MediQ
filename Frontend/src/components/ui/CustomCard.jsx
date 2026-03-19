const CustomCard = ({ children, className, title, footer }) => {
  return (
    <div className={`bg-white shadow-lg rounded-2xl p-5 ${className}`}>
      {title && <h3 className="text-lg font-bold mb-2">{title}</h3>}
      <div>{children}</div>
      {footer && <div className="mt-3">{footer}</div>}
    </div>
  );
};

export default CustomCard;