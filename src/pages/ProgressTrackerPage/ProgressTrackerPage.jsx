import React, { useState, useEffect } from "react";
import { useCourseStore } from "../../store/courseStore";
import Header from "../../components/Header/Header";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

export default function ProgressTrackerPage() {
  const {
    activeCourse,
    topicStates,
    setTopicDoneWithDate,
    setTopicNote,
    setTopicRating,
    setTopicMinutes,
  } = useCourseStore();

  const [editingDates, setEditingDates] = useState({});
  const [editingMinutes, setEditingMinutes] = useState({});

  useEffect(() => {
    if (!activeCourse) {
      toast.warn("⚠️ Курс не выбран");
    }
  }, [activeCourse]);

  if (!activeCourse) {
    return <div className="p-6">Курс не выбран.</div>;
  }

  const getProgress = (chapterIndex) => {
    const topics = activeCourse.chapters[chapterIndex].topics;
    const doneCount = topics.filter((_, idx) => {
      const key = `${activeCourse.id}-c${chapterIndex}-t${idx}`;
      return topicStates[key]?.done;
    }).length;
    return Math.round((doneCount / topics.length) * 100);
  };

  const getTotalProgress = () => {
    const allTopics = activeCourse.chapters.flatMap((c) => c.topics);
    const done = activeCourse.chapters.flatMap((c, ci) =>
      c.topics.filter((_, ti) => {
        const key = `${activeCourse.id}-c${ci}-t${ti}`;
        return topicStates[key]?.done;
      })
    );
    return Math.round((done.length / allTopics.length) * 100);
  };

  const handleDoneChange = (chapterIndex, topicIndex, checked) => {
    const key = `${activeCourse.id}-c${chapterIndex}-t${topicIndex}`;
    const dateNow = new Date().toISOString();
    setTopicDoneWithDate(chapterIndex, topicIndex, checked, {
      date: checked ? dateNow : null,
    });
    toast.info(
      checked
        ? "✅ Тема отмечена как выполненная"
        : "❌ Тема снята с выполненных"
    );
    if (checked) {
      setEditingDates((prev) => ({
        ...prev,
        [key]: dateNow.slice(0, 10),
      }));
      setEditingMinutes((prev) => ({
        ...prev,
        [key]: topicStates[key]?.minutes || 30,
      }));
    } else {
      setEditingDates((prev) => {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      });
      setEditingMinutes((prev) => {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      });
    }
  };

  const handleDateChange = (chapterIndex, topicIndex, newDate) => {
    const key = `${activeCourse.id}-c${chapterIndex}-t${topicIndex}`;
    setEditingDates((prev) => ({ ...prev, [key]: newDate }));
    setTopicDoneWithDate(chapterIndex, topicIndex, true, {
      date: newDate + "T00:00:00.000Z",
    });
    toast.success("📅 Дата выполнения обновлена");
  };

  const handleMinutesChange = (chapterIndex, topicIndex, minutes) => {
    const key = `${activeCourse.id}-c${chapterIndex}-t${topicIndex}`;
    setEditingMinutes((prev) => ({ ...prev, [key]: minutes }));
    setTopicMinutes(chapterIndex, topicIndex, minutes);
  };

  const handleMinutesBlur = () => {
    toast.success("⏳ Время занятий сохранено");
  };

  const handleNoteChange = (chapterIndex, topicIndex, note) => {
    setTopicNote(chapterIndex, topicIndex, note);
  };

  const handleNoteBlur = (chapterIndex, topicIndex) => {
    toast.success("📝 Заметка сохранена");
  };

  const handleRatingChange = (chapterIndex, topicIndex, rating) => {
    setTopicRating(chapterIndex, topicIndex, rating);
  };

  const handleRatingBlur = (chapterIndex, topicIndex) => {
    toast.success("⭐ Оценка сохранена");
  };

  return (
    <div className="min-h-screen bg-white dark:bg-hackerBlack text-black dark:text-white transition px-6 py-10">
      <Header />

      <div className="max-w-4xl mx-auto mt-16">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-2">
          <h1 className="text-3xl font-bold text-emerald-600 dark:text-hackerGreen">
            ✅ Прогресс по курсу — {activeCourse.name}
          </h1>
          <span className="text-sm text-hackerBlue">
            Общий прогресс: {getTotalProgress()}%
          </span>
        </div>

        <div className="w-full h-2 bg-zinc-300 dark:bg-zinc-700 rounded mb-8">
          <div
            className="h-2 bg-hackerGreen rounded"
            style={{ width: `${getTotalProgress()}%` }}
          />
        </div>

        {activeCourse.chapters.map((chapter, ci) => (
          <div key={chapter.id || ci} className="mb-10">
            <div className="mb-2 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-hackerGreen">
                {chapter.title}
              </h2>
              <span className="text-sm text-hackerBlue">
                Прогресс: {getProgress(ci)}%
              </span>
            </div>

            <div className="w-full h-2 bg-zinc-300 dark:bg-zinc-700 rounded mb-4">
              <div
                className="h-2 bg-hackerGreen rounded"
                style={{ width: `${getProgress(ci)}%` }}
              />
            </div>

            <div className="space-y-4">
              {chapter.topics.map((topic, ti) => {
                const key = `${activeCourse.id}-c${ci}-t${ti}`;
                const state = topicStates[key] || {};
                const title = typeof topic === "string" ? topic : topic.title;
                const done = state.done || false;
                const dateValue =
                  editingDates[key] ?? (state.lastDoneDate ? state.lastDoneDate.slice(0, 10) : "");
                const minutesValue =
                  editingMinutes[key] ?? state.minutes ?? 30;

                return (
                  <div
                    key={topic.id || ti}
                    className="bg-zinc-100 dark:bg-zinc-800 p-3 rounded border border-zinc-300 dark:border-zinc-700"
                  >
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <input
                        type="checkbox"
                        checked={done}
                        onChange={(e) => handleDoneChange(ci, ti, e.target.checked)}
                      />
                      {/* Название темы с переходом на страницу заметок */}
                      <Link
                        to={`/notes/${activeCourse.id}/${ci}/${ti}`}
                        className={done ? "line-through text-emerald-500" : ""}
                        style={{ cursor: "pointer", textDecoration: "underline", color: "#22c55e" }}
                      >
                        {title}
                      </Link>
                      {/* Если есть заметка, показываем иконку */}
                      {state.note && <span className="ml-2 text-yellow-400">📝</span>}
                    </div>

                    {done && (
                      <>
                        <div className="flex flex-col sm:flex-row gap-2 mb-2">
                          <label className="flex flex-col text-sm w-full sm:w-auto">
                            Дата выполнения:
                            <input
                              type="date"
                              value={dateValue}
                              onChange={(e) => handleDateChange(ci, ti, e.target.value)}
                              className="mt-1 px-2 py-1 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-700 text-black dark:text-white"
                            />
                          </label>

                          <label className="flex flex-col text-sm w-full sm:w-auto">
                            Время (мин):
                            <input
                              type="number"
                              min="1"
                              max="600"
                              value={minutesValue}
                              onChange={(e) => handleMinutesChange(ci, ti, Number(e.target.value))}
                              onBlur={handleMinutesBlur}
                              className="mt-1 px-2 py-1 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-700 text-black dark:text-white"
                            />
                          </label>

                          <label className="flex flex-col text-sm w-full sm:w-auto">
                            Оценка:
                            <select
                              value={state.rating || 3}
                              onChange={(e) => handleRatingChange(ci, ti, Number(e.target.value))}
                              onBlur={() => handleRatingBlur(ci, ti)}
                              className="mt-1 px-2 py-1 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-700 text-black dark:text-white"
                            >
                              <option value="1">😴 1</option>
                              <option value="2">😐 2</option>
                              <option value="3">🙂 3</option>
                              <option value="4">😎 4</option>
                              <option value="5">🔥 5</option>
                            </select>
                          </label>
                        </div>

                        <label className="block text-sm">
                          Заметка:
                          <textarea
                            placeholder="Заметка по теме..."
                            value={state.note || ""}
                            onChange={(e) => handleNoteChange(ci, ti, e.target.value)}
                            onBlur={() => handleNoteBlur(ci, ti)}
                            className="w-full mt-1 px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-700 text-black dark:text-white"
                          />
                        </label>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
