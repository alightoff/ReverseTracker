// pages/CourseStatsPage.jsx
import React, { useMemo } from "react";
import { useCourseStore } from "../../store/courseStore";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart as VerticalBarChart,
} from "recharts";
import { format, subDays } from "date-fns";
import { Card, CardContent } from "../../components/ui/card";

const COLORS = ["#ff4d4f", "#ff7a45", "#ffc53d", "#73d13d", "#52c41a"];

export default function CourseStatsPage() {
  const { activeCourse, topicStates, publicSubmits, userCourses } = useCourseStore();

  // 1) Собираем все темы
  const allTopics = useMemo(() => {
    if (!activeCourse) return [];
    return activeCourse.chapters.flatMap((ch, cIdx) =>
      ch.topics.map((topic, tIdx) => ({
        chapterIndex: cIdx,
        topicIndex: tIdx,
        title:
          typeof topic === "string"
            ? topic
            : topic.title || `Глава ${cIdx + 1}, Тема ${tIdx + 1}`,
        key: `${activeCourse.id}-c${cIdx}-t${tIdx}`,
        state: topicStates[`${activeCourse.id}-c${cIdx}-t${tIdx}`] || {},
        chapterTitle: ch.title,
      }))
    );
  }, [activeCourse, topicStates]);

  const doneTopics = allTopics.filter((t) => t.state.done);
  const repeatTopics = allTopics.filter((t) => t.state.needsRepeat);
  const topicsWithNotes = allTopics.filter((t) => t.state.note);
  const topicsWithoutRating = doneTopics.filter((t) => t.state.rating == null);

  const totalMinutes = doneTopics.reduce((acc, t) => acc + (t.state.minutes || 0), 0);
  const averageRating = Math.round(
    doneTopics.reduce((acc, t) => acc + (t.state.rating || 0), 0) / (doneTopics.length || 1)
  );

  // 2) Последние 14 дней для BarChart
  const last14Days = useMemo(() => {
    const days = [];
    for (let i = 13; i >= 0; i--) {
      days.push(format(subDays(new Date(), i), "yyyy-MM-dd"));
    }
    return days;
  }, []);

  // 3) Данные для BarChart (дневная активность)
  const timeChartData = last14Days.map((date) => {
    const total = doneTopics
      .filter((t) => t.state.lastDoneDate?.startsWith(date))
      .reduce((sum, t) => sum + (t.state.minutes || 0), 0);
    return { date, minutes: total };
  });

  // 4) Данные для PieChart рейтингов (ratingData обязательно нужно использовать ниже)
  const ratingData = [1, 2, 3, 4, 5].map((r) => ({
    rating: r,
    count: doneTopics.filter((t) => t.state.rating === r).length,
  }));

  // 5) Данные для диаграмм по главам
  const chapterStats = useMemo(() => {
    return (
      activeCourse?.chapters.map((ch, cIdx) => {
        const chapterTopics = allTopics.filter((t) => t.chapterIndex === cIdx);
        const done = chapterTopics.filter((t) => t.state.done);
        const minutesSum = done.reduce((sum, t) => sum + (t.state.minutes || 0), 0);
        const avgMin = Math.round(minutesSum / (done.length || 1));
        const avgRate = Math.round(
          done.reduce((sum, t) => sum + (t.state.rating || 0), 0) / (done.length || 1)
        );
        return {
          chapter: ch.title,
          avgMinutes: avgMin,
          avgRating: avgRate,
          minutes: minutesSum,
        };
      }) || []
    );
  }, [activeCourse, allTopics]);

  // 7) Топ-3 темы по времени и по низкому рейтингу
  const topTimeTopics = [...doneTopics]
    .sort((a, b) => (b.state.minutes || 0) - (a.state.minutes || 0))
    .slice(0, 3);

  const lowRatedTopics = [...doneTopics]
    .filter((t) => t.state.rating != null)
    .sort((a, b) => (a.state.rating || 0) - (b.state.rating || 0))
    .slice(0, 3);

  return (
    <div className="p-4 space-y-6">
      {/* Общие метрики */}
      <Card>
        <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-sm text-zinc-500">Тем пройдено</p>
            <p className="text-xl font-bold">
              {doneTopics.length} / {allTopics.length}
            </p>
          </div>
          <div>
            <p className="text-sm text-zinc-500">Общее время</p>
            <p className="text-xl font-bold">{totalMinutes} мин</p>
          </div>
          <div>
            <p className="text-sm text-zinc-500">Средний рейтинг</p>
            <p className="text-xl font-bold">{averageRating} ⭐</p>
          </div>
          <div>
            <p className="text-sm text-zinc-500">Заметки</p>
            <p className="text-xl font-bold">{topicsWithNotes.length}</p>
          </div>
        </CardContent>
      </Card>

      {/* BarChart: минуты по последним 14 дням */}
      <Card>
        <CardContent>
          <h2 className="text-lg font-bold mb-2">
            Минуты по дням (последние 14 дней)
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={timeChartData} barCategoryGap={8}>
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="minutes" fill="#38bdf8" barSize={8} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* PieChart: распределение по рейтингам */}
      <Card>
        <CardContent>
          <h2 className="text-lg font-bold mb-2">Распределение по рейтингам</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={ratingData}          // <<< используем ratingData тут
                dataKey="count"
                nameKey="rating"
                cx="50%"
                cy="50%"
                outerRadius={70}
                label={({ rating }) => `${rating}⭐`}
              >
                {ratingData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name) => [`${value} тем`, `${name}⭐`]} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* PieChart: распределение времени по главам */}
      <Card>
        <CardContent>
          <h2 className="text-lg font-bold mb-2">
            Распределение времени по главам
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={chapterStats}
                dataKey="minutes"
                nameKey="chapter"
                cx="50%"
                cy="50%"
                outerRadius={60}
                label={({ chapter }) => chapter}
              >
                {chapterStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name) => [`${value} мин`, name]} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* BarChart: минуты по главам (горизонтально) */}
      <Card>
        <CardContent>
          <h2 className="text-lg font-bold mb-2">Минуты по главам</h2>
          <ResponsiveContainer width="100%" height={240}>
            <VerticalBarChart data={chapterStats} layout="vertical" barCategoryGap={12}>
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis
                type="category"
                dataKey="chapter"
                width={130}
                tick={{ fontSize: 10 }}
              />
              <Tooltip formatter={(value, name) => [`${value} мин`, name]} />
              <Bar dataKey="minutes" fill="#34d399" barSize={10} />
            </VerticalBarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Остальные блоки */}
      {repeatTopics.length > 0 && (
        <Card>
          <CardContent>
            <h2 className="text-lg font-bold mb-2">Темы на повтор</h2>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              {repeatTopics.map((t) => (
                <li key={t.key}>{t.title}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent>
          <h2 className="text-lg font-bold mb-2">Топ 3 темы по времени</h2>
          <ul className="list-decimal pl-5 space-y-1 text-sm">
            {topTimeTopics.map((t) => (
              <li key={t.key}>
                {t.title || "Без названия"} — {t.state.minutes} мин
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <h2 className="text-lg font-bold mb-2">Низкий рейтинг</h2>
          <ul className="list-decimal pl-5 space-y-1 text-sm">
            {lowRatedTopics.map((t) => (
              <li key={t.key}>
                {t.title || "Без названия"} — {t.state.rating} ⭐
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <h2 className="text-lg font-bold mb-2">Дополнительно</h2>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>Пользовательских курсов: {userCourses.length}</li>
            <li>Публичных отправок: {publicSubmits.length}</li>
            <li>Тем без рейтинга: {topicsWithoutRating.length}</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
