import { useState, useEffect, useMemo } from "react";
import {
  Zap,
  CheckCircle,
  Flame,
  Clock,
  Activity,
  Droplets,
  Target,
  Briefcase,
} from "lucide-react";

const API_BASE = "https://momentum-server-zjhh.onrender.com/api";

export default function App() {
  const [activeTab, setActiveTab] = useState<"daily" | "career">("daily");
  const [dailyTasks, setDailyTasks] = useState<any[]>([]);
  const [careerGoals, setCareerGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const todayIndex = (new Date().getDay() + 6) % 7;
  const isSunday = new Date().getDay() === 0;

  useEffect(() => {
    const loadData = async () => {
      try {
        const [daily, career] = await Promise.all([
          fetch(`${API_BASE}/daily`).then((r) => r.json()),
          fetch(`${API_BASE}/career`).then((r) => r.json()),
        ]);
        setDailyTasks(daily);
        setCareerGoals(career);
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
      ],
    },
    {
      id: "m3",
      time: "08:30 PM",
      note: isSunday ? "Sunday Stack" : "Night",
      items: [
        { name: "Minoxidil", type: "Scalp" },
        ...(isSunday ? [{ name: "Uprise D3", type: "Pill" }] : []),
      ],
    },
  ];

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <Zap className="text-red-500 animate-pulse" size={48} />
      </div>
    );

  return (
    <div className="min-h-screen w-full bg-[#0F172A] text-slate-200 pb-12">
      <nav className="w-full bg-[#1E293B] border-b border-slate-700 p-6 sticky top-0 z-50 shadow-xl flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-6">
            <div className="bg-red-600 p-2 rounded-xl text-white shadow-lg shadow-red-900/20">
              <Zap size={20} fill="currentColor" />
            </div>
            <h1 className="text-xl font-black uppercase tracking-widest text-white">
              Momentum
            </h1>
            <div className="bg-red-950/30 px-4 py-1.5 rounded-xl border border-red-900/50 flex items-center gap-2">
              <Flame className="text-red-500" size={16} fill="currentColor" />
              <span className="text-red-400 font-bold text-xs">
                {momentumScore}% Matrix Strength
              </span>
            </div>
          </div>
          <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700">
            <button
              onClick={() => setActiveTab("daily")}
              className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === "daily"
                  ? "bg-red-600 text-white shadow-lg"
                  : "text-slate-400"
              }`}
            >
              Matrix
            </button>
            <button
              onClick={() => setActiveTab("career")}
              className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === "career"
                  ? "bg-red-600 text-white shadow-lg"
                  : "text-slate-400"
              }`}
            >
              Roadmap
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {medSchedule.map((med) => (
            <div
              key={med.id}
              className="p-4 rounded-2xl border border-slate-700 bg-slate-800/40"
            >
              <div className="flex justify-between mb-2">
                <span className="text-[10px] font-black text-slate-500">
                  {med.time}
                </span>
                <span
                  className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    med.note.includes("Sunday")
                      ? "bg-red-900/50 text-red-400"
                      : "bg-slate-700 text-slate-300"
                  }`}
                >
                  {med.note}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {med.items.map((it, i) => (
                  <span
                    key={i}
                    className="text-[10px] font-bold px-2 py-1 rounded-lg border border-slate-600 bg-slate-900/50 flex items-center gap-1"
                  >
                    {it.type === "Pill" ? (
                      <Activity size={10} />
                    ) : (
                      <Droplets size={10} />
                    )}{" "}
                    {it.name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </nav>

      <main className="p-6 max-w-6xl mx-auto">
        {activeTab === "daily" ? (
          <div className="bg-[#1E293B] rounded-3xl border border-slate-700 overflow-hidden shadow-2xl">
            <table className="w-full">
              <tbody className="divide-y divide-slate-700">
                {dailyTasks.map((t) => (
                  <tr
                    key={t.id}
                    className="hover:bg-slate-800/50 transition-colors group"
                  >
                    <td className="p-5 pl-8">
                      <p className="font-bold text-white group-hover:text-red-400 transition-colors">
                        {t.label}
                      </p>
                      <span className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1.5 mt-1">
                        <Clock size={12} /> {t.timeSlot}
                      </span>
                    </td>
                    <td className="p-4 pr-8 flex justify-end gap-2">
                      {t.completions.map((done: boolean, i: number) => (
                        <button
                          key={i}
                          onClick={() => toggleDaily(t.id, i)}
                          className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${
                            i === todayIndex
                              ? "ring-2 ring-red-500 ring-offset-4 ring-offset-[#1E293B]"
                              : ""
                          } ${
                            done
                              ? "bg-red-600 text-white border-red-500 shadow-lg shadow-red-900/20"
                              : "bg-slate-900 border-slate-700 hover:border-red-500/50"
                          }`}
                        >
                          <CheckCircle size={18} />
                        </button>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {careerGoals.map((goal) => (
              <div
                key={goal.id}
                onClick={() => toggleCareer(goal.id)}
                className={`p-6 rounded-[2rem] border transition-all cursor-pointer flex items-center justify-between group ${
                  goal.isCompleted
                    ? "bg-red-900/10 border-red-500/50"
                    : "bg-[#1E293B] border-slate-700 hover:border-red-500/30"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`p-3 rounded-2xl ${
                      goal.isCompleted
                        ? "bg-red-600 text-white"
                        : "bg-slate-900 text-slate-500"
                    }`}
                  >
                    <Briefcase size={20} />
                  </div>
                  <p
                    className={`font-bold ${
                      goal.isCompleted ? "text-white" : "text-slate-400"
                    }`}
                  >
                    {goal.label}
                  </p>
                </div>
                {goal.isCompleted ? (
                  <CheckCircle className="text-red-500" />
                ) : (
                  <Target className="text-slate-700 group-hover:text-red-500/50" />
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
