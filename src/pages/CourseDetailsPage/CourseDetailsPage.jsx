import { useCourseStore } from "../../store/courseStore";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function CourseDetailsPage() {
  const activeCourse = useCourseStore((state) => state.activeCourse);
  const topicStates = useCourseStore((state) => state.topicStates);
  const navigate = useNavigate();

  if (!activeCourse) {
    return <p className="p-6">Курс не выбран.</p>;
  }

  const totalTopics = activeCourse.chapters.reduce(
    (acc, chapter) => acc + chapter.topics.length,
    0
  );

  const completedTopics = activeCourse.chapters.reduce((acc, chapter, chapterIndex) => {
    return (
      acc +
      chapter.topics.reduce((acc2, topic, topicIndex) => {
        const key = `${activeCourse.id}-c${chapterIndex}-t${topicIndex}`;
        return acc2 + (topicStates[key]?.done ? 1 : 0);
      }, 0)
    );
  }, 0);

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <motion.h1
        className="text-3xl font-bold text-hackerGreen"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {activeCourse.name}
      </motion.h1>

      <p className="text-zinc-600 dark:text-zinc-400">{activeCourse.description}</p>

      <div className="text-sm text-zinc-500 dark:text-zinc-400">
        Пройдено: {completedTopics} / {totalTopics} тем
      </div>

      <div className="space-y-4">
        {activeCourse.chapters.map((chapter, chapterIndex) => (
          <div
            key={chapter.id || chapterIndex}
            className="border rounded-lg p-4 bg-zinc-100 dark:bg-zinc-800"
          >
            <h2 className="text-lg font-semibold text-hackerGreen mb-2">
              {chapter.title}
            </h2>
            <ul className="space-y-1 ml-4">
              {chapter.topics.map((topic, topicIndex) => {
                const title = typeof topic === "string" ? topic : topic.title;
                const key = `${activeCourse.id}-c${chapterIndex}-t${topicIndex}`;
                const done = topicStates[key]?.done;

                return (
                  <li
                    key={(topic.id || topicIndex) + key}
                    className={`text-sm ${
                      done
                        ? "text-emerald-500 line-through"
                        : "text-zinc-700 dark:text-zinc-200"
                    }`}
                  >
                    • {title}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      <motion.button
        onClick={() => navigate("/progress")}
        whileTap={{ scale: 0.95 }}
        className="mt-6 px-6 py-3 rounded-full bg-hackerGreen text-black font-semibold shadow hover:opacity-90 transition"
      >
        🚀 {completedTopics === 0 ? "Начать курс" : "Продолжить"}
      </motion.button>
    </div>
  );
}
