import { useState } from "react";
import GlobalNavDrawer from "../GlobalNavDrawer/GlobalNavDrawer";
import { motion } from "framer-motion";
import ThemeToggle from "../ThemeToggle/ThemeToggle";
import { useCourseStore } from "../../store/courseStore"; // zustand store

export default function Header() {
  const [open, setOpen] = useState(false);
  const activeCourse = useCourseStore((state) => state.activeCourse); // теперь из zustand

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-50 px-4 py-2 flex justify-between items-center border-b backdrop-blur
        bg-white/70 dark:bg-zinc-900/70 border-zinc-200 dark:border-zinc-700">
        
        {/* Бургер-меню */}
        <motion.button
          onClick={() => setOpen(true)}
          whileTap={{ scale: 0.9 }}
          className="text-xl text-black dark:text-white sm:text-2xl"
        >
          ☰
        </motion.button>

        {/* Название проекта и активного курса */}
        <div className="flex flex-col items-center text-center text-hackerGreen">
          <h1 className="text-base font-bold sm:text-lg">Reverse Tracker</h1>
          {activeCourse && (
            <span className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
              {activeCourse.name}
            </span>
          )}
        </div>

        {/* Переключатель темы */}
        <div className="w-8 h-8 shrink-0">
          <ThemeToggle />
        </div>
      </header>

      {/* Выезжающее меню (бургер) */}
      <GlobalNavDrawer open={open} onClose={() => setOpen(false)} />
    </>
  );
}
