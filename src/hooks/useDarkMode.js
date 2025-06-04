// src/hooks/useDarkMode.js
import { useEffect, useState } from "react";

export function useDarkMode() {
  const [enabled, setEnabled] = useState(
    localStorage.getItem("theme") === "dark"
  );

  useEffect(() => {
    const root = document.documentElement; // это html — правильно;
    if (enabled) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [enabled]);

  return [enabled, setEnabled];
}
