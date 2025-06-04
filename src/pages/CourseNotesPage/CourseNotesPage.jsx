import React, { useState, useEffect } from "react";
import { useCourseStore } from "../../store/courseStore";
import Header from "../../components/Header/Header";
import CourseNotesEditor from "../../components/CourseNotesEditor/CourseNotesEditor";
import { useParams } from "react-router-dom";

export default function CourseNotesPage() {
  const { courseId, chapterIndex, topicIndex } = useParams();

  const activeCourse = useCourseStore((state) => state.activeCourse);
  const setActiveCourse = useCourseStore((state) => state.setActiveCourse);

  const [selectedTopic, setSelectedTopic] = useState(null);
  const [courseNotFound, setCourseNotFound] = useState(false);

  // Попытка загрузить курс из localStorage при изменении courseId или activeCourse
  useEffect(() => {
    if (!courseId) return;

    if (!activeCourse || activeCourse.id !== courseId) {
      const userCourses = JSON.parse(localStorage.getItem("userCourses")) || [];
      const foundCourse = userCourses.find((c) => c.id === courseId);

      if (foundCourse) {
        setActiveCourse(foundCourse);
        setCourseNotFound(false);
      } else {
        setCourseNotFound(true);
      }
    } else {
      setCourseNotFound(false);
    }
  }, [courseId, activeCourse, setActiveCourse]);

  // Установка выбранной темы при изменении параметров URL или активного курса
  useEffect(() => {
    if (
      activeCourse &&
      chapterIndex !== undefined &&
      topicIndex !== undefined &&
      activeCourse.chapters?.[Number(chapterIndex)] &&
      activeCourse.chapters[Number(chapterIndex)].topics?.[Number(topicIndex)]
    ) {
      setSelectedTopic({
        chapterIndex: Number(chapterIndex),
        topicIndex: Number(topicIndex),
      });
    } else {
      setSelectedTopic(null);
    }
  }, [chapterIndex, topicIndex, activeCourse]);

  if (courseNotFound) {
    return (
      <div className="p-6 text-center">
        <Header />
        <p className="mt-20 text-lg text-red-600">
          Курс с ID <strong>{courseId}</strong> не найден. Пожалуйста, выберите курс.
        </p>
      </div>
    );
  }

  if (!activeCourse) {
    return (
      <div className="p-6 text-center">
        <Header />
        <p className="mt-20 text-lg">Курс не выбран. Пожалуйста, выберите курс.</p>
      </div>
    );
  }

  const topicsList = activeCourse.chapters.flatMap((chapter, ci) =>
    chapter.topics.map((topic, ti) => ({
      chapterIndex: ci,
      topicIndex: ti,
      title: typeof topic === "string" ? topic : topic.title,
      chapterTitle: chapter.title,
    }))
  );

  // При выборе темы меняем URL — без сброса состояния
  const onSelectTopic = (ci, ti) => {
    // Формируем URL с выбранной темой
    const url = `/notes/${courseId}/${ci}/${ti}`;
    // Используем history API
    window.history.pushState(null, "", url);
    // Обновляем локальное состояние, чтобы отобразить редактор
    setSelectedTopic({ chapterIndex: ci, topicIndex: ti });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-hackerBlack text-black dark:text-white transition px-6 py-10">
      <Header />
      <div className="max-w-4xl mx-auto mt-16 space-y-6">
        <h1 className="text-3xl font-bold text-emerald-600 dark:text-hackerGreen mb-6">
          📝 Заметки по курсу — {activeCourse.name}
        </h1>

        <label className="block mb-2 font-semibold text-zinc-700 dark:text-zinc-300">
          Выберите тему для заметок:
        </label>
        <select
          className="w-full max-w-md px-3 py-2 mb-6 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white"
          value={
            selectedTopic
              ? `${selectedTopic.chapterIndex}-${selectedTopic.topicIndex}`
              : ""
          }
          onChange={(e) => {
            const [ci, ti] = e.target.value.split("-").map(Number);
            onSelectTopic(ci, ti);
          }}
        >
          <option value="">-- Выберите тему --</option>
          {topicsList.map(({ chapterIndex, topicIndex, title, chapterTitle }) => (
            <option
              key={`${chapterIndex}-${topicIndex}`}
              value={`${chapterIndex}-${topicIndex}`}
              title={`${chapterTitle} — ${title}`}
            >
              {chapterTitle}: {title}
            </option>
          ))}
        </select>

        {selectedTopic ? (
          <CourseNotesEditor
            courseId={activeCourse.id}
            chapterIndex={selectedTopic.chapterIndex}
            topicIndex={selectedTopic.topicIndex}
          />
        ) : (
          <p>Выберите тему для редактирования заметок.</p>
        )}
      </div>
    </div>
  );
}
