import { useState } from "react";
import { useCourseStore } from "../../store/courseStore";
import AddCourseModal from "../../components/AddCourseModal/AddCourseModal";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";  // импорт toast

export default function MyCoursesPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("private");
  const navigate = useNavigate();
  const {
    userCourses,
    publicSubmits,
    removeUserCourse,
    setActiveCourse,
  } = useCourseStore();

  const courses = activeTab === "private" ? userCourses : publicSubmits;

  const handleOpenCourse = (course) => {
    setActiveCourse(course);
    navigate("/course");
  };

  const handleRemoveCourse = (id) => {
    if (window.confirm("Вы уверены, что хотите удалить этот курс?")) {
      removeUserCourse(id);
      toast.success("✅ Курс успешно удалён");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
      {/* Заголовок */}
      <h1 className="text-3xl font-bold text-hackerGreen text-center">📚 Курсы</h1>

      {/* Вкладки */}
      <div className="flex justify-center items-center gap-2">
        <button
          className={`px-4 py-2 rounded border font-medium transition ${
            activeTab === "private"
              ? "bg-hackerGreen text-black border-hackerGreen"
              : "bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
          }`}
          onClick={() => setActiveTab("private")}
        >
          🔒 Мои курсы
        </button>
        <button
          className={`px-4 py-2 rounded border font-medium transition ${
            activeTab === "public"
              ? "bg-hackerGreen text-black border-hackerGreen"
              : "bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
          }`}
          onClick={() => setActiveTab("public")}
        >
          🌍 Глобальные курсы
        </button>
      </div>

      {/* Кнопка добавления */}
      <div className="flex justify-center">
        <button
          onClick={() => setModalOpen(true)}
          className={`mt-4 px-4 py-2 rounded font-semibold transition ${
            activeTab === "private"
              ? "bg-hackerGreen text-black hover:opacity-90"
              : "bg-zinc-400 text-white cursor-not-allowed opacity-60"
          }`}
          disabled={activeTab !== "private"}
        >
          ➕ Добавить курс
        </button>
      </div>

      {/* Курсы */}
      {courses.length === 0 ? (
        <p className="text-zinc-500 dark:text-zinc-400 text-center mt-8">
          Курсы не найдены.
        </p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <motion.div
              key={course.id}
              className="border border-zinc-300 dark:border-zinc-700 rounded p-4 bg-white dark:bg-zinc-900 shadow cursor-pointer hover:shadow-lg transition"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => handleOpenCourse(course)}
            >
              <h3 className="font-bold text-hackerGreen text-lg mb-2">{course.name}</h3>
              <p className="text-sm text-zinc-500 mb-3">
                Глав: {course.chapters?.length || 0}
              </p>
              {activeTab === "private" && (
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenCourse(course);
                    }}
                    className="text-sm px-3 py-1 bg-emerald-500 text-white rounded hover:opacity-90"
                  >
                    Начать
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveCourse(course.id);
                    }}
                    className="text-sm px-3 py-1 bg-red-500 text-white rounded hover:opacity-90"
                  >
                    Удалить
                  </button>
                </div>
              )}
              {activeTab === "public" && (
                <p className="text-sm text-zinc-400 italic">⏳ Ожидает модерации</p>
              )}
            </motion.div>
          ))}
        </div>
      )}

      <AddCourseModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
