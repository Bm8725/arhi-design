'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function DashHeader() {
  const [time, setTime] = useState('');

  // Ceas digital simplu pe format 24h
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toTimeString().split(' ')[0]);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header style={styles.header}>
      {/* Partea stângă: Brand & Core Info */}
      <div style={styles.left}>
        <Link href="/dashboard" style={styles.logo}>
          PROARH<span>.4D</span>
        </Link>
        <div style={styles.badge}>DASHBOARD</div>
      </div>

      {/* Partea dreaptă: Versiune, Status & Ceas */}
      <div style={styles.right}>
        <div style={styles.item}>
          <span style={styles.label}>app powered by BM</span>
          <span style={styles.value}>V. 0.1.13</span>
        </div>
        



      </div>

      {/* Injectare stiluri responsive direct în componentă */}
      <style>{`
        @media (max-width: 600px) {
          .hidden-mobile { display: none !important; }
        }
      `}</style>
    </header>
  );
}

/// Obiectul de stiluri inline optimizat pentru design-ul tău Antracit
const styles: Record<string, React.CSSProperties> = {
  header: {
    width: '100%',
    height: '60px',
    background: '#0f0f0f',       /* Fundal puțin mai deschis decât antracitul general pentru separare */
    borderBottom: '2px solid #1f1f1f', /* Linie groasă de demarcație specifică Monaco */
    padding: '0 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontFamily: "'DM Mono', 'Monaco', monospace",
    position: 'fixed',
    top: 0,
    left: 0,
    zIndex: 100,                 /* REPARAT: Schimbat din z-index în zIndex */
  },
  left: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  logo: {
    fontSize: '16px',
    fontWeight: 700,
    color: '#ffffff',
    textDecoration: 'none',
    letterSpacing: '0.05em',
  },
  badge: {
    fontSize: '10px',
    fontWeight: 700,
    background: '#1a1a1a',
    color: '#e2b36e',           /* Auriul caracteristic ca accent */
    padding: '4px 8px',
    border: '1px solid #222222',
    letterSpacing: '0.1em',
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
  },
  item: {
    fontSize: '12px',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  label: {
    color: '#555555',           /* Text gri închis pentru etichete tehnice */
  },
  value: {
    color: '#ffffff',
  },
};
