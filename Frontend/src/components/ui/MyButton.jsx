import React from "react";

const MyButton = ({ label, onClick, variant = "primary", isLoading, disabled }) => {
  const base = "px-4 py-2 rounded-xl font-semibold transition";

  const variants = {
    primary: "bg-teal-700 text-white hover:bg-teal-800",
    secondary: "bg-blue-900 text-white hover:bg-blue-950",
    outline: "border border-teal-700 text-teal-700 hover:bg-teal-100",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`${base} ${variants[variant]} ${disabled && "opacity-50"}`}
    >
      {isLoading ? "Cargando..." : label}
    </button>
  );
};

export default MyButton;