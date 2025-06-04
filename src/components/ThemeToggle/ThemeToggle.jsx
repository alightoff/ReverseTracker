import { useDarkMode } from "../../hooks/useDarkMode";
import { motion } from "framer-motion";

export default function ThemeToggle() {
  const [enabled, setEnabled] = useDarkMode();

  return (
    <motion.button
      onClick={() => setEnabled(!enabled)}
      className="w-8 h-8 flex items-center justify-center text-xl rounded-full bg-zinc-800 dark:bg-zinc-200 text-white dark:text-black hover:opacity-80 transition"
      whileTap={{ scale: 0.9 }}
      title={enabled ? "Светлая тема" : "Тёмная тема"}
    >
      {enabled ? "☀️" : "🌙"}
    </motion.button>
  );
}
