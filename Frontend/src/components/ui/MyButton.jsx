import React from "react";

const MyButton = ({ label, onClick, variant = "primary", isLoading, disabled }) => {
  const base = "px-4 py-2 rounded-xl font-semibold transition";
  const variants = {
    primary: "bg-teal-700 text-white hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-500",
    secondary: "bg-blue-900 text-white hover:bg-blue-950 dark:bg-blue-700 dark:hover:bg-blue-600",
    outline: "border border-white text-white hover:bg-white hover:text-teal-700 dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-teal-700",
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`${base} ${variants[variant]} ${(disabled || isLoading) ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {isLoading ? "Cargando..." : label}
    </button>
  );
};

export default MyButton;
