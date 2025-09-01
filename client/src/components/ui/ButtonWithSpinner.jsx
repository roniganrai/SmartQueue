import React from "react";
import Spinner from "./Spinner";

export default function ButtonWithSpinner({
  children,
  loading = false,
  className = "",
  ...props
}) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition ${className} ${
        loading ? "opacity-80 pointer-events-none" : ""
      }`}
    >
      {loading && <Spinner size={4} />}
      <span>{children}</span>
    </button>
  );
}
