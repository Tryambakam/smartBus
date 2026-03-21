import { Play, Pause, FastForward, Rewind } from "lucide-react";

export default function DemoPanel({ simTime, setSimTime, speed, setSpeed, isPlaying, setIsPlaying }) {
  const formatTime = (mins) => {
    let h = Math.floor(mins / 60);
    const m = Math.floor(mins % 60).toString().padStart(2, "0");
    const ampm = h >= 12 ? "PM" : "AM";
    if (h > 12) h -= 12;
    if (h === 0) h = 12;
    return `${h}:${m} ${ampm}`;
  };

  return (
    <div className="absolute top-24 right-4 z-[400] bg-white/90 dark:bg-slate-800/90 backdrop-blur-md p-4 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-200 dark:border-slate-700 w-72 flex flex-col gap-3 transition-colors duration-300">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
        <h3 className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
          Scenario Controller
        </h3>
        <span className="text-xs font-mono bg-indigo-100 text-indigo-700 px-2 py-1 rounded-md dark:bg-indigo-900/50 dark:text-indigo-300 font-bold tracking-tight">
          {formatTime(simTime)}
        </span>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-slate-500 dark:text-slate-400 font-medium">Time of Day (Military / Hours)</label>
        <input 
          type="range" 
          min={360} max={1200} step={1}
          value={simTime}
          onChange={(e) => setSimTime(Number(e.target.value))}
          className="w-full accent-indigo-600 cursor-grab active:cursor-grabbing"
          aria-label="Demo time slider"
        />
        <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 font-medium mt-1">
          <span>06:00 AM</span>
          <span>12:00 PM</span>
          <span>08:00 PM</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900/50 p-1 rounded-lg">
          <button 
            onClick={() => setSpeed(s => Math.max(1, s - 5))}
            className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300 transition-colors shadow-sm focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
            aria-label="Decrease multiplier"
          >
            <Rewind size={14} />
          </button>
          <span className="text-xs font-bold w-10 text-center text-slate-700 dark:text-slate-200">{speed}x</span>
          <button 
            onClick={() => setSpeed(s => Math.min(60, s + 5))}
            className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300 transition-colors shadow-sm focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
            aria-label="Increase multiplier"
          >
            <FastForward size={14} />
          </button>
        </div>

        <button 
          onClick={() => setIsPlaying(!isPlaying)}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm focus-visible:ring-2 focus-visible:outline-none ${isPlaying ? 'bg-amber-100 text-amber-700 hover:bg-amber-200 focus-visible:ring-amber-500' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 focus-visible:ring-emerald-500'}`}
          aria-label={isPlaying ? "Pause scenario" : "Play scenario"}
        >
          {isPlaying ? <><Pause size={14} strokeWidth={3}/> Pause</> : <><Play size={14} strokeWidth={3}/> Play</>}
        </button>
      </div>
    </div>
  );
}
