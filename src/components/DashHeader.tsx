'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { GitBranch, GitCommit, Clock, Phone, Mail, Info } from 'lucide-react';

const GITHUB_REPO = 'Bm8725/arhi-design';

interface RepoStats {
  commits: number | null;
  lastUpdate: string | null;
  lastCommitMessage: string | null;
  lastCommitSha: string | null;
  loading: boolean;
  eroare: boolean;
}

// Un rând de dropdown cu iconiță + label + conținut — reutilizat pentru toate rubricile
function DropdownRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div style={styles.dropdownRowWrap}>
      <div style={styles.dropdownIconWrap}>{icon}</div>
      <div style={styles.dropdownRowContent}>
        <span style={styles.dropdownLabel}>{label}</span>
        {children}
      </div>
    </div>
  );
}

export default function DashHeader() {
  const [time, setTime] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [repoStats, setRepoStats] = useState<RepoStats>({
    commits: null,
    lastUpdate: null,
    lastCommitMessage: null,
    lastCommitSha: null,
    loading: true,
    eroare: false,
  });

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

  // Fetch stats din GitHub — nr. de commit-uri, data ultimei actualizări și
  // mesajul ultimului commit. Se încarcă o singură dată, doar când dropdown-ul
  // e deschis prima oară, ca să nu consumăm din rate-limit-ul GitHub degeaba.
  useEffect(() => {
    if (!dropdownOpen || repoStats.commits !== null || repoStats.eroare) return;

    let isMounted = true;
    async function fetchGithubStats() {
      try {
        const [repoRes, commitsRes] = await Promise.all([
          fetch(`https://api.github.com/repos/${GITHUB_REPO}`),
          fetch(`https://api.github.com/repos/${GITHUB_REPO}/commits?per_page=1`),
        ]);

        if (!repoRes.ok || !commitsRes.ok) throw new Error('GitHub API a răspuns cu eroare');

        // Trick-ul standard GitHub pentru numărul total de commit-uri: header-ul
        // "Link" din răspunsul paginat conține numărul ultimei pagini.
        const linkHeader = commitsRes.headers.get('link');
        let commitCount: number | null = null;
        if (linkHeader) {
          const match = linkHeader.match(/&page=(\d+)>;\s*rel="last"/);
          if (match) commitCount = parseInt(match[1], 10);
        }

        const [repoData, commitsData] = await Promise.all([repoRes.json(), commitsRes.json()]);

        // Dacă nu există header de paginare, înseamnă că există o singură pagină de commit-uri
        if (commitCount === null) {
          commitCount = Array.isArray(commitsData) ? commitsData.length : null;
        }

        const ultimulCommit = Array.isArray(commitsData) ? commitsData[0] : null;
        const mesajComplet: string | null = ultimulCommit?.commit?.message ?? null;
        const primaLinie = mesajComplet ? mesajComplet.split('\n')[0] : null;

        if (isMounted) {
          setRepoStats({
            commits: commitCount,
            lastUpdate: repoData.pushed_at ?? repoData.updated_at ?? null,
            lastCommitMessage: primaLinie
              ? primaLinie.length > 54
                ? primaLinie.slice(0, 54) + '…'
                : primaLinie
              : null,
            lastCommitSha: ultimulCommit?.sha ? ultimulCommit.sha.slice(0, 7) : null,
            loading: false,
            eroare: false,
          });
        }
      } catch (err) {
        console.error('Eroare la fetch statistici GitHub:', err);
        if (isMounted) {
          setRepoStats((prev) => ({ ...prev, loading: false, eroare: true }));
        }
      }
    }

    fetchGithubStats();
    return () => {
      isMounted = false;
    };
  }, [dropdownOpen, repoStats.commits, repoStats.eroare]);

  const dataFormatata = repoStats.lastUpdate
    ? new Date(repoStats.lastUpdate).toLocaleDateString('ro-RO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }) +
      ' · ' +
      new Date(repoStats.lastUpdate).toLocaleTimeString('ro-RO', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

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
              <div style={styles.dropdownPanelHeader}>
                <span style={styles.dropdownPanelTitle}>Despre aplicație</span>
                <span style={styles.dropdownPanelVersion}>v0.1.13</span>
              </div>

              <div style={styles.dropdownSection}>
                <DropdownRow icon={<GitBranch size={13} strokeWidth={1.75} />} label="Repository">
                  <a
                    href="https://github.com/Bm8725/arhi-design"
                    target="_blank"
                    rel="noreferrer"
                    style={styles.dropdownLink}
                  >
                    github.com/Bm8725/arhi-design
                  </a>
                </DropdownRow>

                <DropdownRow icon={<GitCommit size={13} strokeWidth={1.75} />} label="Commit-uri">
                  <span style={styles.dropdownValue}>
                    {repoStats.loading
                      ? 'Se încarcă...'
                      : repoStats.eroare
                      ? '—'
                      : (repoStats.commits ?? '—')}
                  </span>
                  {!repoStats.loading && !repoStats.eroare && repoStats.lastCommitMessage && (
                    <span style={styles.commitLine}>
                      <span style={styles.commitSha}>{repoStats.lastCommitSha}</span>
                      <span style={styles.commitMessage}>{repoStats.lastCommitMessage}</span>
                    </span>
                  )}
                </DropdownRow>

                <DropdownRow icon={<Clock size={13} strokeWidth={1.75} />} label="Ultima actualizare">
                  <span style={styles.dropdownValue}>
                    {repoStats.loading ? 'Se încarcă...' : repoStats.eroare ? '—' : dataFormatata ?? '—'}
                  </span>
                </DropdownRow>
              </div>

              <div style={styles.dropdownDivider} />

              <div style={styles.dropdownSection}>
                <DropdownRow icon={<Phone size={13} strokeWidth={1.75} />} label="Contact">
                  <span style={styles.dropdownValue}>+40729411747</span>
                </DropdownRow>

                <DropdownRow icon={<Mail size={13} strokeWidth={1.75} />} label="E-mail">
                  <span style={styles.dropdownValue}>marius_service@yahoo.com</span>
                </DropdownRow>
              </div>

              <div style={styles.dropdownDivider} />

              <div style={styles.dropdownSection}>
                <DropdownRow icon={<Info size={13} strokeWidth={1.75} />} label="Despre">
                  <p style={styles.aboutText}>
                    Aplicație pentru gestionarea proiectelor și documentației de arhitectură.
                    Full stack: Next.js, PostgreSQL, Vercel, infrastructură cloud.
                  </p>
                </DropdownRow>
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
    minWidth: '300px',
    maxWidth: '340px',
    background: '#181818',
    border: '1px solid #262626',
    borderTop: '2px solid #e2b36e',
    borderRadius: '6px',
    boxShadow: '0 20px 48px rgba(0,0,0,0.6)',
    padding: '0',
    zIndex: 101,
    fontFamily: "'DM Mono', 'Monaco', monospace",
    overflow: 'hidden',
  },
  dropdownPanelHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    background: '#0f0f0f',
    borderBottom: '1px solid #262626',
  },
  dropdownPanelTitle: {
    fontSize: '10px',
    fontWeight: 700,
    color: '#e2b36e',
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
  },
  dropdownPanelVersion: {
    fontSize: '10px',
    color: '#555555',
  },
  dropdownSection: {
    padding: '10px 8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  dropdownRowWrap: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    padding: '7px 8px',
    borderRadius: '4px',
  },
  dropdownIconWrap: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '22px',
    height: '22px',
    flexShrink: 0,
    marginTop: '1px',
    color: '#e2b36e',
    background: 'rgba(226,179,110,0.08)',
    borderRadius: '4px',
  },
  dropdownRowContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '3px',
    minWidth: 0,
  },
  dropdownLabel: {
    fontSize: '9.5px',
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
  dropdownLink: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#ffffff',
    textDecoration: 'none',
    borderBottom: '1px solid rgba(255,255,255,0.2)',
    width: 'fit-content',
  },
  commitLine: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginTop: '2px',
  },
  commitSha: {
    fontSize: '10px',
    color: '#e2b36e',
    background: 'rgba(226,179,110,0.1)',
    padding: '1px 5px',
    borderRadius: '3px',
    flexShrink: 0,
  },
  commitMessage: {
    fontSize: '11px',
    color: '#999999',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  aboutText: {
    fontSize: '11.5px',
    color: '#999999',
    lineHeight: 1.5,
    margin: 0,
  },
  dropdownDivider: {
    height: '1px',
    background: '#262626',
    margin: '0',
  },
};