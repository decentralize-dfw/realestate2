import React, { useEffect, useRef, useState } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { Environment, AccumulativeShadows, RandomizedLight, KeyboardControls, OrbitControls, Preload, BakeShadows, Html } from '@react-three/drei';
import { Physics } from '@react-three/rapier';
import { XR, VRButton, createXRStore } from '@react-three/xr';
import { useStore, HOTSPOTS_DATA } from './store';
import { Player } from './Player';
import { Effects } from './Effects';
import { World } from './World';
import gsap from 'gsap';
import * as THREE from 'three';

// Create XR store
const xrStore = createXRStore();

// --- SUB-COMPONENTS ---

function CameraController() {
    const { camera, controls } = useThree();
    const chapter = useStore((s) => s.currentChapter);
    const subPhase = useStore((s) => s.subPhase);
    const viewMode = useStore((s) => s.viewMode);
    const cameraSetFor0to3 = useRef(false); // Track if camera was set for scenes 0-3
    const previousChapter = useRef(0); // Track previous chapter for Scene 5 logic

    // HTML-matched FOV: Scene 4 & 5 use FOV 90
    useEffect(() => {
        if (chapter === 4 || chapter === 5 || viewMode === 'fps') {
            camera.fov = 90; // HTML uses 90 for interior and walkthrough
        } else {
            camera.fov = 45; // Default FOV for orbit view
        }
        camera.updateProjectionMatrix();
    }, [chapter, viewMode, camera]);

    useEffect(() => {
        if (viewMode === 'fps') return;

        // Interior Camera Angles (Scene 4) - Mapped to subPhase 0-5
        const interiorCams = [
            { pos: [1, 1.6, 1.6], target: [1, 1.6, 1.5] },      // Salon
            { pos: [-2, 1.6, 3.1], target: [-2.1, 1.6, 3.2] },  // Kitchen
            { pos: [-2, 1.6, 0], target: [-2.1, 1.6, -0.1] },   // Bed 1
            { pos: [-2, 1.6, 2.1], target: [-2.1, 1.6, 2.2] },  // Bath 1
            { pos: [4.4, 1.6, 0], target: [4.5, 1.6, -0.1] },   // Bed 2
            { pos: [3.9, 1.6, 3.7], target: [4.0, 1.6, 3.8] }   // Bath 2
        ];

        if (chapter === 4) {
            // INSTANT CUT for Interior to prevent clipping
            const cam = interiorCams[subPhase] || interiorCams[0];
            camera.position.set(cam.pos[0], cam.pos[1], cam.pos[2]);
            camera.lookAt(cam.target[0], cam.target[1], cam.target[2]);
            if(controls) {
                // @ts-ignore
                controls.target.set(cam.target[0], cam.target[1], cam.target[2]);
                // @ts-ignore
                controls.update();
            }
            cameraSetFor0to3.current = false; // Reset flag when leaving scenes 0-3
        } else if (chapter <= 3) {
            // SCENES 0-3: Set camera position ONLY ONCE, never reset between these scenes
            if (!cameraSetFor0to3.current) {
                camera.position.set(20, 20, 20);
                camera.lookAt(0, 0, 0);

                if (controls) {
                    // @ts-ignore
                    controls.target.set(0, 0, 0);
                    // @ts-ignore
                    controls.update();
                }
                cameraSetFor0to3.current = true; // Mark as set
            }
            // If already set, DO NOTHING - camera stays where user left it
        } else if (chapter === 5) {
            // Scene 5: Start from Scene 4 position OR Grand Salon default
            if (previousChapter.current !== 4) {
                // Coming from Scene 0,1,2,3 -> Start at Grand Salon (first camera position of Scene 4)
                camera.position.set(1, 1.6, 1.6);
                console.log('Scene 5: Starting from Grand Salon (default)');
            } else {
                // Coming from Scene 4 -> Keep current camera position
                console.log('Scene 5: Keeping Scene 4 camera position');
            }
            cameraSetFor0to3.current = false;
        }

        // Update previous chapter for next transition
        previousChapter.current = chapter;
    }, [chapter, subPhase, viewMode, camera, controls]);

    return null;
}

function DynamicLighting() {
    const { sunIntensity, envIntensity, sunColor, quality } = useStore();
    const chapter = useStore((s) => s.currentChapter);
    const { scene } = useThree();

    // CRITICAL: Use SAME HDRI for both HIGH and ULTRA (user requirement)
    // ULTRA differentiation comes from boosted post-processing (SSAO/Bloom)
    const hdriFile = "https://raw.githubusercontent.com/decentralize-dfw/vea_001/main/RealismHDRI-_equirectangular-jpg_VR360_neon_drenched_skyscrapers_1656103290_10361044.hdr";

    // Sync environment intensity
    useEffect(() => {
        scene.environmentIntensity = envIntensity;
    }, [envIntensity, scene]);

    return (
        <>
            <Environment
                files={hdriFile}
                background={false}
                blur={quality === 'ultra' ? 0.5 : 1}
            />
            <ambientLight intensity={quality === 'ultra' ? 0.8 : 0.5} />
            <directionalLight
                position={[10, 50, 20]}
                intensity={quality === 'ultra' ? sunIntensity * 1.5 : sunIntensity}
                color={sunColor}
                castShadow
                shadow-bias={-0.0001}
                shadow-mapSize={[2048, 2048]}
            />
            {/* AccumulativeShadows ONLY for outdoor scenes (0-3) - causes weird shadows in interior */}
            {chapter <= 3 && (
                <AccumulativeShadows temporal frames={60} alphaTest={0.85} opacity={0.7} scale={50} position={[0, -0.01, 0]}>
                    <RandomizedLight amount={8} radius={5} ambient={0.5} intensity={1} position={[10, 20, 10]} bias={0.001} />
                </AccumulativeShadows>
            )}
        </>
    );
}

function ScreenshotHandler() {
    const { gl, scene, camera } = useThree();
    const trigger = useStore(s => s.screenshotTrigger);
    const [lastTrigger, setLastTrigger] = useState(0);

    useEffect(() => {
        if (trigger > lastTrigger) {
            gl.render(scene, camera);
            gl.domElement.toBlob((blob) => {
                if(blob) {
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `VEA-Screenshot-${Date.now()}.png`;
                    a.click();
                    URL.revokeObjectURL(url);
                }
            });
            setLastTrigger(trigger);
        }
    }, [trigger, lastTrigger, gl, scene, camera]);

    return null;
}

function AutoRotatingOrbitControls() {
    const autoRotateEnabled = useStore(s => s.autoRotateEnabled);
    const toggleAutoRotate = useStore(s => s.toggleAutoRotate);
    const chapter = useStore(s => s.currentChapter);
    const controlsRef = useRef<any>(null);
    const userInteractedRef = useRef(false);

    // Listen for user interaction with controls (onStart only fires on user drag, not auto-rotation)
    const handleUserInteraction = () => {
        // If autoRotate is ON and this is the first user interaction, turn it OFF automatically
        if (autoRotateEnabled && !userInteractedRef.current) {
            userInteractedRef.current = true;
            toggleAutoRotate(); // Turn OFF on first user drag
        }
    };

    // Reset interaction flag when autoRotate is manually toggled back ON via footer button
    useEffect(() => {
        if (autoRotateEnabled) {
            userInteractedRef.current = false;
        }
    }, [autoRotateEnabled]);

    return (
        <OrbitControls
            ref={controlsRef}
            makeDefault
            enablePan={false}
            enableDamping
            dampingFactor={0.05}
            autoRotate={autoRotateEnabled}
            autoRotateSpeed={0.25}
            enableZoom={chapter !== 4} // Scene 4: Disable zoom (camera stays fixed)
            onStart={handleUserInteraction}
        />
    );
}

// DISABLED: PerformanceMonitor was auto-downgrading quality, causing user complaints
// User wants quality to STAY at their selected level (default HIGH)
// function PerformanceMonitor() {
//     const setQuality = useStore(s => s.setQuality);
//     const quality = useStore(s => s.quality);
//     const frames = useRef(0);
//     const lastTime = useRef(performance.now());

//     useFrame(() => {
//         frames.current++;
//         const now = performance.now();
//         if (now >= lastTime.current + 2000) {
//             const fps = Math.round((frames.current * 1000) / (now - lastTime.current));
//             if (fps < 30 && quality === 'ultra') {
//                 setQuality('high');
//             } else if (fps < 20 && quality === 'high') {
//                 setQuality('low');
//             }
//             frames.current = 0;
//             lastTime.current = now;
//         }
//     });
//     return null;
// }

function HotspotMarkers() {
    const chapter = useStore(s => s.currentChapter);
    const subPhase = useStore(s => s.subPhase);
    const [hovered, setHover] = useState<string | null>(null);

    // Filter Hotspots logic
    let activeHotspots = [];
    
    // Scene 1 (Context) -> Show specific category based on subPhase
    if (chapter === 1) {
        if (subPhase === 0) activeHotspots = HOTSPOTS_DATA.surrounding;
        else if (subPhase === 1) activeHotspots = HOTSPOTS_DATA.transportation;
        else activeHotspots = HOTSPOTS_DATA.units;
    }
    // Scene 4 (Interior) -> Show interior hotspots (all for now)
    else if (chapter === 4) {
        activeHotspots = HOTSPOTS_DATA.interior;
    }

    if (activeHotspots.length === 0) return null;

    return (
        <group>
            {activeHotspots.map((h, i) => {
                const isActive = hovered === h.title;
                return (
                    <Html key={i} position={new THREE.Vector3(...h.pos)} zIndexRange={[100, 0]}>
                        <div
                            className="relative group cursor-pointer"
                            onMouseEnter={() => setHover(h.title)}
                            onMouseLeave={() => setHover(null)}
                        >
                            {/* Marker Pulse Ring */}
                            <div className="absolute inset-0 w-4 h-4 bg-emerald-400/30 rounded-full animate-ping"></div>

                            {/* Core Marker */}
                            <div className={`w-4 h-4 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-full border border-white/40 shadow-[0_0_20px_rgba(52,211,153,0.7)] transition-all duration-300 ${
                                isActive ? 'scale-150 shadow-[0_0_30px_rgba(52,211,153,1)]' : 'hover:scale-125'
                            }`}></div>

                            {/* Information Panel */}
                            <div className={`absolute left-7 top-1/2 -translate-y-1/2 bg-gradient-to-r from-black/95 via-black/90 to-black/85 backdrop-blur-xl border-l-2 border-emerald-400 text-white p-4 w-64 rounded-r-lg shadow-2xl transition-all duration-500 ease-out ${
                                isActive ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-6 pointer-events-none'
                            }`}>
                                <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-400 mb-1.5 font-mono">{h.title}</div>
                                <div className="text-[10px] font-mono text-white/60 tracking-wide font-light leading-relaxed">{h.desc}</div>
                            </div>
                        </div>
                    </Html>
                )
            })}
        </group>
    )
}

// --- MAIN SCENE ---

export function Scene() {
    const quality = useStore((s) => s.quality);
    const viewMode = useStore((s) => s.viewMode);

    const dpr = quality === 'low' ? 0.8 : quality === 'high' ? 1 : 1.5;

    return (
        <>
            <VRButton
                store={xrStore}
                className="!bg-gradient-to-br !from-black/70 !via-black/60 !to-black/70 !backdrop-blur-xl !border !border-white/20 !text-[9px] !opacity-60 hover:!opacity-100 hover:!border-emerald-400/50 hover:!shadow-[0_0_20px_rgba(52,211,153,0.3)] !bottom-6 !left-1/2 !-translate-x-1/2 !absolute !z-50 !px-6 !py-3 !text-white/80 hover:!text-white !rounded-lg !uppercase !font-mono !tracking-[0.25em] !transition-all !duration-300 !font-light"
            />

            <KeyboardControls
                map={[
                    { name: 'forward', keys: ['ArrowUp', 'w', 'W'] },
                    { name: 'backward', keys: ['ArrowDown', 's', 'S'] },
                    { name: 'left', keys: ['ArrowLeft', 'a', 'A'] },
                    { name: 'right', keys: ['ArrowRight', 'd', 'D'] },
                    { name: 'jump', keys: ['Space'] },
                    { name: 'sprint', keys: ['Shift'] }
                ]}
            >
                <Canvas
                    id="canvas-container"
                    shadows
                    dpr={dpr}
                    camera={{
                        position: [20, 20, 20],
                        fov: 45,
                        near: 0.1,
                        far: 1000
                    }}
                    gl={{
                        powerPreference: 'high-performance',
                        antialias: false,
                        stencil: false,
                        depth: true,
                        toneMapping: THREE.ACESFilmicToneMapping,
                        preserveDrawingBuffer: true
                    }}
                >
                    <XR store={xrStore}>
                        <color attach="background" args={['#050505']} />
                        
                        <Physics gravity={[0, -9.81, 0]}>
                            <Player />
                            <World />
                        </Physics>

                        <DynamicLighting />
                        <HotspotMarkers />
                        
                        {viewMode === 'orbit' && (
                            <AutoRotatingOrbitControls />
                        )}
                        
                        <CameraController />
                        <Effects />
                        <ScreenshotHandler />
                        
                        <BakeShadows />
                        <Preload all />
                    </XR>
                </Canvas>
            </KeyboardControls>
        </>
    );
}