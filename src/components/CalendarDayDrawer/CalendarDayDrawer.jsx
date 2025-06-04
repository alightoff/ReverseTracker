import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format, isToday } from "date-fns";
import { toast } from "react-toastify";
import confetti from "canvas-confetti";
import { useCourseStore } from "../../store/courseStore";

export default function CalendarDayDrawer({ date, onClose }) {
  const {
    activeCourse,
    setActiveCourse,
    topicStates,
    setTopicDoneWithDate,
    setTopicNote,
    setTopicRating,
    setTopicMinutes,
    handleRepeatTopic,
  } = useCourseStore();

  const [note, setNote] = useState("");
  const [customTopic, setCustomTopic] = useState("");
  const [minutes, setMinutes] = useState(15);
  const [rating, setRating] = useState(3);
  const [editingIndex, setEditingIndex] = useState(null);

  const formattedDate = date ? format(date, "yyyy-MM-dd") : null;

  // Кастомные занятия на дату
  const daySessions = useMemo(() => {
    if (!activeCourse || !formattedDate) return [];
    return activeCourse.sessions?.filter(
      (s) => format(new Date(s.date), "yyyy-MM-dd") === formattedDate
    ) || [];
  }, [activeCourse, formattedDate]);

  // Выполненные темы на дату
  const doneTopicsForDate = useMemo(() => {
    if (!activeCourse || !formattedDate) return [];
    return activeCourse.chapters.flatMap((chapter, ci) =>
      chapter.topics
        .map((topic, ti) => {
          const key = `${activeCourse.id}-c${ci}-t${ti}`;
          const state = topicStates[key];
          if (state?.done && state?.lastDoneDate?.startsWith(formattedDate)) {
            return {
              chapterIndex: ci,
              topicIndex: ti,
              title: typeof topic === "string" ? topic : topic.title,
              rating: state.rating || 3,
              minutes: state.minutes || 0,
              key,
            };
          }
          return null;
        })
        .filter(Boolean)
    );
  }, [activeCourse, topicStates, formattedDate]);

  useEffect(() => {
    setNote("");
    setCustomTopic("");
    setMinutes(15);
    setRating(3);
    setEditingIndex(null);
  }, [date]);

  if (!date || !activeCourse) return null;

  const updateSessions = (updatedSessions) => {
    const updatedCourse = {
      ...activeCourse,
      sessions: updatedSessions,
    };
    setActiveCourse(updatedCourse);
    localStorage.setItem("activeCourse", JSON.stringify(updatedCourse));
  };

  const handleAddOrEdit = () => {
    if (!customTopic.trim()) return toast.error("Введите тему");

    const session = {
      date: date.toISOString(),
      minutes,
      topicId: null,
      customTopic: customTopic.trim(),
      note,
      rating,
    };

    const updatedSessions =
      editingIndex !== null
        ? activeCourse.sessions.map((s, i) =>
            format(new Date(s.date), "yyyy-MM-dd") === formattedDate && i === editingIndex
              ? session
              : s
          )
        : [...(activeCourse.sessions || []), session];

    updateSessions(updatedSessions);

    if (isToday(date)) {
      confetti({ particleCount: 100, spread: 70 });
      toast.success("🎉 Отличное начало дня!");
    }

    toast.success(editingIndex !== null ? "Занятие обновлено" : "Занятие добавлено");

    setCustomTopic("");
    setNote("");
    setMinutes(15);
    setRating(3);
    setEditingIndex(null);
  };

  const handleEdit = (index) => {
    const session = daySessions[index];
    setCustomTopic(session.customTopic || "");
    setNote(session.note || "");
    setMinutes(session.minutes || 15);
    setRating(session.rating || 3);
    setEditingIndex(index);
  };

  const handleDeleteSession = (index) => {
    const updatedSessions = activeCourse.sessions.filter((s, i) =>
      !(format(new Date(s.date), "yyyy-MM-dd") === formattedDate && i === index)
    );
    updateSessions(updatedSessions);
    toast.success("Занятие удалено");
  };

  const handleRepeatTopicClick = (chapterIndex, topicIndex) => {
    handleRepeatTopic(chapterIndex, topicIndex);
    toast.info("🔄 Тема добавлена в раздел повторения");
  };

  const handleDeleteDoneTopic = (chapterIndex, topicIndex) => {
    setTopicDoneWithDate(chapterIndex, topicIndex, false, {
      date: null,
      rating: null,
      note: null,
      minutes: 0,
    });
    toast.success("Тема удалена из выполненных");
  };

  return (
    <AnimatePresence>
      <motion.div
        key={formattedDate}
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white dark:bg-zinc-900 shadow-lg z-50 p-6 overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-hackerGreen">
            {format(date, "dd MMMM yyyy")}
          </h2>
          <button
            onClick={() => onClose(false)}
            className="text-zinc-500 hover:text-zinc-800 dark:hover:text-white"
          >
            ✖️
          </button>
        </div>

        <div className="space-y-6">
          {/* Кастомные занятия */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Мои занятия</h3>
            {daySessions.length === 0 ? (
              <p className="text-zinc-500 text-sm">Нет данных за этот день.</p>
            ) : (
              daySessions.map((session, index) => {
                if (session.customTopic) {
                  return (
                    <div
                      key={index}
                      className="p-3 border border-zinc-300 dark:border-zinc-700 rounded bg-zinc-100 dark:bg-zinc-800 relative"
                    >
                      <p className="text-sm">
                        📝 {session.customTopic}
                      </p>
                      <p className="text-xs text-zinc-500">
                        Минут: {session.minutes} • Оценка: {session.rating}/5
                        {session.note && ` • Заметка: ${session.note}`}
                      </p>
                      <div className="absolute top-2 right-2 flex gap-2">
                        <button
                          onClick={() => handleEdit(index)}
                          className="text-xs text-blue-500 hover:underline"
                        >
                          Редактировать
                        </button>
                        <button
                          onClick={() => handleDeleteSession(index)}
                          className="text-xs text-red-500 hover:underline"
                        >
                          Удалить
                        </button>
                      </div>
                    </div>
                  );
                }

                let chapterIndex = null;
                let topicIndex = null;
                for (let ci = 0; ci < activeCourse.chapters.length; ci++) {
                  const ti = activeCourse.chapters[ci].topics.findIndex(
                    (t) => t.id === session.topicId
                  );
                  if (ti !== -1) {
                    chapterIndex = ci;
                    topicIndex = ti;
                    break;
                  }
                }

                const topicTitle =
                  chapterIndex !== null && topicIndex !== null
                    ? typeof activeCourse.chapters[chapterIndex].topics[topicIndex] ===
                      "string"
                      ? activeCourse.chapters[chapterIndex].topics[topicIndex]
                      : activeCourse.chapters[chapterIndex].topics[topicIndex].title
                    : "Неизвестная тема";

                return (
                  <div
                    key={index}
                    className="p-3 border border-zinc-300 dark:border-zinc-700 rounded bg-zinc-100 dark:bg-zinc-800 relative"
                  >
                    <p className="text-sm">
                      📚 {topicTitle}
                    </p>
                    <p className="text-xs text-zinc-500">
                      Минут: {session.minutes} • Оценка: {session.rating}/5
                    </p>
                    <div className="absolute top-2 right-2 flex gap-2">
                      <button
                        onClick={() => handleEdit(index)}
                        className="text-xs text-blue-500 hover:underline"
                      >
                        Редактировать
                      </button>
                      <button
                        onClick={() => handleDeleteSession(index)}
                        className="text-xs text-red-500 hover:underline"
                      >
                        Удалить
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Выполненные темы */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Пройденные темы</h3>
            {doneTopicsForDate.length === 0 ? (
              <p className="text-zinc-500 text-sm">Нет выполненных тем на эту дату.</p>
            ) : (
              doneTopicsForDate.map(({ chapterIndex, topicIndex, title, rating, minutes, key }) => (
                <div
                  key={key}
                  className="p-3 border border-green-500 rounded mb-2 bg-green-50 dark:bg-green-900 relative"
                >
                  <p className="font-semibold">{title}</p>
                  <p>Минут: {minutes} • Оценка: {rating}/5</p>
                  <div className="flex gap-2 mt-2">
                    <button
                      className="px-3 py-1 bg-red-500 text-white rounded"
                      onClick={() => handleDeleteDoneTopic(chapterIndex, topicIndex)}
                    >
                      Удалить
                    </button>
                    <button
                      className="px-3 py-1 bg-blue-600 text-white rounded"
                      onClick={() => handleRepeatTopicClick(chapterIndex, topicIndex)}
                    >
                      Повторить
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Форма добавления/редактирования кастомной темы */}
          <div>
            <h3 className="text-md font-semibold mb-2">
              {editingIndex !== null ? "Редактировать занятие" : "Добавить свою тему"}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">
              📌 Укажите тему и минуту — активность появится на календаре
            </p>

            <label className="text-sm text-zinc-400 dark:text-zinc-500">
              Название темы:
            </label>
            <input
              type="text"
              placeholder="Например: Решал задачи на циклы"
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white rounded mb-2"
            />

            <label className="text-sm text-zinc-400 dark:text-zinc-500">
              Заметка:
            </label>
            <textarea
              placeholder="Что именно делал, трудности, выводы..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white rounded mb-2"
            />

            <div className="flex gap-2 mb-2">
              <div className="w-1/2">
                <label className="text-sm text-zinc-400 dark:text-zinc-500">
                  Минут:
                </label>
                <input
                  type="number"
                  min="1"
                  max="300"
                  value={minutes}
                  onChange={(e) => setMinutes(Number(e.target.value))}
                  className="w-full px-2 py-1 border border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white rounded"
                />
              </div>
              <div className="w-1/2">
                <label className="text-sm text-zinc-400 dark:text-zinc-500">
                  Оценка:
                </label>
                <select
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="w-full px-2 py-1 border border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white rounded"
                >
                  <option value="1">😴 1</option>
                  <option value="2">😐 2</option>
                  <option value="3">🙂 3</option>
                  <option value="4">😎 4</option>
                  <option value="5">🔥 5</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleAddOrEdit}
              className="px-4 py-2 bg-hackerGreen text-black rounded hover:opacity-90 w-full"
            >
              {editingIndex !== null ? "💾 Сохранить изменения" : "➕ Добавить свою тему"}
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
