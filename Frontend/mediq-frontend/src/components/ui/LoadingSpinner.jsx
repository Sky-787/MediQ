const LoadingSpinner = ({ size = "w-6 h-6", fullPage }) => {
  const spinner = (
    <div className={`animate-spin rounded-full border-4 border-teal-500 border-t-transparent ${size}`} />
  );

  if (fullPage) {
    return <div className="flex items-center justify-center h-screen">{spinner}</div>;
  }

  return spinner;
};

export default LoadingSpinner;