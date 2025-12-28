import { useState, useEffect, useMemo } from "react";
import {
  Zap,
  CheckCircle,
  Flame,
  Clock,
  Activity,
  Droplets,
  Briefcase,
  PlusCircle,
  TrendingUp,
} from "lucide-react";

const API_BASE = "https://momentum-server-zjhh.onrender.com/api";

export default function App() {
  const [activeTab, setActiveTab] = useState<"daily" | "career" | "calendar">(
    "daily"
  );
  const [dailyTasks, setDailyTasks] = useState<any[]>([]);
  const [careerGoals, setCareerGoals] = useState<any[]>([]);
  const [insights, setInsights] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const todayIndex = (new Date().getDay() + 6) % 7;
  const isSunday = new Date().getDay() === 0;

  useEffect(() => {
    const loadData = async () => {
      try {
        const [daily, career, insightData] = await Promise.all([
          fetch(`${API_BASE}/daily`).then((r) => r.json()),
          fetch(`${API_BASE}/career`).then((r) => r.json()),
          fetch(`${API_BASE}/insights`).then((r) => r.json()),
        ]);
        setDailyTasks(daily);
        setCareerGoals(career);
        setInsights(insightData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const momentumScore = useMemo(() => {
    if (!dailyTasks.length) return 0;
    const total = dailyTasks.length * 7;
    const done = dailyTasks.reduce(
      (acc, t) => acc + t.completions.filter(Boolean).length,
      0
    );
    return Math.round((done / total) * 100);
  }, [dailyTasks]);

  const toggleDaily = async (taskId: string, dayIdx: number) => {
    setDailyTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              completions: t.completions.map((c: boolean, i: number) =>
                i === dayIdx ? !c : c
              ),
            }
          : t
      )
    );
    await fetch(`${API_BASE}/daily/toggle`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId, dayIndex: dayIdx }),
    });
  };

  const toggleCareer = async (goalId: string) => {
    setCareerGoals((prev) =>
      prev.map((g) =>
        g.id === goalId ? { ...g, isCompleted: !g.isCompleted } : g
      )
    );
    await fetch(`${API_BASE}/career/toggle`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ goalId }),
    });
  };

  const medSchedule = [
    {
      id: "m1",
      time: "05:00 AM",
      note: "Empty Stomach",
      items: [{ name: "Neksium 40", type: "Pill" }],
    },
    {
      id: "m2",
      time: "08:00 AM",
      note: "Post-Bath",
      items: [
        { name: "Evion", type: "Pill" },
        { name: "Alive Forte", type: "Pill" },
        { name: "Bilypsa", type: "Pill" },
        { name: "Zyvin C", type: "Scalp" },
      ],
    },
    {
      id: "m3",
      time: "08:30 PM",
      note: isSunday ? "Sunday Stack" : "Night",
      items: [
        { name: "Minoxidil", type: "Scalp" },
        { name: "Cynical 16", type: "Pill" },
        ...(isSunday ? [{ name: "Uprise D3", type: "Pill" }] : []),
      ],
    },
  ];

  const renderHeatmap = () => {
    const days = Array.from({ length: 28 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (27 - i));
      return d.toISOString().split("T")[0];
    });
    return (
      <div className="flex flex-wrap gap-2 justify-center">
        {days.map((date) => (
          <div
            key={date}
            className={`w-8 h-8 rounded-md border border-zinc-800 transition-all ${
              insights[date] > 0
                ? "bg-red-500 shadow-[0_0_10px_rgba(220,38,38,0.4)]"
                : "bg-zinc-900"
            }`}
            title={date}
          />
        ))}
      </div>
    );
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505]">
        <Zap className="text-red-600 animate-pulse" size={64} />
      </div>
    );

  return (
    <div className="min-h-screen w-full bg-[#050505] text-slate-300 pb-12">
      <nav className="w-full bg-[#0A0A0A] border-b border-red-900/20 p-6 sticky top-0 z-50 shadow-2xl backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-6">
              <div className="bg-red-600 p-2.5 rounded-2xl text-white shadow-[0_0_20px_rgba(220,38,38,0.3)]">
                <Zap size={24} fill="currentColor" />
              </div>
              <h1 className="text-2xl font-black uppercase tracking-[0.2em] text-white">
                Momentum
              </h1>
              <div className="bg-red-950/20 px-4 py-1.5 rounded-xl border border-red-900/30 flex items-center gap-2">
                <Flame className="text-red-500" size={16} fill="currentColor" />
                <span className="text-red-400 font-bold text-xs">
                  {momentumScore}% Matrix
                </span>
              </div>
            </div>
            <div className="flex bg-zinc-900/50 p-1 rounded-xl border border-zinc-800">
              {["daily", "career", "calendar"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                    activeTab === tab
                      ? "bg-red-600 text-white shadow-lg"
                      : "text-zinc-500"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {medSchedule.map((med) => (
              <div
                key={med.id}
                className="p-4 rounded-3xl border border-zinc-800 bg-zinc-900/30"
              >
                <div className="flex justify-between mb-3">
                  <span className="text-[10px] font-black text-zinc-600">
                    {med.time}
                  </span>
                  <span
                    className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      med.note.includes("Sunday")
                        ? "bg-red-600 text-white"
                        : "bg-zinc-800 text-zinc-400"
                    }`}
                  >
                    {med.note}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {med.items.map((it, i) => (
                    <span
                      key={i}
                      className="text-[10px] font-black px-3 py-1.5 rounded-xl border border-zinc-800 bg-zinc-900/80 flex items-center gap-2"
                    >
                      {it.type === "Pill" ? (
                        <Activity size={12} className="text-red-500" />
                      ) : (
                        <Droplets size={12} className="text-blue-500" />
                      )}{" "}
                      {it.name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </nav>

      <main className="p-8 max-w-7xl mx-auto">
        {activeTab === "daily" ? (
          <div className="bg-[#0A0A0A] rounded-[2.5rem] border border-zinc-800 overflow-hidden shadow-2xl">
            <table className="w-full">
              <tbody className="divide-y divide-zinc-900">
                {dailyTasks.map((t) => (
                  <tr
                    key={t.id}
                    className="hover:bg-zinc-900/30 transition-all group"
                  >
                    <td className="p-7 pl-10">
                      <p className="font-black text-white text-lg group-hover:text-red-500 transition-colors">
                        {t.label}
                      </p>
                      <span className="text-[10px] text-zinc-600 uppercase font-bold flex items-center gap-2 mt-2">
                        <Clock size={12} /> {t.timeSlot}
                      </span>
                    </td>
                    <td className="p-4 pr-10 flex justify-end gap-2.5">
                      {t.completions.map((done: boolean, i: number) => (
                        <button
                          key={i}
                          onClick={() => toggleDaily(t.id, i)}
                          className={`w-11 h-11 rounded-2xl flex items-center justify-center border-2 transition-all ${
                            i === todayIndex
                              ? "ring-2 ring-red-500 ring-offset-4 ring-offset-[#050505]"
                              : ""
                          } ${
                            done
                              ? "bg-red-600 border-red-500 text-white shadow-lg"
                              : "bg-transparent border-zinc-800"
                          }`}
                        >
                          <CheckCircle
                            size={20}
                            fill={done ? "white" : "none"}
                          />
                        </button>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : activeTab === "career" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {careerGoals.map((goal) => (
              <div
                key={goal.id}
                onClick={() => toggleCareer(goal.id)}
                className={`p-8 rounded-[3rem] border transition-all cursor-pointer relative group ${
                  goal.isCompleted
                    ? "bg-red-950/10 border-red-600/50"
                    : "bg-zinc-900/30 border-zinc-800"
                }`}
              >
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${
                    goal.isCompleted
                      ? "bg-red-600 text-white"
                      : "bg-zinc-800 text-zinc-500"
                  }`}
                >
                  <Briefcase size={24} />
                </div>
                <h3
                  className={`text-xl font-black ${
                    goal.isCompleted ? "text-white" : "text-zinc-400"
                  }`}
                >
                  {goal.label}
                </h3>
                <div className="absolute top-8 right-8">
                  {goal.isCompleted ? (
                    <CheckCircle
                      size={28}
                      className="text-red-500"
                      fill="currentColor"
                    />
                  ) : (
                    <PlusCircle
                      size={28}
                      className="text-zinc-800 group-hover:text-red-900"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[#0A0A0A] p-10 rounded-[2.5rem] border border-zinc-800 shadow-2xl text-center">
            <h2 className="text-xl font-black text-white uppercase tracking-widest mb-8">
              Neural Consistency
            </h2>
            {renderHeatmap()}
            <div className="mt-8 flex justify-center gap-6 items-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-zinc-900 rounded-sm border border-zinc-800" />
                <span className="text-[10px] font-bold text-zinc-600 uppercase">
                  Off
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-sm" />
                <span className="text-[10px] font-bold text-zinc-600 uppercase">
                  Sync
                </span>
              </div>
            </div>
            <div className="mt-10 p-6 rounded-2xl bg-zinc-950 border border-zinc-900 flex items-center gap-6 justify-center text-left">
              <TrendingUp className="text-red-500" size={32} />
              <div>
                <p className="text-white font-black">Elite Discipline</p>
                <p className="text-zinc-600 text-[10px] font-bold uppercase">
                  Sunday Stack Active.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
