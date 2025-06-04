import { useEffect, useState, useMemo } from "react";
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  isToday,
  isAfter,
  getDay,
} from "date-fns";
import { useCourseStore } from "../../store/courseStore";
import { motion } from "framer-motion";
import CalendarDayDrawer from "../../components/CalendarDayDrawer/CalendarDayDrawer";
import Header from "../../components/Header/Header";

function getWeekdayIndex(date) {
  const day = getDay(date);
  return day === 0 ? 6 : day - 1;
}

export default function CalendarPage() {
  const activeCourse = useCourseStore((state) => state.activeCourse);
  const topicStates = useCourseStore((state) => state.topicStates);
  const [days, setDays] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [refreshKey, setRefreshKey] = useState(0);

  const sessions = activeCourse?.sessions || [];

  // Считаем суммарные минуты на каждый день из кастомных сессий и тем с done
  const sessionMap = useMemo(() => {
    const map = {};

    // Добавляем кастомные сессии
    for (const s of sessions) {
      const key = format(new Date(s.date), "yyyy-MM-dd");
      map[key] = (map[key] || 0) + s.minutes;
    }

    // Добавляем темы с done и их minutes
    if (activeCourse && topicStates) {
      activeCourse.chapters.forEach((chapter, ci) => {
        chapter.topics.forEach((topic, ti) => {
          const keyTopic = `${activeCourse.id}-c${ci}-t${ti}`;
          const state = topicStates[keyTopic];
          if (state?.done && state.lastDoneDate) {
            const dateKey = state.lastDoneDate.slice(0, 10);
            map[dateKey] = (map[dateKey] || 0) + (state.minutes || 0);
          }
        });
      });
    }

    return map;
  }, [sessions, activeCourse, topicStates]);

  useEffect(() => {
    const start = startOfMonth(new Date(currentYear, currentMonth));
    const end = endOfMonth(start);
    const daysArray = eachDayOfInterval({ start, end });

    const startWeekday = getWeekdayIndex(start);
    const prevMonth = new Date(currentYear, currentMonth, 0);
    const daysInPrevMonth = prevMonth.getDate();

    const prevMonthDays = Array(startWeekday)
      .fill(0)
      .map((_, i) =>
        new Date(currentYear, currentMonth - 1, daysInPrevMonth - startWeekday + i + 1)
      );

    const fullDays = [...prevMonthDays, ...daysArray];

    const totalCells = 42;
    const nextMonthDays = Array(totalCells - fullDays.length)
      .fill(0)
      .map((_, i) => new Date(currentYear, currentMonth + 1, i + 1));

    const paddedDaysArray = [...fullDays, ...nextMonthDays];

    setDays(paddedDaysArray);
  }, [currentMonth, currentYear, refreshKey]);

  const getColor = (date) => {
    if (!date) return "bg-transparent";

    const isCurrentMonth = date.getMonth() === currentMonth;

    if (!isCurrentMonth)
      return "border border-zinc-300 dark:border-zinc-700 text-zinc-400";

    if (isAfter(date, new Date()))
      return "bg-zinc-200 dark:bg-zinc-800 text-zinc-400";

    const formatted = format(date, "yyyy-MM-dd");
    const totalMinutes = sessionMap[formatted] || 0;

    if (totalMinutes === 0)
      return "bg-zinc-300 dark:bg-zinc-700 text-zinc-500";

    return totalMinutes > 40
      ? "bg-green-500 text-white"
      : "bg-yellow-400 text-black";
  };

  const handleDayClick = (date) => {
    if (
      !date ||
      date.getMonth() !== currentMonth ||
      isAfter(date, new Date())
    )
      return;
    setSelectedDate(date);
  };

  const handleDrawerClose = (shouldRefresh = false) => {
    setSelectedDate(null);
    if (shouldRefresh) {
      setRefreshKey((k) => k + 1);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-hackerBlack text-black dark:text-white transition-colors duration-300 relative">
      <Header />

      <main className="pt-20 px-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => {
              setCurrentMonth((prev) => (prev === 0 ? 11 : prev - 1));
              if (currentMonth === 0) setCurrentYear((y) => y - 1);
            }}
            className="text-sm px-2 py-1 rounded bg-zinc-200 dark:bg-zinc-800"
          >
            ← Пред
          </button>

          <h1 className="text-xl font-bold text-emerald-600 dark:text-hackerGreen">
            {format(new Date(currentYear, currentMonth), "LLLL yyyy")}
          </h1>

          <button
            onClick={() => {
              setCurrentMonth((prev) => (prev === 11 ? 0 : prev + 1));
              if (currentMonth === 11) setCurrentYear((y) => y + 1);
            }}
            className="text-sm px-2 py-1 rounded bg-zinc-200 dark:bg-zinc-800"
          >
            След →
          </button>
        </div>

        <div className="grid grid-cols-7 gap-2 text-center">
          {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map((day, i) => (
            <div key={i} className="font-semibold">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2 mt-2">
          {days.map((date, index) => {
            const isFuture = date && isAfter(date, new Date());
            const isCurrent = date?.getMonth() === currentMonth;

            return (
              <motion.div
                key={index}
                onClick={() => handleDayClick(date)}
                className={`aspect-square rounded flex items-center justify-center font-medium transition-colors
                  ${getColor(date)}
                  ${isToday(date) ? "ring-2 ring-hackerGreen" : ""}
                  ${!isCurrent || isFuture ? "cursor-not-allowed" : "cursor-pointer"}`}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.01 }}
              >
                {date ? format(date, "d") : ""}
              </motion.div>
            );
          })}
        </div>

        <div className="mt-6 text-sm text-zinc-500 dark:text-zinc-400">
          🟢 &gt; 40 мин | 🟡 ≤ 40 мин | 🔘 нет активности<br />
          ✨ Добавьте свою тему и укажите минуту — цвет появится на календаре
        </div>
      </main>

      <CalendarDayDrawer date={selectedDate} onClose={handleDrawerClose} />
    </div>
  );
}
