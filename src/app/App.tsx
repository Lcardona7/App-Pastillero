import { useState, useCallback } from "react";
import "../styles/fonts.css";

// ── palette ──────────────────────────────────────────────
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
  { key: "antihistamina", name: "Anti\nHistamina", emoji: "🌿", color: "#007AFF", glow: "rgba(0,122,255,0.30)" },
  { key: "zinc",          name: "Zinc",            emoji: "⚡", color: "#FF9500", glow: "rgba(255,149,0,0.30)"  },
  { key: "magnesio",      name: "Magnesio",        emoji: "🔮", color: "#AF52DE", glow: "rgba(175,82,222,0.30)"},
];

// ── helpers ───────────────────────────────────────────────
const DAY_NAMES = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

function fmtTime(d: Date) {
  return `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
}
function fmtDay(d: Date) {
  const dd  = String(d.getDate()).padStart(2,"0");
  const mm  = String(d.getMonth()+1).padStart(2,"0");
  const day = DAY_NAMES[d.getDay()];
  return `${day} ${dd}/${mm}`;
}

// ── LogCard ───────────────────────────────────────────────
function LogCard({ log, color, fresh }: { log: MedLog; color: string; fresh: boolean }) {
  return (
    <div
      style={{
        background: SURFACE2,
        borderRadius: 10,
        padding: "8px 10px",
        borderLeft: `3px solid ${color}`,
        animation: fresh ? "slideIn 0.22s ease" : undefined,
        display: "flex",
        flexDirection: "column",
        gap: 1,
      }}
    >
      <span style={{ fontFamily: "Inter,sans-serif", fontSize: 13, fontWeight: 700, color: TEXT }}>
        {fmtTime(log.timestamp)}
      </span>
      <span style={{ fontFamily: "Inter,sans-serif", fontSize: 11, fontWeight: 400, color: SUBTLE }}>
        {fmtDay(log.timestamp)}
      </span>
    </div>
  );
}

// ── MedColumn ─────────────────────────────────────────────
function MedColumn({ med, logs, onLog }: { med: Med; logs: MedLog[]; onLog: (k: string) => void }) {
  const [pressed,    setPressed]    = useState(false);
  const [justLogged, setJustLogged] = useState(false);

  const handleTap = () => {
    onLog(med.key);
    setJustLogged(true);
    setTimeout(() => setJustLogged(false), 1100);
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8, minWidth: 0 }}>

      {/* header card */}
      <div style={{
        background: SURFACE,
        borderRadius: 14,
        padding: "12px 8px 10px",
        display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
        borderTop: `3px solid ${med.color}`,
        border: `1px solid ${BORDER}`,
        borderTopColor: med.color,
      }}>
        <span style={{ fontSize: 20 }}>{med.emoji}</span>
        <span style={{
          fontFamily: "Inter,sans-serif", fontSize: 11, fontWeight: 700,
          color: TEXT, textAlign: "center", lineHeight: 1.25, whiteSpace: "pre-line",
        }}>{med.name}</span>
        <span style={{ fontFamily: "Inter,sans-serif", fontSize: 10, color: SUBTLE, fontWeight: 500 }}>
          {logs.length} toma{logs.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* tap button — Android: slightly squarer radius, no heavy shadow */}
      <button
        onPointerDown={() => setPressed(true)}
        onPointerUp={() => setPressed(false)}
        onPointerLeave={() => setPressed(false)}
        onClick={handleTap}
        style={{
          width: "100%", minHeight: 68,
          background: justLogged ? GREEN : med.color,
          color: "#ffffff", border: "none", borderRadius: 14,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2,
          cursor: "pointer",
          transition: "background 0.3s ease, transform 0.08s ease",
          transform: pressed ? "scale(0.94)" : "scale(1)",
          boxShadow: pressed ? "none" : justLogged ? `0 4px 18px rgba(76,217,100,0.35)` : `0 4px 18px ${med.glow}`,
          userSelect: "none",
          WebkitTapHighlightColor: "transparent",
          padding: "10px 6px",
        } as React.CSSProperties}
      >
        <span style={{ fontSize: justLogged ? 22 : 18 }}>{justLogged ? "✅" : "💊"}</span>
        <span style={{ fontFamily: "Inter,sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.06em" }}>
          {justLogged ? "¡LISTO!" : "TOMÉ"}
        </span>
      </button>

      {/* log list */}
      {logs.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "14px 4px",
          color: SUBTLE, fontStyle: "italic",
          fontFamily: "Inter,sans-serif", fontSize: 10, lineHeight: 1.5,
        }}>
          Sin registros
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
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

// ── App ───────────────────────────────────────────────────
type LogMap = Record<string, MedLog[]>;

export default function App() {
  const [logs, setLogs] = useState<LogMap>({ antihistamina: [], zinc: [], magnesio: [] });

  const handleLog = useCallback((key: string) => {
    setLogs(prev => ({
      ...prev,
      [key]: [{ id: `${Date.now()}-${Math.random()}`, timestamp: new Date() }, ...prev[key]],
    }));
  }, []);

  const handleReset = useCallback(() => {
    setLogs({ antihistamina: [], zinc: [], magnesio: [] });
  }, []);

  const total = Object.values(logs).reduce((a, l) => a + l.length, 0);

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
      `}</style>

      <div style={{ maxWidth: 480, margin: "0 auto", display: "flex", flexDirection: "column", minHeight: "100dvh", padding: "0 0 36px" }}>

        {/* Android-style top bar */}
        <div style={{ padding: "44px 18px 0" }}>
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

        <div style={{ height: 1, background: BORDER, margin: "16px 18px 18px" }} />

        {/* 3-column grid */}
        <div style={{ padding: "0 10px", display: "flex", gap: 8, flex: 1, alignItems: "flex-start" }}>
          {MEDS.map(med => (
            <MedColumn key={med.key} med={med} logs={logs[med.key]} onLog={handleLog} />
          ))}
        </div>

        {/* reset — Android text button style */}
        <div style={{ padding: "24px 18px 0", display: "flex", justifyContent: "center" }}>
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
