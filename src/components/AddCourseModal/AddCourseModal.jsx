import { useState } from "react";
import { Dialog } from "@headlessui/react";
import { motion } from "framer-motion";
import { useCourseStore } from "../../store/courseStore";
import CourseFileUploader from "../CourseUploader/CourseFileUploader";
import { v4 as uuidv4 } from "uuid";
import { toast } from "react-toastify";  // импорт toast

export default function AddCourseModal({ isOpen, onClose }) {
  const [courseData, setCourseData] = useState(null);
  const [isGlobal, setIsGlobal] = useState(false);
  const [showExample, setShowExample] = useState(false);

  const { addUserCourse, addPublicSubmit } = useCourseStore();

  const handleSave = () => {
    if (!courseData?.name || !Array.isArray(courseData.chapters)) {
      toast.error("❗ Некорректная структура курса");
      return;
    }

    const newCourse = {
      id: uuidv4(),
      ...courseData,
      createdAt: new Date().toISOString(),
    };

    if (isGlobal) {
      addPublicSubmit(newCourse);
      toast.success("🚀 Курс отправлен на модерацию");
    } else {
      addUserCourse(newCourse);
      toast.success("✅ Курс добавлен в ваши курсы");
    }

    setCourseData(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel
          as={motion.div}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="w-full max-w-lg rounded bg-white dark:bg-zinc-900 p-6 shadow-lg border border-zinc-200 dark:border-zinc-700"
        >
          <Dialog.Title className="text-lg font-bold text-hackerGreen mb-4">
            ➕ Добавление нового курса
          </Dialog.Title>

          {/* Загрузка файла */}
          <CourseFileUploader onFileAccepted={setCourseData} />

          {/* Кнопка показа примера */}
          <button
            onClick={() => setShowExample(!showExample)}
            className="mt-4 text-sm text-hackerBlue underline"
          >
            {showExample ? "Скрыть пример структуры" : "Показать пример структуры"}
          </button>

          {showExample && (
            <pre className="bg-zinc-100 dark:bg-zinc-800 p-4 mt-2 rounded text-sm max-h-64 overflow-auto">
{`{
  "name": "Пример курса",
  "chapters": [
    {
      "title": "Глава 1",
      "topics": ["Введение", "Основы"]
    },
    {
      "title": "Глава 2",
      "topics": ["Продвинутые темы", "Практика"]
    }
  ]
}`}
            </pre>
          )}

          {/* Превью структуры */}
          {courseData && (
            <div className="mt-6 space-y-2 text-left">
              <h3 className="font-bold text-lg text-hackerGreen">{courseData.name}</h3>
              {courseData.chapters?.map((chapter, i) => (
                <div key={i} className="ml-4">
                  <p className="font-semibold">📘 {chapter.title}</p>
                  <ul className="list-disc ml-6 text-sm">
                    {chapter.topics.map((topic, j) => (
                      <li key={j}>{topic}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {/* Переключатель приватности */}
          <div className="mt-6 flex items-center gap-2">
            <input
              type="checkbox"
              id="global"
              checked={isGlobal}
              onChange={(e) => setIsGlobal(e.target.checked)}
              className="accent-hackerGreen"
            />
            <label htmlFor="global" className="text-sm text-zinc-700 dark:text-zinc-300">
              Отправить курс на модерацию (сделать глобальным)
            </label>
          </div>

          {/* Кнопки */}
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded bg-zinc-300 dark:bg-zinc-700 text-black dark:text-white"
            >
              Отмена
            </button>
            <button
              onClick={handleSave}
              disabled={!courseData}
              className="px-4 py-2 rounded bg-hackerGreen text-black font-semibold hover:opacity-90 transition"
            >
              Сохранить
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
