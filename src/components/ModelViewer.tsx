'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Center, Stats } from '@react-three/drei';
import { Suspense, useCallback, useRef, useState } from 'react';
import type { WebGLRenderer } from 'three';

function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} scale={1} />;
}

export default function ModelViewer() {
  // Definim coordonatele separat pentru a evita erorile de parsare JSX
  const cameraPosition: [number, number, number] = [0, 0, 5];
  const lightPosition: [number, number, number] = [10, 10, 10];
  const pointLightPosition: [number, number, number] = [-10, -10, -10];

  // referință spre renderer-ul WebGL, ca să putem "fotografia" cadrul curent
  const glRef = useRef<WebGLRenderer | null>(null);

  const [shareOpen, setShareOpen] = useState(false);
  const [snapshot, setSnapshot] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const captureSnapshot = useCallback(() => {
    const gl = glRef.current;
    if (!gl) return null;
    // gl.domElement este chiar <canvas>-ul pe care s-a randat modelul 3D
    return gl.domElement.toDataURL('image/png');
  }, []);

  function openShare() {
    setSnapshot(captureSnapshot());
    setShareOpen(true);
  }

  async function handleNativeShare() {
    const pageUrl = typeof window !== 'undefined' ? window.location.href : '';
    const title = 'Interactive 3D Render — Proarh.4D';
    const text = 'This is the 3D render of the project 3dPool (3D Engine powered by BM). proarh.4d-arh. Bogdan Sotîngeanu. Birou de arhitectura +40 743 193 627. Targoviste, Dambovita.';

    try {
      let filesToShare: File[] | undefined;

      if (snapshot) {
        try {
          const res = await fetch(snapshot);
          const blob = await res.blob();
          const file = new File([blob], 'proarh4d-randare-3d.png', { type: 'image/png' });
          if (typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] })) {
            filesToShare = [file];
          }
        } catch {
          // dacă thumbnail-ul nu poate fi atașat, mergem mai departe doar cu linkul
        }
      }

      if (navigator.share) {
        await navigator.share({
          title,
          text,
          url: pageUrl,
          ...(filesToShare ? { files: filesToShare } : {}),
        });
      } else {
        await navigator.clipboard.writeText(pageUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // share anulat de utilizator — nu facem nimic
    }
  }

  function handleDownload() {
    if (!snapshot) return;
    const a = document.createElement('a');
    a.href = snapshot;
    a.download = 'proarh4d-randare-3d.png';
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  async function handleCopyLink() {
    const pageUrl = typeof window !== 'undefined' ? window.location.href : '';
    await navigator.clipboard.writeText(pageUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="w-full h-[350px] md:h-[450px] bg-zinc-900/50 border border-white/5 rounded mt-6 overflow-hidden relative group">
      <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur-md text-[10px] tracking-widest text-amber-500 uppercase px-3 py-1.5 border border-amber-500/20 rounded">
       3D pool project-zoom and rotate
      </div>

      <button
        type="button"
        onClick={openShare}
        aria-label="Distribuie randarea 3D"
        className="absolute top-4 right-4 z-10 flex items-center gap-2 bg-black/60 backdrop-blur-md text-[10px] tracking-widest text-white/70 uppercase px-3 py-1.5 border border-white/15 rounded hover:border-amber-500 hover:text-amber-500 transition-colors"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13" />
        </svg>
        Distribuie
      </button>

      <Canvas
        camera={{ position: cameraPosition, fov: 45 }}
        gl={{ preserveDrawingBuffer: true }}
        onCreated={({ gl }) => {
          glRef.current = gl;
        }}
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={lightPosition} intensity={1.5} />
        <pointLight position={pointLightPosition} intensity={0.5} />

        <Suspense fallback={null}>
          <Center>
            <Model url="/modele/3dpool.glb" />
          </Center>
        </Suspense>

        <OrbitControls
          enablePan={true}
          enableZoom={true}
          minDistance={2}
          maxDistance={15}
          makeDefault
        />

        {/*
          Panou de performanță (FPS / ms per cadru / MB memorie).
          Browserul nu expune % real de CPU/GPU către JS din motive
          de securitate — FPS-ul e cel mai apropiat indicator real
          al "stresului" de randare.
        */}
        <Stats className="!absolute !top-16 !right-4 !left-auto" />
      </Canvas>

      {/* ── panou de share, cu thumbnail luat direct din randarea 3D curentă ── */}
      {shareOpen && (
        <div
          className="absolute inset-0 z-20 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setShareOpen(false)}
        >
          <div
            className="w-full max-w-sm bg-[#141414] border border-amber-500/20 p-4 rounded"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] tracking-widest uppercase text-amber-500">
                Randari 3d/4d proarh.4d-arh. Bogdan Sotîngeanu. Birou de arhitectura.
              </span>
              <button
                type="button"
                aria-label="Închide"
                onClick={() => setShareOpen(false)}
                className="text-white/50 hover:text-white text-xs w-6 h-6 flex items-center justify-center border border-white/15 rounded"
              >
                ✕
              </button>
            </div>

            <div className="w-full aspect-video bg-black border border-white/10 overflow-hidden mb-4">
              {snapshot && (
                // captura reală a canvas-ului 3D în momentul apăsării butonului
                <img src={snapshot} alt="Captură a randării 3D" className="w-full h-full object-cover" />
              )}
            </div>

            <div className="flex gap-2 mb-2">
              <button
                type="button"
                onClick={handleNativeShare}
                className="flex-1 border border-amber-500/50 text-amber-500 text-[10px] tracking-widest uppercase py-2.5 hover:border-amber-500 hover:text-white transition-colors"
              >
                Share
              </button>

            </div>
            <button
              type="button"
              onClick={handleCopyLink}
              className="w-full border border-white/15 text-white/70 text-[10px] tracking-widest uppercase py-2.5 hover:border-white/40 hover:text-white transition-colors"
            >
              {copied ? 'Link copiat!' : 'Copiază link'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}