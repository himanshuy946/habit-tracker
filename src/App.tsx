import React, { useState, useEffect, useMemo } from "react";
import {
  Zap,
  Briefcase,
  CheckCircle,
  Flame,
  TrendingUp,
  Clock,
  Pill,
  Droplets,
  Activity,
  LayoutDashboard,
  Target,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// --- TYPES ---
interface MedItem {
  name: string;
  type: "Pill" | "Scalp" | "Spots";
}
interface MedSlot {
  id: string;
  time: string;
  label: string;
  items: MedItem[];
  note: string;
}
interface DailyTask {
  id: string;
  label: string;
  timeSlot: string;
  completions: boolean[];
}
interface CareerGoal {
  id: string;
  label: string;
  isCompleted: boolean;
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const API_BASE = "http://localhost:3001/api";

export default function App() {
  const [activeTab, setActiveTab] = useState<"daily" | "career" | "calendar">(
    "daily"
  );
  const [currentTime, setCurrentTime] = useState(new Date());

  // State for raw data from PostgreSQL
  const [dailyTasks, setDailyTasks] = useState<DailyTask[]>([]);
  const [careerGoals, setCareerGoals] = useState<CareerGoal[]>([]);
  const [loading, setLoading] = useState(true);

  const todayIndex = (new Date().getDay() + 6) % 7;
  const isSunday = new Date().getDay() === 0;

  // 1. DATA FETCHING
  useEffect(() => {
    const loadData = async () => {
      try {
        const [dailyRes, careerRes] = await Promise.all([
          fetch(`${API_BASE}/daily`),
          fetch(`${API_BASE}/career`),
        ]);
        const daily = await dailyRes.json();
        const career = await careerRes.json();

        setDailyTasks(daily);
        setCareerGoals(career);
      } catch (err) {
        console.error("Fetch failed: Is your server running at 3001?", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();

    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 2. PERFORMANCE OPTIMIZATION: useMemo for Weekly Score
  const momentumScore = useMemo(() => {
    if (dailyTasks.length === 0) return 0;
    const totalPossible = dailyTasks.length * 7;
    const totalDone = dailyTasks.reduce(
      (acc, task) => acc + task.completions.filter(Boolean).length,
      0
    );
    return Math.round((totalDone / totalPossible) * 100);
  }, [dailyTasks]);

  // 3. CALENDAR GENERATOR LOGIC
  const renderCalendar = () => {
    const year = currentTime.getFullYear();
    const month = currentTime.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const calendarDays = [];

    // Adjust for Monday start
    const startOffset = firstDay === 0 ? 6 : firstDay - 1;

    for (let i = 0; i < startOffset; i++) {
      calendarDays.push(
        <div key={`empty-${i}`} className="h-24 bg-slate-50/30" />
      );
    }

    for (let d = 1; d <= daysInMonth; d++) {
      // Logic: For local dev, we use the current week's average to simulate the heatmap
      // In a full production app, this would query a 'history' table in Postgres.
      const isToday = d === currentTime.getDate();
      const score = isToday
        ? (dailyTasks.filter((t) => t.completions[todayIndex]).length /
            dailyTasks.length) *
          100
        : 0;

      calendarDays.push(
        <div
          key={d}
          className={`h-24 border border-slate-100 p-3 flex flex-col justify-between transition-all hover:bg-white hover:shadow-inner relative group ${
            isToday
              ? "bg-indigo-50/30 ring-1 ring-inset ring-indigo-200"
              : "bg-white"
          }`}
        >
          <span
            className={`text-xs font-black ${
              isToday ? "text-indigo-600" : "text-slate-400"
            }`}
          >
            {d}
          </span>
          {score > 0 && (
            <div className="flex flex-col gap-1">
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 transition-all duration-1000"
                  style={{ width: `${score}%` }}
                />
              </div>
              <span className="text-[9px] font-black text-indigo-600 tracking-tighter">
                {Math.round(score)}% DONE
              </span>
            </div>
          )}
        </div>
      );
    }
    return calendarDays;
  };

  // --- HANDLERS ---
  const toggleDaily = async (taskId: string, dayIdx: number) => {
    setDailyTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              completions: t.completions.map((c, i) => (i === dayIdx ? !c : c)),
            }
          : t
      )
    );

    try {
      await fetch(`${API_BASE}/daily/toggle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, dayIndex: dayIdx }),
      });
    } catch (err) {
      console.error("Sync failed:", err);
    }
  };

  const toggleCareer = async (goalId: string) => {
    setCareerGoals((prev) =>
      prev.map((g) =>
        g.id === goalId ? { ...g, isCompleted: !g.isCompleted } : g
      )
    );
    try {
      await fetch(`${API_BASE}/career/toggle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goalId }),
      });
    } catch (err) {
      console.error("Sync failed:", err);
    }
  };

  // MEDICINE SCHEDULE
  const medSchedule: MedSlot[] = [
    {
      id: "m1",
      time: "05:00 AM",
      label: "Morning 1",
      note: "Empty Stomach",
      items: [{ name: "Neksium 40", type: "Pill" }],
    },
    {
      id: "m2",
      time: "08:00 AM",
      label: "Morning 2",
      note: "Post-Bath/Food",
      items: [
        { name: "Evion", type: "Pill" },
        { name: "Alive Forte", type: "Pill" },
        { name: "Bilypsa", type: "Pill" },
        { name: "Zyvin C Lotion", type: "Scalp" },
        { name: "Cobeta 6s", type: "Spots" },
      ],
    },
    {
      id: "m3",
      time: "08:30 PM",
      label: "Night Routine",
      note: isSunday ? "Full + Uprise D3" : "Night Stack",
      items: [
        { name: "Alive Forte", type: "Pill" },
        { name: "Cynical 16", type: "Pill" },
        { name: "Bilypsa", type: "Pill" },
        { name: "Evil", type: "Pill" },
        { name: "Zarywin Forte", type: "Pill" },
        { name: "Minoxidil", type: "Scalp" },
        ...(isSunday ? [{ name: "Uprise D3", type: "Pill" } as MedItem] : []),
      ],
    },
  ];

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Zap className="text-indigo-600 animate-pulse" size={48} />
          <p className="font-black text-slate-400 uppercase tracking-widest text-[10px]">
            Accessing Database...
          </p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen w-full bg-[#F8FAFC] font-sans antialiased text-slate-900 pb-12">
      {/* HEADER & NAV */}
      <nav className="w-full bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm px-6 py-4 flex flex-col gap-6">
        <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2.5 rounded-2xl text-white shadow-lg">
                <Zap size={20} fill="currentColor" />
              </div>
              <h1 className="text-xl font-black tracking-tighter uppercase">
                Momentum
              </h1>
            </div>
            <div className="flex items-center gap-2 bg-orange-50 px-4 py-2 rounded-2xl border border-orange-100">
              <Flame
                className="text-orange-500"
                size={18}
                fill="currentColor"
              />
              <span className="text-orange-700 font-black text-sm">
                {momentumScore}% WEEKLY SCORE
              </span>
            </div>
          </div>

          <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-inner">
            <TabButton
              active={activeTab === "daily"}
              onClick={() => setActiveTab("daily")}
              icon={<LayoutDashboard size={16} />}
              label="Matrix"
            />
            <TabButton
              active={activeTab === "career"}
              onClick={() => setActiveTab("career")}
              icon={<Target size={16} />}
              label="Roadmap"
            />
            <TabButton
              active={activeTab === "calendar"}
              onClick={() => setActiveTab("calendar")}
              icon={<Calendar size={16} />}
              label="Insights"
            />
          </div>
        </div>

        {/* MEDICINE TIMELINE */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 border-t border-slate-100 pt-5">
          {medSchedule.map((med) => (
            <div
              key={med.id}
              className="flex flex-col gap-3 p-4 rounded-3xl border bg-slate-50/50 border-slate-200/60 transition-all hover:bg-white hover:shadow-md"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-white rounded-lg border border-slate-200 text-slate-400">
                    <Clock size={12} />
                  </div>
                  <span className="text-xs font-black text-slate-500 font-mono tracking-tighter">
                    {med.time}
                  </span>
                </div>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 uppercase tracking-tighter">
                  {med.note}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {med.items.map((item, i) => {
                  const isEatable = item.type === "Pill";
                  return (
                    <span
                      key={i}
                      className={`text-[11px] font-bold px-2.5 py-1.5 rounded-xl border flex items-center gap-2 transition-transform hover:scale-105 shadow-sm
                        ${
                          isEatable
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-blue-50 text-blue-700 border-blue-200"
                        }`}
                    >
                      {isEatable ? (
                        <Activity size={12} />
                      ) : (
                        <Droplets size={12} />
                      )}
                      {item.name}
                    </span>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </nav>

      {/* MAIN CONTENT AREA */}
      <main className="p-4 md:p-8 w-full max-w-[1600px] mx-auto">
        {activeTab === "daily" && (
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
              <h2 className="text-xl font-black text-slate-800 flex items-center gap-3">
                <TrendingUp className="text-indigo-600" size={24} /> Weekly
                Momentum
              </h2>
              <div className="flex gap-3">
                {DAYS.map((d, idx) => (
                  <div
                    key={d}
                    className={`w-11 py-2 text-center rounded-xl transition-all ${
                      idx === todayIndex
                        ? "bg-indigo-600 text-white shadow-xl"
                        : "text-slate-400"
                    }`}
                  >
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      {d}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <tbody className="divide-y divide-slate-100">
                  {dailyTasks.map((task) => (
                    <tr
                      key={task.id}
                      className="hover:bg-slate-50/50 transition-colors group"
                    >
                      <td className="p-6 pl-10 min-w-[350px]">
                        <p className="font-bold text-slate-800 text-lg leading-tight group-hover:text-indigo-600 transition-colors">
                          {task.label}
                        </p>
                        <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5 mt-1.5 uppercase tracking-widest">
                          <Clock size={14} className="text-indigo-400" />{" "}
                          {task.timeSlot}
                        </span>
                      </td>
                      <td className="p-4 pr-10 text-right">
                        <div className="flex justify-end gap-3">
                          {task.completions.map((done, i) => (
                            <button
                              key={i}
                              onClick={() => toggleDaily(task.id, i)}
                              className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-300
                                ${
                                  i === todayIndex
                                    ? "ring-2 ring-indigo-600 ring-offset-4"
                                    : ""
                                }
                                ${
                                  done
                                    ? "bg-indigo-600 text-white shadow-xl shadow-indigo-200"
                                    : "bg-slate-50 text-transparent border border-slate-200 hover:border-indigo-400"
                                }
                              `}
                            >
                              <CheckCircle size={20} strokeWidth={3} />
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "career" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {careerGoals.map((goal) => (
              <div
                key={goal.id}
                onClick={() => toggleCareer(goal.id)}
                className={`p-10 rounded-[3rem] border-2 cursor-pointer transition-all flex flex-col justify-between group h-72 ${
                  goal.isCompleted
                    ? "bg-emerald-50 border-emerald-100 shadow-inner"
                    : "bg-white border-slate-100 hover:border-indigo-400 shadow-xl shadow-slate-200/50"
                }`}
              >
                <div>
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all ${
                      goal.isCompleted
                        ? "bg-emerald-500 text-white"
                        : "bg-slate-50 text-slate-400 group-hover:bg-indigo-600 group-hover:text-white"
                    }`}
                  >
                    <Briefcase size={26} />
                  </div>
                  <h3
                    className={`font-black text-2xl tracking-tight leading-tight ${
                      goal.isCompleted
                        ? "text-emerald-800/40 line-through"
                        : "text-slate-800"
                    }`}
                  >
                    {goal.label}
                  </h3>
                </div>
                <div className="mt-8 flex justify-between items-center pt-6 border-t border-slate-50 text-[11px] font-black uppercase tracking-[0.2em]">
                  <span
                    className={
                      goal.isCompleted ? "text-emerald-600" : "text-slate-400"
                    }
                  >
                    {goal.isCompleted ? "Mastered" : "Active"}
                  </span>
                  {goal.isCompleted && (
                    <CheckCircle
                      size={28}
                      className="text-emerald-500"
                      strokeWidth={3}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "calendar" && (
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-indigo-50/20">
              <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                <TrendingUp className="text-indigo-600" size={26} /> Monthly
                Performance Heatmap
              </h2>
              <div className="flex items-center gap-4 bg-white p-1.5 rounded-2xl border border-slate-100">
                <button className="p-2 hover:bg-slate-50 rounded-xl transition-all">
                  <ChevronLeft size={20} />
                </button>
                <span className="font-black text-slate-700 uppercase tracking-widest px-4">
                  {currentTime.toLocaleString("default", {
                    month: "long",
                    year: "numeric",
                  })}
                </span>
                <button className="p-2 hover:bg-slate-50 rounded-xl transition-all">
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
            <div className="p-10">
              <div className="grid grid-cols-7 gap-px bg-slate-100 border border-slate-100 rounded-3xl overflow-hidden shadow-2xl shadow-indigo-100/20">
                {DAYS.map((d) => (
                  <div
                    key={d}
                    className="bg-slate-50/50 p-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100"
                  >
                    {d}
                  </div>
                ))}
                {renderCalendar()}
              </div>
              <div className="mt-10 flex gap-8 items-center justify-center p-6 bg-slate-50/50 rounded-3xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-white border border-slate-200 rounded-lg" />{" "}
                  <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">
                    Upcoming
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-indigo-100 rounded-lg" />{" "}
                  <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">
                    Partial
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-indigo-600 rounded-lg" />{" "}
                  <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">
                    100% Mastery
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// --- HELPER COMPONENT ---
function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-8 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
        active
          ? "bg-white text-indigo-600 shadow-md scale-[1.02]"
          : "text-slate-500 hover:text-slate-800"
      }`}
    >
      {icon} {label}
    </button>
  );
}
