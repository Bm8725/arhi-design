'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function DashHeader() {
  const [time, setTime] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toTimeString().split(' ')[0]);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Închide dropdown-ul la click în afara lui
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header style={styles.header}>
      {/* Partea stângă: Brand & Core Info */}
      <div style={styles.left}>
        <Link href="/" style={styles.logoContainer}>
          <div style={styles.logoImgWrapper}>
            <Image
              src="/arhi4d.png"
              alt="Proarh.4d Logo"
              fill
              style={{ objectFit: 'contain' }}
              priority
            />
          </div>
          <span style={styles.logoText}>
            PROARH<span style={{ color: '#e2b36e' }}>.4D</span>
          </span>
        </Link>
        <div style={styles.badge}>DASHBOARD</div>
      </div>

      {/* Partea dreaptă: Versiune + Dropdown (autor / contract) */}
      <div style={styles.right}>
        <div ref={dropdownRef} style={styles.dropdownWrapper}>
          <button
            onClick={() => setDropdownOpen((v) => !v)}
            style={styles.item}
          >
            <span style={styles.label}>app designed by BM</span>
            <span style={styles.value}>V. 0.1.13</span>
            <span
              style={{
                ...styles.chevron,
                transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              }}
            >
              ▾
            </span>
          </button>


          {dropdownOpen && (
            <div style={styles.dropdownPanel}>
              <div style={styles.dropdownRow}>
                <span style={styles.dropdownLabel}>Repository</span>
                {/* Pune aici numele autorului */}
                <span style={styles.dropdownValue}>https://github.com/Bm8725/arhi-design </span>
              </div>

              <div style={styles.dropdownDivider} />

              <div style={styles.dropdownRow}>
                <span style={styles.dropdownLabel}>Contact</span>
                {/* Pune aici numărul / ID-ul contractului */}
                <span style={styles.dropdownValue}>+40729411747</span>
              </div>
              
                 <div style={styles.dropdownRow}>
                <span style={styles.dropdownLabel}>e-mail</span>
                {/* Pune aici numărul / ID-ul contractului */}
                <span style={styles.dropdownValue}>marius_service@yahoo.com</span>
              </div>
              <div style={styles.dropdownDivider} />
                                <div style={styles.dropdownRow}>
                <span style={styles.dropdownLabel}>about app</span>
                {/* Pune aici numărul / ID-ul contractului */}
                <span style={styles.dropdownValue}>This app is designed for managing architectural designs and documentation into the modern world. Used the latest technology and frameworks to ensure a smooth and efficient workflow for architects, designers and customers. full stack: NEXT.JS, postgre DB, vercel, cloud infrastructure </span>
           
              </div>

            </div>
          )}
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

// Obiectul de stiluri inline optimizat pentru design-ul tău Antracit
const styles: Record<string, React.CSSProperties> = {
  header: {
    width: '100%',
    height: '60px',
    background: '#0f0f0f',
    borderBottom: '2px solid #1f1f1f',
    padding: '0 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontFamily: "'DM Mono', 'Monaco', monospace",
    position: 'fixed',
    top: 0,
    left: 0,
    zIndex: 100,
  },
  left: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    textDecoration: 'none',
  },
  logoImgWrapper: {
    position: 'relative',
    width: '24px',
    height: '24px',
  },
  logoText: {
    fontSize: '16px',
    fontWeight: 700,
    color: '#ffffff',
    letterSpacing: '0.05em',
  },
  badge: {
    fontSize: '10px',
    fontWeight: 700,
    background: '#1a1a1a',
    color: '#e2b36e',
    padding: '4px 8px',
    border: '1px solid #222222',
    letterSpacing: '0.1em',
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
  },
  dropdownWrapper: {
    position: 'relative',
  },
  item: {
    fontSize: '12px',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: 'transparent',
    border: 'none',
    padding: 0,
    cursor: 'pointer',
    fontFamily: "'DM Mono', 'Monaco', monospace",
  },
  label: {
    color: '#555555',
  },
  value: {
    color: '#ffffff',
  },
  chevron: {
    color: '#e2b36e',
    fontSize: '10px',
    marginLeft: '2px',
    transition: 'transform 0.2s ease',
    display: 'inline-block',
  },
  dropdownPanel: {
    position: 'absolute',
    top: 'calc(100% + 12px)',
    right: 0,
    minWidth: '220px',
    background: '#302d2d',
    border: '1px solid #1f1f1f',
    boxShadow: '0 16px 40px rgba(0,0,0,0.55)',
    padding: '14px 16px',
    zIndex: 101,
    fontFamily: "'DM Mono', 'Monaco', monospace",
  },
  dropdownRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  dropdownLabel: {
    fontSize: '10px',
    fontWeight: 700,
    color: '#555555',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
  },
  dropdownValue: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#ffffff',
  },
  dropdownDivider: {
    height: '1px',
    background: '#1f1f1f',
    margin: '10px 0',
  },
};