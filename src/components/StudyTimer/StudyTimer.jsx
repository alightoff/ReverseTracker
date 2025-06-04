import { useEffect, useState, useRef } from "react";
import { useCourseStore } from "../../store/courseStore";
import { toast } from "react-toastify";

const TIMER_STORAGE_KEY = "studyTimerState";

export default function StudyTimer() {
  const activeCourse = useCourseStore((state) => state.activeCourse);
  const setTopicDoneWithDate = useCourseStore((state) => state.setTopicDoneWithDate);
  const setTopicNote = useCourseStore((state) => state.setTopicNote);
  const setTopicRating = useCourseStore((state) => state.setTopicRating);
  const activeCourseSetActiveCourse = useCourseStore((state) => state.setActiveCourse);

  // Состояния таймера
  const [selectedChapterIndex, setSelectedChapterIndex] = useState(0);
  const [selectedTopicIndex, setSelectedTopicIndex] = useState(null); // null — если своя тема
  const [customTopic, setCustomTopic] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(25);
  const [timeLeft, setTimeLeft] = useState(durationMinutes * 60); // секунды
  const [isRunning, setIsRunning] = useState(false);

  const timerIdRef = useRef(null);

  // Загрузка состояния таймера из localStorage
  useEffect(() => {
    const saved = localStorage.getItem(TIMER_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Проверяем, что сохранённый курс совпадает с активным
        if (activeCourse && parsed.courseId === activeCourse.id) {
          setSelectedChapterIndex(parsed.chapterIndex ?? 0);
          setSelectedTopicIndex(parsed.topicIndex ?? null);
          setCustomTopic(parsed.customTopic ?? "");
          setDurationMinutes(parsed.durationMinutes ?? 25);
          setTimeLeft(parsed.timeLeft ?? (parsed.durationMinutes ?? 25) * 60);
          setIsRunning(parsed.isRunning ?? false);
        } else {
          // Если курс поменялся, сбросим таймер
          resetTimer();
        }
      } catch {
        resetTimer();
      }
    }
  }, [activeCourse]);

  // Сохраняем состояние таймера в localStorage при изменениях
  useEffect(() => {
    if (!activeCourse) return;
    localStorage.setItem(
      TIMER_STORAGE_KEY,
      JSON.stringify({
        courseId: activeCourse.id,
        chapterIndex: selectedChapterIndex,
        topicIndex: selectedTopicIndex,
        customTopic,
        durationMinutes,
        timeLeft,
        isRunning,
      })
    );
  }, [activeCourse, selectedChapterIndex, selectedTopicIndex, customTopic, durationMinutes, timeLeft, isRunning]);

  // Основной таймер
  useEffect(() => {
    if (!isRunning) {
      if (timerIdRef.current) {
        clearInterval(timerIdRef.current);
        timerIdRef.current = null;
      }
      return;
    }

    if (timeLeft <= 0) {
      finishSession();
      return;
    }

    timerIdRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerIdRef.current);
          timerIdRef.current = null;
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => {
      if (timerIdRef.current) clearInterval(timerIdRef.current);
    };
  }, [isRunning, timeLeft]);

  const resetTimer = () => {
    setSelectedChapterIndex(0);
    setSelectedTopicIndex(null);
    setCustomTopic("");
    setDurationMinutes(25);
    setTimeLeft(25 * 60);
    setIsRunning(false);
  };

  const finishSession = () => {
    setIsRunning(false);

    const minutesSpent = Math.ceil(durationMinutes - timeLeft / 60);
    const now = new Date().toISOString();

    if (selectedTopicIndex !== null) {
      // Тема из курса — отмечаем как сделанную
      setTopicDoneWithDate(selectedChapterIndex, selectedTopicIndex, true, {
        date: now,
      });
      setTopicNote(selectedChapterIndex, selectedTopicIndex, customTopic);
      setTopicRating(selectedChapterIndex, selectedTopicIndex, 3); // можно добавить выбор оценки позже
      toast.success(`✅ Тема "${getSelectedTopicTitle()}" отмечена как выполненная (${minutesSpent} мин)`);
    } else {
      // Своя тема — добавляем кастомное занятие в sessions календаря
      // Формируем сессию:
      const session = {
        date: now,
        minutes: minutesSpent,
        topicId: null,
        customTopic: customTopic || "(Своя тема)",
        note: "",
        rating: 3,
      };
      // Обновим activeCourse.sessions (копируем, добавляем)
      const updatedSessions = [...(activeCourse.sessions || []), session];
      activeCourseSetActiveCourse({ ...activeCourse, sessions: updatedSessions });
      localStorage.setItem("activeCourse", JSON.stringify({ ...activeCourse, sessions: updatedSessions }));

      toast.success(`✅ Своя тема "${customTopic || "(Своя тема)"}" добавлена (${minutesSpent} мин)`);
    }

    resetTimer();
  };

  const getSelectedTopicTitle = () => {
    if (!activeCourse) return "";
    if (selectedTopicIndex === null) return customTopic || "(Своя тема)";
    const chapter = activeCourse.chapters[selectedChapterIndex];
    if (!chapter) return "";
    const topic = chapter.topics[selectedTopicIndex];
    if (!topic) return "";
    return typeof topic === "string" ? topic : topic.title;
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className="max-w-md mx-auto p-6 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white">
      <h2 className="text-xl font-semibold mb-4">Таймер изучения</h2>

      {!activeCourse ? (
        <p className="text-red-500">Выберите курс, чтобы начать</p>
      ) : (
        <>
          <label className="block mb-2 font-semibold">
            Выберите главу:
            <select
              value={selectedChapterIndex}
              onChange={(e) => {
                setSelectedChapterIndex(Number(e.target.value));
                setSelectedTopicIndex(null);
                setCustomTopic("");
              }}
              className="w-full mt-1 p-2 border rounded border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white"
            >
              {activeCourse.chapters.map((ch, i) => (
                <option key={ch.id || i} value={i}>
                  {ch.title}
                </option>
              ))}
            </select>
          </label>

          <label className="block mb-2 font-semibold">
            Выберите тему:
            <select
              value={selectedTopicIndex ?? ""}
              onChange={(e) => {
                const val = e.target.value;
                if (val === "") {
                  setSelectedTopicIndex(null);
                  setCustomTopic("");
                } else {
                  setSelectedTopicIndex(Number(val));
                  setCustomTopic("");
                }
              }}
              className="w-full mt-1 p-2 border rounded border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white"
            >
              <option value="">Своя тема</option>
              {activeCourse.chapters[selectedChapterIndex].topics.map((topic, i) => (
                <option key={typeof topic === "string" ? topic : topic.id || i} value={i}>
                  {typeof topic === "string" ? topic : topic.title}
                </option>
              ))}
            </select>
          </label>

          {selectedTopicIndex === null && (
            <label className="block mb-2 font-semibold">
              Введите свою тему:
              <input
                type="text"
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                className="w-full mt-1 p-2 border rounded border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white"
                placeholder="Например: Решал задачи"
              />
            </label>
          )}

          <label className="block mb-2 font-semibold">
            Время (минуты):
            <input
              type="number"
              min="1"
              max="180"
              value={durationMinutes}
              onChange={(e) => {
                const val = Number(e.target.value);
                setDurationMinutes(val > 0 ? val : 1);
                setTimeLeft((val > 0 ? val : 1) * 60);
              }}
              className="w-full mt-1 p-2 border rounded border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white"
            />
          </label>

          <div className="flex items-center justify-between mb-4">
            <span className="font-mono text-lg">{formatTime(timeLeft)}</span>
            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`px-4 py-2 rounded font-semibold ${
                isRunning ? "bg-red-600 text-white" : "bg-hackerGreen text-black"
              }`}
            >
              {isRunning ? "Пауза" : "Старт"}
            </button>
            <button
              onClick={resetTimer}
              className="px-4 py-2 rounded bg-zinc-400 dark:bg-zinc-700 text-black dark:text-white"
            >
              Сброс
            </button>
          </div>
        </>
      )}
    </div>
  );
}
