import { AnimatePresence, motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";

const navLinks = [
  { label: "🏠 Курсы", to: "/" },
  { label: "📘 Структура курса", to: "/course" },
  { label: "📚 Мои курсы", to: "/my-courses" },
  { label: "📈 Прогресс", to: "/progress" },
  { label: "📅 Календарь", to: "/calendar" },
  { label: "🔁 Повтор темы", to: "/repeat-topics" },
  { label: "⏱ Таймер", to: "/timer" },
  { label: "📝 Заметки", to: "/notes" },
  { label: "✅ Планы", to: "/plans" },
  { label: "📊 Статистика", to: "/statistics" },
];

export default function GlobalNavDrawer({ open, onClose }) {
  const location = useLocation();

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            className="fixed left-0 top-0 h-full w-[250px] bg-white dark:bg-zinc-900 text-black dark:text-white z-50 p-6"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween" }}
          >
            <h2 className="text-xl font-bold mb-6 text-hackerGreen">Навигация</h2>
            <nav className="space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={onClose}
                  className={`block px-3 py-2 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 ${
                    location.pathname === link.to
                      ? "bg-zinc-200 dark:bg-zinc-700"
                      : ""
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
