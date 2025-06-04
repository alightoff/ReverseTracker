import Header from "./components/Header/Header";
import CourseSelector from "./components/CourseSelector/CourseSelector";
import CourseDetailsPage from "./pages/CourseDetailsPage/CourseDetailsPage";
import MyCoursesPage from "./pages/MyCoursesPage/MyCoursesPage";
import ProgressTrackerPage from "./pages/ProgressTrackerPage/ProgressTrackerPage";
import CalendarPage from "./pages/CalendarPage/CalendarPage";
import RepeatTopicsPage from "./pages/RepeatTopicsPage/RepeatTopicsPage";
import StudyTimerPage from "./pages/StudyTimerPage/StudyTimerPage";
import CourseNotesPage from "./pages/CourseNotesPage/CourseNotesPage";
import CourseStatsPage from "./pages/CourseStatsPage/CourseStatsPage";
import { Routes, Route } from "react-router-dom";
import PlansSection from "./components/PlansSection/PlansSection";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";



function App() {
  return (
    <div className="min-h-screen bg-white text-black dark:bg-hackerBlack dark:text-white">
      <Header />
      <main className="pt-16">
        <Routes>
          <Route path="/" element={<CourseSelector />} />
          <Route path="/course" element={<CourseDetailsPage />} />
          <Route path="/my-courses" element={<MyCoursesPage />} />
          <Route path="/progress" element={<ProgressTrackerPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/repeat-topics" element={<RepeatTopicsPage />} />
          <Route path="/timer" element={<StudyTimerPage />} />
          <Route path="/notes" element={<CourseNotesPage />} />
          <Route path="/notes/:courseId/:chapterIndex/:topicIndex" element={<CourseNotesPage />} />
          <Route path="/statistics" element={<CourseStatsPage />} />
          <Route path="/plans" element={<PlansSection />} />

        </Routes>
      </main>

      {/* 👇 Контейнер для уведомлений */}
      <ToastContainer
        position="bottom-right"
        autoClose={2500}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="dark"
      />
    </div>
  );
}

export default App;
