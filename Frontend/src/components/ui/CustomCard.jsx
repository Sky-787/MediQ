const CustomCard = ({ children, className = "", title, footer }) => {
  return (
    <div className={`bg-white dark:bg-gray-800 shadow-lg dark:shadow-gray-900 rounded-2xl p-5 ${className}`}>
      {title && <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">{title}</h3>}
      <div className="text-gray-700 dark:text-gray-300">{children}</div>
      {footer && <div className="mt-3">{footer}</div>}
    </div>
  );
};

export default CustomCard;
