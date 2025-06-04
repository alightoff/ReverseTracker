import Header from "../../components/Header/Header";
import StudyTimer from "../../components/StudyTimer/StudyTimer";

export default function StudyTimerPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-hackerBlack text-black dark:text-white transition-colors duration-300">
      <Header />
      <main className="p-6 max-w-4xl mx-auto mt-20">
        <StudyTimer />
      </main>
    </div>
  );
}
