import { useState, useCallback } from "react";
import "../styles/fonts.css";

const BG        = "#0f1117";
const SURFACE   = "#1c1f2b";
const SURFACE2  = "#252837";
const TEXT      = "#e8eaf0";
const SUBTLE    = "#6b7491";
const BORDER    = "rgba(255,255,255,0.07)";
const GREEN     = "#4CD964";
const RED       = "#FF3B30";

interface MedLog {
  id: string;
  timestamp: Date;
}

interface Med {
  key: string;
  name: string;
  emoji: string;
  color: string;
  glow: string;
}

const MEDS: Med[] = [
  { key: "desaler", name: "Desaler", emoji: "🌿", color: "#007AFF", glow: "rgba(0,122,255,0.30)" },
  { key: "zinc",    name: "Zinc",    emoji: "⚡", color: "#FF9500", glow: "rgba(255,149,0,0.30)"  },
  { key: "magnesio",name: "Magnesio",emoji: "🔮", color: "#AF52DE", glow: "rgba(175,82,222,0.30)"},
];

const DAY_NAMES = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const MONTH_NAMES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

function fmtTime(d: Date) {
  return `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
}
function fmtDay(d: Date) {
  const dd  = String(d.getDate()).padStart(2,"0");
  const mm  = String(d.getMonth()+1).padStart(2,"0");
  const day = DAY_NAMES[d.getDay()];
  return `${day} ${dd}/${mm}`;
}
function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function LogCard({ log, color, fresh }: { log: MedLog; color: string; fresh: boolean }) {
  return (
    <div style={{
      background: SURFACE2, borderRadius: 10, padding: "8px 10px",
      borderLeft: `3px solid ${color}`,
      animation: fresh ? "slideIn 0.22s ease" : undefined,
      display: "flex", flexDirection: "column", gap: 1,
    }}>
      <span style={{ fontFamily: "Inter,sans-serif", fontSize: 13, fontWeight: 700, color: TEXT }}>
        {fmtTime(log.timestamp)}
      </span>
      <span style={{ fontFamily: "Inter,sans-serif", fontSize: 11, fontWeight: 400, color: SUBTLE }}>
        {fmtDay(log.timestamp)}
      </span>
    </div>
  );
}

function MedColumn({ med, logs, onLog }: { med: Med; logs: MedLog[]; onLog: (k: string) => void }) {
  const [pressed, setPressed] = useState(false);
  const [justLogged, setJustLogged] = useState(false);

  const handleTap = () => {
    onLog(med.key);
    setJustLogged(true);
    setTimeout(() => setJustLogged(false), 1100);
  };

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 8 }}>

      <div style={{
        background: SURFACE, borderRadius: 14, padding: "12px 14px 10px",
        display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
        borderTop: `3px solid ${med.color}`,
        border: `1px solid ${BORDER}`,
        borderTopColor: med.color,
      }}>
        <span style={{ fontSize: 22 }}>{med.emoji}</span>
        <span style={{
          fontFamily: "Inter,sans-serif", fontSize: 13, fontWeight: 700,
          color: TEXT, textAlign: "center", lineHeight: 1.25,
        }}>{med.name}</span>
        <span style={{ fontFamily: "Inter,sans-serif", fontSize: 11, color: SUBTLE, fontWeight: 500 }}>
          {logs.length} toma{logs.length !== 1 ? "s" : ""}
        </span>
      </div>

      <button
        onPointerDown={() => setPressed(true)}
        onPointerUp={() => setPressed(false)}
        onPointerLeave={() => setPressed(false)}
        onClick={handleTap}
        style={{
          width: "100%", minHeight: 72,
          background: justLogged ? GREEN : med.color,
          color: "#ffffff", border: "none", borderRadius: 14,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2,
          cursor: "pointer",
          transition: "background 0.3s ease, transform 0.08s ease",
          transform: pressed ? "scale(0.96)" : "scale(1)",
          boxShadow: pressed ? "none" : justLogged ? `0 4px 18px rgba(76,217,100,0.35)` : `0 4px 18px ${med.glow}`,
          userSelect: "none", WebkitTapHighlightColor: "transparent",
          padding: "10px 6px",
        } as React.CSSProperties}
      >
        <span style={{ fontSize: justLogged ? 24 : 20 }}>{justLogged ? "✅" : "💊"}</span>
        <span style={{ fontFamily: "Inter,sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em" }}>
          {justLogged ? "¡LISTO!" : "TOMÉ"}
        </span>
      </button>

      {logs.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "10px 4px",
          color: SUBTLE, fontStyle: "italic",
          fontFamily: "Inter,sans-serif", fontSize: 11, lineHeight: 1.5,
        }}>
          Sin registros
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          {logs.slice(0, 6).map((log, i) => (
            <LogCard key={log.id} log={log} color={med.color} fresh={i === 0} />
          ))}
          {logs.length > 6 && (
            <span style={{ fontFamily: "Inter,sans-serif", fontSize: 10, color: SUBTLE, textAlign: "center" }}>
              +{logs.length - 6} más
            </span>
          )}
        </div>
      )}
    </div>
  );
}

type LogMap = Record<string, MedLog[]>;

function MonthCalendar({ logs, currentMonth, onPrevMonth, onNextMonth }: { logs: LogMap; currentMonth: Date; onPrevMonth: () => void; onNextMonth: () => void }) {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  const medColors: Record<string, string> = {};
  MEDS.forEach(m => { medColors[m.key] = m.color; });

  const cells: React.ReactNode[] = [];

  DAY_NAMES.forEach(d => {
    cells.push(
      <div key={`h-${d}`} style={{
        textAlign: "center", fontFamily: "Inter,sans-serif", fontSize: 10,
        fontWeight: 600, color: SUBTLE, padding: "4px 0",
      }}>
        {d}
      </div>
    );
  });

  for (let i = 0; i < firstDay; i++) {
    cells.push(<div key={`e-${i}`} />);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const medsOnDay = MEDS.filter(m => logs[m.key].some(l => isSameDay(l.timestamp, date)));
    const isToday = isSameDay(date, today);

    cells.push(
      <div key={day} style={{
        textAlign: "center", padding: "5px 0",
        fontFamily: "Inter,sans-serif", fontSize: 12, fontWeight: isToday ? 800 : 500,
        color: isToday ? "#fff" : SUBTLE,
        display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
      }}>
        <span>{day}</span>
        {medsOnDay.length > 0 && (
          <div style={{ display: "flex", gap: 2 }}>
            {medsOnDay.map(m => (
              <div key={m.key} style={{
                width: 5, height: 5, borderRadius: "50%", background: m.color,
              }} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{
      background: SURFACE, borderRadius: 14, padding: "14px",
      border: `1px solid ${BORDER}`,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <button onClick={onPrevMonth} style={{
          background: "none", border: "none", color: TEXT, fontSize: 16,
          cursor: "pointer", padding: "4px 8px", borderRadius: 8,
        }}>
          ◀
        </button>
        <span style={{
          fontFamily: "Inter,sans-serif", fontSize: 14, fontWeight: 700, color: TEXT,
        }}>
          {MONTH_NAMES[month]} {year}
        </span>
        <button onClick={onNextMonth} style={{
          background: "none", border: "none", color: TEXT, fontSize: 16,
          cursor: "pointer", padding: "4px 8px", borderRadius: 8,
        }}>
          ▶
        </button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
        {cells}
      </div>
      <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 10 }}>
        {MEDS.map(m => (
          <div key={m.key} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: m.color }} />
            <span style={{ fontFamily: "Inter,sans-serif", fontSize: 10, color: SUBTLE }}>{m.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [logs, setLogs] = useState<LogMap>({ desaler: [], zinc: [], magnesio: [] });
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [calendarMonth, setCalendarMonth] = useState(() => new Date());

  const handleLog = useCallback((key: string) => {
    setLogs(prev => ({
      ...prev,
      [key]: [{ id: `${Date.now()}-${Math.random()}`, timestamp: new Date() }, ...prev[key]],
    }));
  }, []);

  const handleReset = useCallback(() => {
    setLogs({ desaler: [], zinc: [], magnesio: [] });
  }, []);

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const total = Object.values(logs).reduce((a, l) => a + l.length, 0);

  function fmtDateInput(d: Date) {
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
  }

  return (
    <div style={{ minHeight: "100dvh", background: BG, fontFamily: "Inter,sans-serif" }}>
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-5px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        ::-webkit-scrollbar { display: none; }
        * { -ms-overflow-style: none; scrollbar-width: none; box-sizing: border-box; }
        html, body { background: ${BG}; }
        input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.7); }
      `}</style>

      <div style={{ maxWidth: 480, margin: "0 auto", display: "flex", flexDirection: "column", minHeight: "100dvh", padding: "0 14px 36px", overflowX: "hidden" }}>

        <div style={{ padding: "44px 4px 0" }}>
          <h1 style={{
            fontFamily: "Inter,sans-serif", fontSize: 22, fontWeight: 800,
            color: TEXT, letterSpacing: "-0.03em", lineHeight: 1.1, margin: 0,
          }}>
            Mi Control de Pastillas 💊
          </h1>
          <p style={{ fontFamily: "Inter,sans-serif", fontSize: 13, color: SUBTLE, margin: "5px 0 0", fontWeight: 400 }}>
            Registrá cada medicación por separado.
          </p>
        </div>

        <div style={{ height: 1, background: BORDER, margin: "14px 4px 14px" }} />

        <div style={{ display: "flex", gap: 6, alignItems: "center", minWidth: 0, marginBottom: 14 }}>
          <button
            onClick={() => setSelectedDate(new Date())}
            style={{
              flex: "1 1 0", minWidth: 0, padding: "8px 0", borderRadius: 10, border: "none",
              background: isSameDay(selectedDate, new Date()) ? "#007AFF" : SURFACE,
              color: isSameDay(selectedDate, new Date()) ? "#fff" : SUBTLE,
              fontFamily: "Inter,sans-serif", fontSize: 12, fontWeight: 700,
              cursor: "pointer",
            }}
          >Hoy</button>
          <button
            onClick={() => {
              const y = new Date();
              y.setDate(y.getDate() - 1);
              setSelectedDate(y);
            }}
            style={{
              flex: "1 1 0", minWidth: 0, padding: "8px 0", borderRadius: 10, border: "none",
              background: isSameDay(selectedDate, yesterday) ? "#007AFF" : SURFACE,
              color: isSameDay(selectedDate, yesterday) ? "#fff" : SUBTLE,
              fontFamily: "Inter,sans-serif", fontSize: 12, fontWeight: 700,
              cursor: "pointer",
            }}
          >Ayer</button>
          <input
            type="date"
            value={fmtDateInput(selectedDate)}
            onChange={e => {
              const d = new Date(e.target.value + "T00:00:00");
              if (!isNaN(d.getTime())) setSelectedDate(d);
            }}
            style={{
              flex: "1.5 1 0", minWidth: 0, width: "100%", padding: "8px 10px", borderRadius: 10, border: "none",
              background: SURFACE, color: TEXT,
              fontFamily: "Inter,sans-serif", fontSize: 12, fontWeight: 600,
              boxSizing: "border-box",
            }}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {MEDS.map(med => (
            <MedColumn key={med.key} med={med} logs={logs[med.key].filter(l => isSameDay(l.timestamp, selectedDate))} onLog={handleLog} />
          ))}
        </div>

        <div style={{ height: 1, background: BORDER, margin: "20px 4px 16px" }} />

        <MonthCalendar
          logs={logs}
          currentMonth={calendarMonth}
          onPrevMonth={() => setCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
          onNextMonth={() => setCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
        />

        <div style={{ padding: "20px 4px 0", display: "flex", justifyContent: "center" }}>
          <button
            onClick={handleReset}
            disabled={total === 0}
            style={{
              background: "none", border: "none",
              color: total === 0 ? SUBTLE : RED,
              fontFamily: "Inter,sans-serif", fontSize: 13, fontWeight: 600,
              cursor: total === 0 ? "default" : "pointer",
              padding: "10px 20px", borderRadius: 8,
              letterSpacing: "0.04em", textTransform: "uppercase",
              opacity: total === 0 ? 0.4 : 1,
            }}
          >
            Resetear historial
          </button>
        </div>

      </div>
    </div>
  );
}
