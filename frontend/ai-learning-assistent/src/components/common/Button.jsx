import React from "react";
const Button = ({
  children,
  onClick,
  type = "button",
  disabled = false,
  className = "",
  variant = "primary",
  size = "md",
}) => {
  const baseStyles =
    "inline-flex items-center justify-center rounded-lg transition-colors font-medium";
  const variantStyles = {
    primary: "bg-emerald-500 text-white hover:bg-emerald-600",
    secondary: "bg-slate-100 text-slate-700 hover:bg-slate-200",
    outline: "bg-white border-2 border-slate-200 hover:bg-slate-50",
  };
  const sizeStyle = {
    sm: "h-9 px-4 text-xs",
    md: "h-11 px-5 text-sm",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyle[size]} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
