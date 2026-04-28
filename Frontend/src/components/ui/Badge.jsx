const Badge = ({ text, variant }) => {
  const variants = {
    success: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    warning: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
    danger: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
    info: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  };
  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${variants[variant]}`}>{text}</span>
  );
};

export default Badge;
