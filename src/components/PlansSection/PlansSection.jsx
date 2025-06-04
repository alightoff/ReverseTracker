// src/components/PlansSection.jsx
import React, { useState, useMemo } from "react";
import { usePlanStore } from "../../store/courseStore";
import { v4 as uuidv4 } from "uuid";
import {
  format,
  parseISO,
  isBefore,
  isAfter,
  isSameDay,
  addDays,
} from "date-fns";
import { Card, CardContent } from "../ui/card";
import {
  FaTrash,
  FaEdit,
  FaExclamationCircle,
  FaCalendarAlt,
  FaChevronLeft,
  FaChevronRight,
  FaTimes,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

function ScheduleModal({ isOpen, onClose, plans, initialDate }) {
  const [viewDate, setViewDate] = useState(parseISO(initialDate));

  // Задачи, охватывающие viewDate
  const tasksForDate = useMemo(() => {
    return plans.filter((p) => {
      const sd = parseISO(p.startDate);
      const ed = parseISO(p.endDate);
      return !p.done && !isBefore(viewDate, sd) && !isAfter(viewDate, ed);
    });
  }, [plans, viewDate]);

  // Весьдневные задачи (all-day)
  const allDay = useMemo(() => {
    return tasksForDate.filter((p) => {
      const sd = parseISO(p.startDate);
      const ed = parseISO(p.endDate);
      // Если диапазон >1 день или нет времени
      if (!p.startTime || !p.endTime) {
        return true;
      }
      // Если диапазон включительно охватывает viewDate, но times есть только если sd===ed===viewDate
      if (!isSameDay(sd, viewDate) || !isSameDay(ed, viewDate)) {
        return true;
      }
      return false;
    });
  }, [tasksForDate, viewDate]);

  // Тайм-зависимые задачи (timed)
  const timed = useMemo(() => {
    return tasksForDate.filter((p) => {
      const sd = parseISO(p.startDate);
      const ed = parseISO(p.endDate);
      return (
        p.startTime &&
        p.endTime &&
        isSameDay(sd, viewDate) &&
        isSameDay(ed, viewDate)
      );
    });
  }, [tasksForDate, viewDate]);

  const hourHeight = 40; // 40px на час (24*40 = 960px)

  const prevDay = () => setViewDate((d) => addDays(d, -1));
  const nextDay = () => setViewDate((d) => addDays(d, 1));

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white dark:bg-zinc-900 rounded-lg w-full max-w-3xl mx-4 overflow-hidden"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            {/* Заголовок модалки */}
            <div className="flex items-center justify-between p-4 border-b dark:border-zinc-700">
              <div className="flex items-center gap-2">
                <button
                  onClick={prevDay}
                  className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded"
                >
                  <FaChevronLeft className="text-xl text-zinc-700 dark:text-zinc-300" />
                </button>
                <h3 className="text-lg font-semibold text-black dark:text-white">
                  Расписание на {format(viewDate, "yyyy-MM-dd")}
                </h3>
                <button
                  onClick={nextDay}
                  className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded"
                >
                  <FaChevronRight className="text-xl text-zinc-700 dark:text-zinc-300" />
                </button>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded"
              >
                <FaTimes className="text-xl text-zinc-700 dark:text-zinc-300" />
              </button>
            </div>

            {/* Содержимое модалки */}
            <div className="p-4 max-h-[80vh] overflow-y-auto">
              {/* All-day задачи */}
              {allDay.length > 0 && (
                <div className="mb-6">
                  <p className="text-sm text-zinc-500 mb-2">Весь день</p>
                  <div className="flex flex-wrap gap-2">
                    {allDay.map((p) => (
                      <div
                        key={p.id}
                        className={`
                          px-3 py-1 rounded flex items-center gap-1
                          ${p.priority === "high"
                            ? "bg-red-200 dark:bg-red-700"
                            : "bg-green-200 dark:bg-green-700"
                          }
                        `}
                      >
                        <span className="text-sm font-medium text-black dark:text-white">
                          {p.title}
                        </span>
                        {p.priority === "high" && (
                          <FaExclamationCircle className="text-red-600 dark:text-red-300" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Таймлайн */}
              <div
                className="relative border rounded overflow-hidden"
                style={{ height: `${24 * hourHeight}px` }}
              >
                {/* Линии часов */}
                {Array.from({ length: 25 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute left-0 right-0 h-[1px] bg-zinc-200 dark:bg-zinc-600"
                    style={{ top: `${i * hourHeight}px` }}
                  />
                ))}

                {/* Метки часов слева */}
                <div className="absolute left-0 top-0 flex flex-col text-xs text-zinc-500 dark:text-zinc-400 w-12 ml-2">
                  {Array.from({ length: 24 }).map((_, i) => (
                    <div
                      key={i}
                      style={{
                        height: `${hourHeight}px`,
                        lineHeight: `${hourHeight}px`,
                      }}
                    >
                      {String(i).padStart(2, "0")}:00
                    </div>
                  ))}
                </div>

                {/* Контейнер для задач с отступами */}
                <div className="absolute left-12 right-0 top-0 px-2">
                  <AnimatePresence>
                    {timed.map((p) => {
                      const [sh, sm] = p.startTime.split(":").map(Number);
                      const [eh, em] = p.endTime.split(":").map(Number);
                      const startMinutes = sh * 60 + sm;
                      const endMinutes = eh * 60 + em;
                      const duration = Math.max(endMinutes - startMinutes, 30);
                      const topPos = (startMinutes / 60) * hourHeight;
                      const heightPx = (duration / 60) * hourHeight;

                      return (
                        <motion.div
                          key={p.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.2 }}
                          className={`
                            absolute left-0 right-0 rounded px-2 py-1
                            ${p.priority === "high"
                              ? "bg-red-300 dark:bg-red-600"
                              : "bg-green-300 dark:bg-green-600"
                            }
                          `}
                          style={{ top: `${topPos}px`, height: `${heightPx}px` }}
                          title={`${p.title} (${p.startTime}—${p.endTime})`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-black dark:text-white">
                              {p.title}
                            </span>
                            {p.priority === "high" && (
                              <FaExclamationCircle className="text-red-700 dark:text-red-300 text-sm" />
                            )}
                          </div>
                          <span className="text-[10px] text-gray-700 dark:text-zinc-300">
                            {p.startTime}—{p.endTime}
                          </span>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function PlansSection() {
  const { plans, addPlan, togglePlanDone, removePlan, updatePlan } = usePlanStore();

  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [isEditingId, setIsEditingId] = useState(null);

  const [isModalOpen, setModalOpen] = useState(false);
  const [modalDate, setModalDate] = useState(format(new Date(), "yyyy-MM-dd"));

  const handleSave = () => {
    if (!title.trim() || !startDate || !endDate) return;

    if (parseISO(endDate) < parseISO(startDate)) return;

    const newPlan = {
      id: isEditingId || uuidv4(),
      title: title.trim(),
      startDate,
      endDate,
      startTime: startTime || null,
      endTime: endTime || null,
      description: description.trim(),
      done: false,
      priority,
    };

    if (isEditingId) {
      updatePlan(isEditingId, newPlan);
      setIsEditingId(null);
    } else {
      addPlan(newPlan);
    }

    setTitle("");
    setStartDate("");
    setEndDate("");
    setStartTime("");
    setEndTime("");
    setDescription("");
    setPriority("medium");
  };

  const startEditing = (plan) => {
    setIsEditingId(plan.id);
    setTitle(plan.title);
    setStartDate(plan.startDate);
    setEndDate(plan.endDate);
    setStartTime(plan.startTime || "");
    setEndTime(plan.endTime || "");
    setDescription(plan.description || "");
    setPriority(plan.priority || "medium");
  };

  const now = new Date();
  const today = parseISO(format(now, "yyyy-MM-dd"));

  // Просроченные: endDate < today, либо endDate===today и endTime < now
  const overduePlans = useMemo(() => {
    return plans.filter((p) => {
      const ed = parseISO(p.endDate);
      if (isBefore(ed, today)) return !p.done;
      if (isSameDay(ed, today) && p.endTime) {
        const [eh, em] = p.endTime.split(":").map(Number);
        const endDateTime = new Date(ed);
        endDateTime.setHours(eh, em, 0, 0);
        return endDateTime < now && !p.done;
      }
      return false;
    });
  }, [plans, today, now]);

  // На сегодня: startDate ≤ today ≤ endDate
  const todayPlans = useMemo(() => {
    return plans.filter((p) => {
      const sd = parseISO(p.startDate);
      const ed = parseISO(p.endDate);
      return !p.done && !isBefore(today, sd) && !isAfter(today, ed);
    });
  }, [plans, today]);

  // Будущие: startDate > today
  const futurePlans = useMemo(() => {
    return plans.filter((p) => {
      const sd = parseISO(p.startDate);
      return !p.done && isAfter(sd, today);
    });
  }, [plans, today]);

  const donePlans = useMemo(() => plans.filter((p) => p.done), [plans]);

  const weight = (plan) => (plan.priority === "high" ? 2 : 1);

  const totalCount = plans.reduce((sum, p) => sum + weight(p), 0);
  const doneCount = donePlans.reduce((sum, p) => sum + weight(p), 0);
  const overdueCount = overduePlans.reduce((sum, p) => sum + weight(p), 0);
  const upcomingCount =
    todayPlans
      .filter((p) => !overduePlans.includes(p))
      .reduce((sum, p) => sum + weight(p), 0) +
    futurePlans.reduce((sum, p) => sum + weight(p), 0);

  return (
    <div className="max-w-2xl mx-auto mt-10">
      <Card>
        <CardContent>
          <h2 className="text-2xl font-bold mb-4">Планы</h2>

          {/* Форма добавления / редактирования */}
          <div className="space-y-2 mb-6">
            <input
              type="text"
              className="w-full border rounded p-2 bg-white text-black placeholder-zinc-500
                         dark:bg-zinc-800 dark:text-white dark:placeholder-zinc-400 dark:border-zinc-600 focus:outline-none focus:ring-2 focus:ring-hackerBlue"
              placeholder="Название плана"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="date"
                className="border rounded p-2 bg-white text-black
                           dark:bg-zinc-800 dark:text-white dark:border-zinc-600 focus:outline-none focus:ring-2 focus:ring-hackerBlue flex-1"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <input
                type="date"
                className="border rounded p-2 bg-white text-black
                           dark:bg-zinc-800 dark:text-white dark:border-zinc-600 focus:outline-none focus:ring-2 focus:ring-hackerBlue flex-1"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            {/* Поля времени, если startDate === endDate */}
            {startDate && endDate && startDate === endDate && (
              <div className="flex gap-2">
                <input
                  type="time"
                  className="border rounded p-2 bg-white text-black
                             dark:bg-zinc-800 dark:text-white dark:border-zinc-600 focus:outline-none focus:ring-2 focus:ring-hackerBlue flex-1"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
                <input
                  type="time"
                  className="border rounded p-2 bg-white text-black
                             dark:bg-zinc-800 dark:text-white dark:border-zinc-600 focus:outline-none focus:ring-2 focus:ring-hackerBlue flex-1"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            )}

            <textarea
              className="w-full border rounded p-2 bg-white text-black placeholder-zinc-500
                         dark:bg-zinc-800 dark:text-white dark:placeholder-zinc-400 dark:border-zinc-600 focus:outline-none focus:ring-2 focus:ring-hackerBlue"
              placeholder="Описание (опционально)"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <select
              className="border rounded p-2 bg-white text-black
                         dark:bg-zinc-800 dark:text-white dark:border-zinc-600 focus:outline-none focus:ring-2 focus:ring-hackerBlue w-full"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="low">Низкий приоритет</option>
              <option value="medium">Средний приоритет</option>
              <option value="high">Высокий приоритет</option>
            </select>

            <button
              className="bg-hackerBlue text-white px-4 py-2 rounded hover:bg-hackerGreen disabled:opacity-50 transition-colors w-full"
              onClick={handleSave}
              disabled={!title.trim() || !startDate || !endDate}
            >
              {isEditingId ? "Сохранить изменения" : "Добавить план"}
            </button>
          </div>

          {/* Краткая статистика по планам */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <p className="text-sm text-zinc-500">Всего «вес»</p>
              <p className="text-xl font-bold">{totalCount}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-zinc-500">Выполнено</p>
              <p className="text-xl font-bold">{doneCount}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-zinc-500">Просрочено</p>
              <p className="text-xl font-bold">{overdueCount}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-zinc-500">Будущие</p>
              <p className="text-xl font-bold">{upcomingCount}</p>
            </div>
          </div>

          {/* Список задач */}
          <div className="space-y-6">
            {[
              {
                title: "Просроченные",
                items: overduePlans,
                colorClass: "text-red-500",
              },
              {
                title: "На сегодня",
                items: todayPlans,
                colorClass: "text-green-600",
              },
              {
                title: "Будущие",
                items: futurePlans,
                colorClass: "text-gray-600",
              },
              {
                title: "Выполнено",
                items: donePlans,
                colorClass: "text-green-700",
                doneList: true,
              },
            ].map((group) => {
              if (group.items.length === 0) return null;
              return (
                <div key={group.title}>
                  <h3 className={`text-lg font-semibold mb-2 ${group.colorClass}`}>
                    {group.title}
                  </h3>
                  <ul className="space-y-2">
                    <AnimatePresence>
                      {group.items.map((p) => {
                        const sd = parseISO(p.startDate);
                        const ed = parseISO(p.endDate);
                        return (
                          <motion.li
                            key={p.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                            className={`
                              flex items-center justify-between p-3 border rounded 
                              bg-white dark:bg-zinc-800 dark:border-zinc-600
                              ${group.doneList ? "opacity-70" : ""}
                            `}
                          >
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={p.done}
                                onChange={() => togglePlanDone(p.id)}
                                className="accent-hackerGreen"
                              />
                              <div className="flex flex-col">
                                <div className="flex items-center gap-1">
                                  <p className="font-medium text-black dark:text-white">
                                    {p.title}
                                  </p>
                                  {p.priority === "high" && (
                                    <FaExclamationCircle className="text-red-500 dark:text-red-300" />
                                  )}
                                </div>
                                <p className="text-xs text-gray-500 dark:text-zinc-400">
                                  {p.startDate} – {p.endDate}
                                  {p.startTime &&
                                    p.endTime &&
                                    isSameDay(sd, ed) && (
                                      <> ({p.startTime}—{p.endTime})</>
                                    )}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              {!group.doneList && (
                                <button onClick={() => startEditing(p)}>
                                  <FaEdit className="text-blue-500 hover:text-blue-700" />
                                </button>
                              )}
                              <button onClick={() => removePlan(p.id)}>
                                <FaTrash className="text-red-500 hover:text-red-700" />
                              </button>
                            </div>
                          </motion.li>
                        );
                      })}
                    </AnimatePresence>
                  </ul>
                </div>
              );
            })}
          </div>

          {/* Кнопка для открытия модального расписания */}
          <div className="mt-6 text-center">
            <button
              className="inline-flex items-center gap-2 bg-hackerBlue text-white px-4 py-2 rounded hover:bg-hackerGreen transition-colors"
              onClick={() => {
                setModalDate(format(today, "yyyy-MM-dd"));
                setModalOpen(true);
              }}
            >
              <FaCalendarAlt /> Открыть расписание
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Модальное окно */}
      <ScheduleModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        plans={plans}
        initialDate={modalDate}
      />
    </div>
  );
}
