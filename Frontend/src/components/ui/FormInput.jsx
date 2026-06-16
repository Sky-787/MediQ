import React from "react";

const FormInput = ({
  label,
  name,
  register,
  error,
  type = "text",
  placeholder,
}) => {
  const inputId = `field-${name}`;

  return (
    <div className="flex flex-col mb-4">
      {label && <label htmlFor={inputId} className="mb-1 font-medium">{label}</label>}

      <input
        id={inputId}
        type={type}
        placeholder={placeholder}
        {...register(name)}
        className={`border rounded-xl px-3 py-2 outline-none focus:ring-2 bg-white dark:bg-gray-800 dark:text-white dark:border-gray-600
        ${error ? "border-red-500 focus:ring-red-300 dark:border-red-600" : "border-gray-300 focus:ring-teal-500 dark:focus:ring-teal-400"}`}
      />

      {error && (
        <span className="text-red-500 text-sm mt-1">
          {error.message}
        </span>
      )}
    </div>
  );
};

export default FormInput;
