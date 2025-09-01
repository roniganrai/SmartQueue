import React from "react";
import { Loader2 } from "lucide-react";

export default function ButtonWithSpinner({
  children,
  loading,
  className = "",
  ...rest
}) {
  return (
    <button
      {...rest}
      disabled={loading || rest.disabled}
      className={`inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg shadow-sm ${className} ${
        loading ? "opacity-80 cursor-not-allowed" : ""
      }`}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
      <span>{children}</span>
    </button>
  );
}
