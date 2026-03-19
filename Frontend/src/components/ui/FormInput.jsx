import React from "react";

const FormInput = ({
  label,
  name,
  register,
  error,
  type = "text",
  placeholder,
}) => {
  return (
    <div className="flex flex-col mb-4">
      {label && <label className="mb-1 font-medium">{label}</label>}

      <input
        type={type}
        placeholder={placeholder}
        {...register(name)}
        className={`border rounded-xl px-3 py-2 outline-none focus:ring-2 
        ${error ? "border-red-500 focus:ring-red-300" : "focus:ring-teal-500"}`}
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