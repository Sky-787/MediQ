const CustomCard = ({ children, className = '', title, footer }) => {
  return (
    <div className={`rounded-lg bg-white p-5 shadow-sm dark:bg-gray-800 ${className}`}>
      {title && <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">{title}</h3>}
      <div className="text-gray-700 dark:text-gray-300">{children}</div>
      {footer && <div className="mt-3">{footer}</div>}
    </div>
  )
}

export default CustomCard
