'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Center } from '@react-three/drei';
import { Suspense } from 'react';

function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} scale={1} />;
}

export default function ModelViewer() {
  // Definim coordonatele separat pentru a evita erorile de parsare JSX
 const cameraPosition: [number, number, number] = [0, 0, 5];
const lightPosition: [number, number, number] = [10, 10, 10];
  const pointLightPosition: [number, number, number] = [-10, -10, -10];

  return (
    <div className="w-full h-[350px] md:h-[450px] bg-zinc-900/50 border border-white/5 rounded mt-6 overflow-hidden relative group">
      <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur-md text-[10px] tracking-widest text-amber-500 uppercase px-3 py-1.5 border border-amber-500/20 rounded">
        3D pool project - rotate & zoom
      </div>
      
      <Canvas camera={{ position: cameraPosition, fov: 45 }}>
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
      </Canvas>
    </div>
  );
}
