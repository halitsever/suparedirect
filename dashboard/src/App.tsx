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

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max) + "…" : str;
}

export default function App() {
  const [stats, setStats] = useState<Stats>({ total: 0, history: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = useCallback(async (manual = false) => {
    if (manual) setRefreshing(true);
    try {
      const res = await fetch("/api/stats");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: Stats = await res.json();
      setStats(data);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
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

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.logo}>
            <img src="/icon.svg" alt="Suparedirect" className={styles.logoIcon} />
            <span className={styles.logoText}>Suparedirect</span>
          </div>
          <p className={styles.tagline}>Anonymous redirect service</p>
        </div>
        <div className={styles.headerRight}>
          {lastUpdated && (
            <span className={styles.lastUpdated}>
              {refreshing ? "Refreshing…" : `Last updated: ${lastUpdated.toLocaleTimeString()}`}
            </span>
          )}
          <button
            className={styles.refreshBtn}
            onClick={() => fetchStats(true)}
            disabled={refreshing}
          >
            ↺ Refresh
          </button>
        </div>
      </header>

      <main className={styles.main}>
        {error && (
          <div className={styles.errorBanner}>
            <span>⚠</span> {error}
          </div>
        )}

        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statValue}>
              {loading ? "—" : stats.total.toLocaleString()}
            </div>
            <div className={styles.statLabel}>Total Redirects</div>
            <div className={styles.statIcon}>↗</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>
              {loading ? "—" : stats.history.length.toLocaleString()}
            </div>
            <div className={styles.statLabel}>Records in Memory</div>
            <div className={styles.statIcon}>◷</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>
              {loading || stats.history.length === 0
                ? "—"
                : formatTime(stats.history[0].timestamp).split(",")[0]}
            </div>
            <div className={styles.statLabel}>Last Redirect</div>
            <div className={styles.statIcon}>⏱</div>
          </div>
        </div>

        <section className={styles.tableSection}>
          <div className={styles.tableSectionHeader}>
            <h2>Redirect History</h2>
            <span className={styles.badge}>{stats.history.length} records</span>
          </div>

          {loading ? (
            <div className={styles.placeholder}>
              <div className={styles.spinner} />
              <span>Loading…</span>
            </div>
          ) : stats.history.length === 0 ? (
            <div className={styles.placeholder}>
              <span className={styles.emptyIcon}>↗</span>
              <span>No redirects yet</span>
              <small>Test with ?to=https://example.com</small>
            </div>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Target URL</th>
                    <th>Time</th>
                    <th>User Agent</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.history.map((log) => (
                    <tr key={log.id}>
                      <td className={styles.idCell}>{log.id}</td>
                      <td className={styles.urlCell}>
                        <a
                          href={log.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={log.url}
                        >
                          {truncate(log.url, 60)}
                        </a>
                      </td>
                      <td className={styles.timeCell}>{formatTime(log.timestamp)}</td>
                      <td className={styles.uaCell} title={log.userAgent}>
                        {truncate(log.userAgent, 50)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      <footer className={styles.footer}>
        <span>Suparedirect Dashboard — auto-refreshes every 5 seconds</span>
      </footer>
    </div>
  );
}
