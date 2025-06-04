import { useCourseStore } from "../../store/courseStore";
import Header from "../../components/Header/Header";
import { motion } from "framer-motion";
import { toast } from "react-toastify";

export default function RepeatTopicsPage() {
  const {
    activeCourse,
    topicStates,
    setTopicNeedsRepeat,
    setTopicDoneWithDate,
  } = useCourseStore();

  if (!activeCourse) {
    return <div className="p-6">Курс не выбран.</div>;
  }

  // Получаем темы, помеченные для повторения
  const repeatTopics = activeCourse.chapters.flatMap((chapter, ci) =>
    chapter.topics
      .map((topic, ti) => {
        const key = `${activeCourse.id}-c${ci}-t${ti}`;
        const state = topicStates[key];
        if (state?.needsRepeat) {
          return {
            chapterIndex: ci,
            topicIndex: ti,
            title: typeof topic === "string" ? topic : topic.title,
            note: state.note || "",
            rating: state.rating || 3,
            key,
          };
        }
        return null;
      })
      .filter(Boolean)
  );

  if (repeatTopics.length === 0) {
    return (
      <>
        <Header />
        <div className="p-6 text-center text-zinc-500">Нет тем для повторения.</div>
      </>
    );
  }

  const handleMarkDone = (chapterIndex, topicIndex) => {
    setTopicNeedsRepeat(chapterIndex, topicIndex, false);
    setTopicDoneWithDate(chapterIndex, topicIndex, true, { date: new Date().toISOString() });
    toast.success("✅ Тема отмечена как выполненная и удалена из повторяемых");
  };

  return (
    <>
      <Header />
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-hackerGreen mb-6">🔄 Повторяемые темы</h1>
        <div className="space-y-4">
          {repeatTopics.map(({ chapterIndex, topicIndex, title, note, rating, key }) => (
            <motion.div
              key={key}
              className="p-4 border border-yellow-500 rounded bg-yellow-100 dark:bg-yellow-900 flex justify-between items-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div>
                <p className="font-semibold">{title}</p>
                {note && <p className="text-sm text-zinc-600 dark:text-zinc-400">Заметка: {note}</p>}
                <p>Оценка: {rating}/5</p>
              </div>
              <button
                className="px-3 py-1 bg-hackerGreen text-black rounded hover:opacity-90"
                onClick={() => handleMarkDone(chapterIndex, topicIndex)}
              >
                Отметить как выполненную
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </>
  );
}
