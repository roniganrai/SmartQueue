import React from "react";

export default function Spinner({ size = 5 }) {
  return (
    <div
      style={{ width: 20, height: 20 }}
      className="border-2 border-white border-t-transparent rounded-full animate-spin"
      role="status"
      aria-label="loading"
    />
  );
}
