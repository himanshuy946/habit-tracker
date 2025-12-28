import { useState, useEffect, useMemo } from "react";
import {
  Zap,
  CheckCircle,
  Flame,
  Clock,
  Activity,
  Droplets,
} from "lucide-react";

// const API_BASE = 'https://daily-habit-tracker.onrender.com/api'|| "http://localhost:3001/api";
const API_BASE = "https://momentum-server-zjhh.onrender.com/api";

export default function App() {
  const [activeTab, setActiveTab] = useState<"daily" | "calendar">("daily");
  const [dailyTasks, setDailyTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const todayIndex = (new Date().getDay() + 6) % 7;
  const isSunday = new Date().getDay() === 0;

  useEffect(() => {
    const loadData = async () => {
      try {
        const daily = await fetch(`${API_BASE}/daily`).then((r) => r.json());
        setDailyTasks(daily);
      } catch (err) {
        console.error("Sync Error:", err);
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
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Zap className="text-indigo-600 animate-bounce" size={48} />
      </div>
    );

  return (
    <div className="min-h-screen w-full bg-[#F8FAFC]">
      <nav className="w-full bg-white border-b p-6 sticky top-0 z-50 shadow-sm flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-6">
            <div className="bg-indigo-600 p-2.5 rounded-2xl text-white">
              <Zap size={20} />
            </div>
            <h1 className="text-xl font-black uppercase tracking-tighter">
              Momentum
            </h1>
            <div className="bg-orange-50 px-4 py-1.5 rounded-2xl border border-orange-100 flex items-center gap-2">
              <Flame className="text-orange-500" size={16} />
              <span className="text-orange-700 font-bold text-xs">
                {momentumScore}% PROGRESS
              </span>
            </div>
          </div>
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab("daily")}
              className={`px-5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === "daily"
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-slate-500"
              }`}
            >
              Matrix
            </button>
            <button
              onClick={() => setActiveTab("calendar")}
              className={`px-5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === "calendar"
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-slate-500"
              }`}
            >
              Insights
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {medSchedule.map((med) => (
            <div key={med.id} className="p-4 rounded-2xl border bg-slate-50/50">
              <div className="flex justify-between mb-2">
                <span className="text-[10px] font-black text-slate-400">
                  {med.time}
                </span>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-slate-200 uppercase font-bold">
                  {med.note}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {med.items.map((it, i) => (
                  <span
                    key={i}
                    className="text-[10px] font-bold px-2 py-1 rounded-lg border bg-white flex items-center gap-1"
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
        {activeTab === "daily" && (
          <div className="bg-white rounded-3xl border overflow-hidden shadow-sm">
            <table className="w-full">
              <tbody className="divide-y">
                {dailyTasks.map((t) => (
                  <tr
                    key={t.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="p-5 pl-8">
                      <p className="font-bold text-slate-800">{t.label}</p>
                      <span className="text-[10px] text-slate-400 uppercase font-bold">
                        <Clock size={12} className="inline mr-1" /> {t.timeSlot}
                      </span>
                    </td>
                    <td className="p-4 pr-8 flex justify-end gap-2">
                      {t.completions.map((done: boolean, i: number) => (
                        <button
                          key={i}
                          onClick={() => toggleDaily(t.id, i)}
                          className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all ${
                            i === todayIndex
                              ? "ring-2 ring-indigo-600 ring-offset-2"
                              : ""
                          } ${
                            done
                              ? "bg-indigo-600 text-white border-indigo-600"
                              : "bg-white border-slate-200"
                          }`}
                        >
                          <CheckCircle size={16} />
                        </button>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
