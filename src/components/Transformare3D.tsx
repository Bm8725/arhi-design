"use client";

import { useState, useRef } from 'react';
import type { MouseEvent as ReactMouseEvent, TouchEvent } from 'react';
import { Eye, MoveHorizontal } from 'lucide-react';

const IMG_AFTER  = '/design.png';
const IMG_BEFORE = '/plan.png';

export default function Transformare3D() {
  const [pos, setPos]           = useState(50);
  const [dragging, setDragging] = useState(false);
  const [hovered, setHovered]   = useState(false);
  const containerRef            = useRef<HTMLDivElement>(null);

  const move = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const p    = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100));
    setPos(p);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400&display=swap');

        .t3-section {
          background: #000;
          padding: 96px 40px;
          border-top: 1px solid #111;
          font-family: 'DM Mono', monospace;
        }

        .t3-inner { max-width: 1200px; margin: 0 auto; }

        .t3-header {
          display: flex; flex-direction: column; gap: 24px;
          margin-bottom: 56px;
        }
        @media(min-width:768px){
          .t3-header { flex-direction: row; align-items: flex-end; justify-content: space-between; }
        }

        .t3-eyebrow {
          display: flex; align-items: center; gap: 12px;
          margin-bottom: 14px;
        }
        .t3-eyebrow-line { height: 1px; width: 28px; background: #333; }
        .t3-eyebrow-text {
          font-size: 9px; letter-spacing: 0.32em; text-transform: uppercase; color: #444;
        }

        .t3-title {
          font-size: clamp(28px, 4vw, 46px);
          font-weight: 300; color: #fff;
          letter-spacing: -0.02em; line-height: 1.1;
        }
        .t3-title em { font-style: italic; color: #888; }

        .t3-desc {
          font-size: 11px; color: #444; line-height: 1.8;
          max-width: 280px; letter-spacing: 0.03em;
        }

        /* CONTAINER */
        .t3-container {
          position: relative; width: 100%;
          height: 420px; overflow: hidden;
          cursor: ew-resize; user-select: none;
          border: 1px solid #1a1a1a;
          background: #111;
        }
        @media(min-width:768px){ .t3-container { height: 620px; } }

        .t3-img {
          position: absolute; inset: 0;
          background-size: cover; background-position: center;
          transition: filter 0.3s;
        }

        .t3-img-before {
          z-index: 2;
          filter: grayscale(0.3) brightness(0.9);
        }

        .t3-img-after {
          z-index: 1;
          filter: brightness(0.85);
        }

        /* LABELS */
        .t3-label {
          position: absolute; bottom: 20px;
          font-size: 9px; letter-spacing: 0.28em; text-transform: uppercase;
          pointer-events: none; z-index: 10;
          padding: 7px 14px;
          backdrop-filter: blur(8px);
        }
        .t3-label-before {
          left: 20px; background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.12); color: #fff;
          z-index: 11;
        }
        .t3-label-after {
          right: 20px; background: rgba(0,0,0,0.5);
          border: 1px solid #222; color: #666;
        }

        /* DIVIDER LINE */
        .t3-line {
          position: absolute; top: 0; bottom: 0; width: 1px;
          background: rgba(255,255,255,0.5);
          z-index: 20; pointer-events: none;
          transition: background 0.2s;
        }
        .t3-line.active { background: #fff; }

        /* TOP & BOTTOM TICK */
        .t3-tick {
          position: absolute; left: 50%; transform: translateX(-50%);
          width: 1px; height: 20px; background: rgba(255,255,255,0.3);
        }
        .t3-tick-top { top: 0; }
        .t3-tick-bottom { bottom: 0; }

        /* HANDLE */
        .t3-handle {
          position: absolute; top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          width: 44px; height: 44px; border-radius: 50%;
          background: #fff; color: #000;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 0 0 1px rgba(255,255,255,0.1), 0 8px 32px rgba(0,0,0,0.6);
          transition: transform 0.15s, box-shadow 0.15s;
          cursor: ew-resize;
          z-index: 21;
        }
        .t3-handle:hover,
        .t3-handle.active {
          transform: translate(-50%, -50%) scale(1.1);
          box-shadow: 0 0 0 6px rgba(255,255,255,0.08), 0 8px 40px rgba(0,0,0,0.8);
        }

        /* FOOTER */
        .t3-footer {
          margin-top: 20px;
          display: flex; justify-content: space-between; align-items: center;
        }
        .t3-hint {
          display: flex; align-items: center; gap: 8px;
          font-size: 9px; letter-spacing: 0.2em; text-transform: uppercase; color: #2e2e2e;
        }
        .t3-percent {
          font-size: 9px; letter-spacing: 0.2em; color: #2e2e2e;
          font-variant-numeric: tabular-nums;
        }
      `}</style>

      <section className="t3-section">
        <div className="t3-inner">

          <div className="t3-header">
            <div>
              <div className="t3-eyebrow">
                <span className="t3-eyebrow-line" />
                <span className="t3-eyebrow-text">Concept vs Realitate</span>
              </div>
              <h2 className="t3-title">
                De la schiță la <em>plan concret</em>
              </h2>
            </div>
            <p className="t3-desc">
              Trage cursorul pentru a vedea transformarea de la liniile tehnice CAD la randarea 3D finală.
            </p>
          </div>

          <div
            ref={containerRef}
            className="t3-container"
            onMouseMove={e => { if (dragging) move(e.clientX); }}
            onMouseDown={e => { setDragging(true); move(e.clientX); }}
            onMouseUp={() => setDragging(false)}
            onMouseLeave={() => setDragging(false)}
            onTouchMove={e => move(e.touches[0].clientX)}
            onTouchStart={e => { setDragging(true); move(e.touches[0].clientX); }}
            onTouchEnd={() => setDragging(false)}
            onMouseEnter={() => setHovered(true)}
          >
            {/* AFTER — 3D render */}
            <div className="t3-img t3-img-after" style={{ backgroundImage: `url('${IMG_AFTER}')` }} />

            {/* BEFORE — CAD sketch, clipped */}
            <div
              className="t3-img t3-img-before"
              style={{
                backgroundImage: `url('${IMG_BEFORE}')`,
                clipPath: `polygon(0 0, ${pos}% 0, ${pos}% 100%, 0 100%)`,
              }}
            />

            {/* LABELS */}
            <div className="t3-label t3-label-before" style={{ opacity: pos > 15 ? 1 : 0, transition: 'opacity 0.3s' }}>
              Schiță Tehnică
            </div>
            <div className="t3-label t3-label-after" style={{ opacity: pos < 85 ? 1 : 0, transition: 'opacity 0.3s' }}>
              Randare 3D
            </div>

            {/* DIVIDER */}
            <div className={`t3-line${dragging ? ' active' : ''}`} style={{ left: `${pos}%` }}>
              <div className="t3-tick t3-tick-top" />
              <div className="t3-tick t3-tick-bottom" />
              <div className={`t3-handle${dragging ? ' active' : ''}`}>
                <MoveHorizontal size={16} strokeWidth={1.5} />
              </div>
            </div>
          </div>

          <div className="t3-footer">
            <div className="t3-hint">
              <Eye size={11} />
              <span>Drag to compare</span>
            </div>
            <div className="t3-percent">{Math.round(pos)}% / {Math.round(100 - pos)}%</div>
          </div>

        </div>
      </section>
    </>
  );
}