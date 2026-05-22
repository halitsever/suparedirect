import { useState, useEffect, useCallback } from "react";
import styles from "./App.module.css";

interface RedirectLog {
  id: number;
  url: string;
  timestamp: string;
  userAgent: string;
}

interface Stats {
  total: number;
  history: RedirectLog[];
}

const getHostname = (url: string): string => {
  try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return url; }
};

const getPath = (url: string): string => {
  try {
    const u = new URL(url);
    return (u.pathname === "/" ? "" : u.pathname) + (u.search || "");
  } catch { return ""; }
};

const formatTs = (iso: string): string => {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
};

const formatClock = (d: Date): string =>
  d.toLocaleTimeString("en-US", { hour12: true, hour: "numeric", minute: "2-digit", second: "2-digit" });

// ── Icons ─────────────────────────────────────────────────────────────────────

const ArrowUR = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 17 17 7" /><path d="M8 7h9v9" />
  </svg>
);

const ClockIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />
  </svg>
);

const ChartIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4v16h16" /><path d="M8 14l3-3 3 3 4-5" />
  </svg>
);

const RefreshIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 0 1 15.5-6.3L21 8" /><path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-15.5 6.3L3 16" /><path d="M3 21v-5h5" />
  </svg>
);

const Logo = ({ size = 42 }: { size?: number }) => (
  <img src="/icon.svg" alt="Suparedirect" width={size} height={size} className={styles.logoImg} />
);

// ── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  const [stats, setStats] = useState<Stats>({ total: 0, history: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [clockStr, setClockStr] = useState(() => formatClock(new Date()));

  // live 1-second clock for "Last updated" stamp
  useEffect(() => {
    const t = setInterval(() => setClockStr(formatClock(new Date())), 1000);
    return () => clearInterval(t);
  }, []);

  const fetchStats = useCallback(async (manual = false) => {
    if (manual) setRefreshing(true);
    try {
      const res = await fetch("/api/stats");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: Stats = await res.json();
      setStats(data);
      setError(null);
    } catch {
      setError("Could not connect to backend. Is the server running?");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(() => fetchStats(), 5000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  const handleRefresh = () => {
    setSpinning(true);
    setTimeout(() => setSpinning(false), 800);
    fetchStats(true);
  };

  const last = stats.history[0] ?? null;

  return (
    <div className={styles.app}>
      <div className={styles.wrap}>

        <header className={styles.header}>
          <div className={styles.brand}>
            <Logo size={42} />
            <div>
              <h1 className={styles.brandName}>Suparedirect</h1>
              <p className={styles.brandTagline}>Anonymous redirect service</p>
            </div>
          </div>
          <div className={styles.headerRight}>
            <div className={styles.stamp}>
              <i className={styles.liveIndicator} />
              Last updated · <span className={styles.mono}>{clockStr}</span>
            </div>
            <button
              className={`${styles.refreshBtn}${spinning ? ` ${styles.spinning}` : ""}`}
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <span className={styles.refreshIcon}><RefreshIcon /></span>
              Refresh
            </button>
          </div>
        </header>

        {error && (
          <div className={styles.errorBanner}>
            <span>⚠</span> {error}
          </div>
        )}

        <section className={styles.statsGrid}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.cardLabel}>Total redirects</span>
              <span className={styles.cardIcon}><ArrowUR /></span>
            </div>
            <div className={styles.cardNum}>
              {loading ? "—" : String(stats.total).padStart(2, "0")}
            </div>
            <div className={styles.cardFoot}>since service start</div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.cardLabel}>Records in memory</span>
              <span className={styles.cardIcon}><ChartIcon /></span>
            </div>
            <div className={styles.cardNum}>
              {loading ? "—" : String(stats.history.length).padStart(2, "0")}
            </div>
            <div className={styles.cardFoot}>retained · ephemeral</div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.cardLabel}>Last redirect</span>
              <span className={styles.cardIcon}><ClockIcon /></span>
            </div>
            <div className={`${styles.cardNum}${!last ? ` ${styles.cardNumDim}` : ""}`}>
              {loading || !last ? "—" : formatTs(last.timestamp)}
            </div>
            <div className={styles.cardFoot}>
              {last ? getHostname(last.url) : "no events yet"}
            </div>
          </div>
        </section>

        <section className={styles.history}>
          <div className={styles.historyHeader}>
            <h2>Redirect history</h2>
            <span className={styles.pill}>
              {stats.history.length} {stats.history.length === 1 ? "record" : "records"}
            </span>
          </div>

          {loading ? (
            <div className={styles.empty}>
              <div className={styles.spinner} />
              <div className={styles.emptyTitle}>Loading…</div>
            </div>
          ) : stats.history.length === 0 ? (
            <div className={styles.empty}>
              <div className={styles.emptyIconBox}><ArrowUR size={20} /></div>
              <div className={styles.emptyTitle}>No redirects yet</div>
              <div className={styles.emptyHint}>Test with ?to=https://example.com</div>
            </div>
          ) : (
            <div className={styles.rows}>
              {stats.history.map((log) => (
                <div className={styles.row} key={log.id}>
                  <div className={`${styles.rowTs} ${styles.mono}`}>
                    {formatTs(log.timestamp)}
                  </div>
                  <div className={styles.rowUrl}>
                    <span className={styles.rowHost}>{getHostname(log.url)}</span>
                    <span className={`${styles.rowPath} ${styles.mono}`}>{getPath(log.url)}</span>
                  </div>
                  <div className={`${styles.rowMeta} ${styles.mono}`}>
                    <span className={styles.dot} />
                    <ArrowUR size={12} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <footer className={styles.footer}>
          Suparedirect dashboard · auto-refreshes every 5 seconds
        </footer>
      </div>
    </div>
  );
}
