import React, { useEffect, useState } from 'react';
import { useStore, CHAPTER_DATA, Quality } from './store';
import { motion, AnimatePresence } from 'framer-motion';
import { useProgress } from '@react-three/drei';

export function Interface() {
    const { 
        currentChapter, setChapter, 
        subPhase, setSubPhase,
        quality, setQuality, 
        viewMode, setViewMode,
        triggerScreenshot,
        isConfigOpen, toggleConfig,
        sunIntensity, envIntensity, sunColor, updateConfig, resetConfig,
        flashTrigger
    } = useStore();

    const { progress } = useProgress();
    const [loaded, setLoaded] = useState(false);
    const [showFlash, setShowFlash] = useState(false);

    const chapterInfo = CHAPTER_DATA[currentChapter];

    // Handle Loading State
    useEffect(() => {
        if (progress === 100) {
            // Small delay to ensure everything is actually rendered
            const t = setTimeout(() => setLoaded(true), 1500);
            return () => clearTimeout(t);
        }
    }, [progress]);

    // Handle Flash Transition
    useEffect(() => {
        if (flashTrigger > 0) {
            setShowFlash(true);
            const t = setTimeout(() => setShowFlash(false), 1000); // 1s fade out
            return () => clearTimeout(t);
        }
    }, [flashTrigger]);

    return (
        <div className="absolute inset-0 z-50 pointer-events-none text-white font-sans overflow-hidden select-none">
            
            {/* --- LOADING SCREEN --- */}
            <AnimatePresence>
                {!loaded && (
                    <motion.div 
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1 }}
                        className="fixed inset-0 bg-black z-[100] flex flex-col items-center justify-center pointer-events-auto"
                    >
                        <div className="w-24 h-24 relative mb-8">
                            <svg className="w-full h-full rotate-[-90deg]">
                                <circle cx="48" cy="48" r="44" stroke="rgba(255,255,255,0.1)" strokeWidth="4" fill="none" />
                                <circle cx="48" cy="48" r="44" stroke="#10b981" strokeWidth="4" fill="none" 
                                        strokeDasharray="276" 
                                        strokeDashoffset={276 - (276 * progress) / 100} 
                                        className="transition-all duration-300 ease-out"
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center font-mono text-sm">
                                {Math.round(progress)}%
                            </div>
                        </div>
                        <h2 className="text-sm tracking-[0.3em] uppercase text-white/80 animate-pulse">Initializing Experience</h2>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* --- CINEMATIC FLASH CUT --- */}
            <AnimatePresence>
                {showFlash && (
                    <motion.div 
                        initial={{ opacity: 1 }}
                        animate={{ opacity: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="fixed inset-0 bg-black z-[90] pointer-events-none"
                    />
                )}
            </AnimatePresence>

            {/* --- TOP BAR --- */}
            <header className="absolute top-0 w-full p-8 flex justify-between items-start">
                
                {/* LOGO & OPTIONS */}
                <motion.div 
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="pointer-events-auto flex gap-8 items-start"
                >
                    <div>
                        <h1 className="font-serif text-4xl tracking-widest">VEA</h1>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                            <span className="text-[10px] uppercase tracking-[0.3em] text-white/60 font-mono">
                                Live
                            </span>
                        </div>
                    </div>

                    {/* SUB-MENU TOGGLES */}
                    {chapterInfo.options.length > 0 && (
                        <div className="flex gap-2 mt-2">
                            {chapterInfo.options.map((opt, idx) => (
                                <button
                                    key={opt}
                                    onClick={() => setSubPhase(idx)}
                                    className={`px-4 py-2 text-[10px] uppercase tracking-widest font-mono border rounded transition-all
                                        ${subPhase === idx 
                                            ? 'bg-white text-black border-white' 
                                            : 'bg-black/40 text-white/70 border-white/10 hover:border-white/50'
                                        }`}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    )}
                </motion.div>

                {/* TOOLBAR */}
                <motion.div 
                    className="pointer-events-auto flex gap-2"
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    {/* Quality */}
                    <div className="flex gap-1 text-[9px] font-mono tracking-widest bg-black/60 backdrop-blur-md p-1.5 rounded border border-white/10 mr-4 h-fit">
                        {(['low', 'high', 'ultra'] as Quality[]).map((q) => (
                            <button 
                                key={q}
                                onClick={() => setQuality(q)}
                                className={`px-3 py-1 rounded transition-colors uppercase ${quality === q ? 'bg-white text-black font-bold' : 'text-white/50 hover:text-white'}`}
                            >
                                {q}
                            </button>
                        ))}
                    </div>

                    <button onClick={triggerScreenshot} className="p-3 bg-black/60 backdrop-blur-md border border-white/10 rounded hover:bg-white/10 transition-colors" title="Screenshot">
                         <svg className="w-4 h-4 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/></svg>
                    </button>
                    <button onClick={toggleConfig} className={`p-3 bg-black/60 backdrop-blur-md border border-white/10 rounded hover:bg-white/10 transition-colors ${isConfigOpen ? 'border-emerald-500 text-emerald-400' : ''}`} title="Configurator">
                        <svg className="w-4 h-4 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/></svg>
                    </button>
                </motion.div>
            </header>

            {/* --- LEFT PANEL --- */}
            <AnimatePresence mode='wait'>
                <motion.div 
                    key={currentChapter}
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -50, opacity: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="absolute top-1/3 left-8 w-80 pointer-events-auto"
                >
                    <div className="w-12 h-[1px] bg-emerald-500 mb-4"></div>
                    <div className="text-[10px] font-mono tracking-widest text-emerald-400 mb-2 uppercase">{chapterInfo.subtitle}</div>
                    <h2 className="font-serif text-5xl mb-4 text-white/90 leading-tight">{chapterInfo.title}</h2>
                    <p className="font-sans text-xs text-white/60 leading-relaxed tracking-wide border-l border-white/10 pl-4">
                        {chapterInfo.desc}
                    </p>
                </motion.div>
            </AnimatePresence>

            {/* --- CONFIGURATOR --- */}
            <AnimatePresence>
                {isConfigOpen && (
                    <motion.div
                        initial={{ x: 350 }}
                        animate={{ x: 0 }}
                        exit={{ x: 350 }}
                        className="absolute top-24 right-8 w-80 bg-black/80 backdrop-blur-xl border border-white/10 pointer-events-auto rounded-xl p-6 shadow-2xl"
                    >
                         <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                            <h3 className="font-mono text-sm tracking-widest uppercase text-white/90">Environment</h3>
                            <button onClick={toggleConfig} className="text-white/50 hover:text-white">&times;</button>
                        </div>

                        <div className="space-y-6 font-mono text-xs">
                            <div>
                                <label className="block text-white/50 mb-2 uppercase tracking-wide">Sun Intensity [{sunIntensity}]</label>
                                <input 
                                    type="range" min="0" max="5" step="0.1" 
                                    value={sunIntensity}
                                    onChange={(e) => updateConfig('sunIntensity', parseFloat(e.target.value))}
                                    className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                                />
                            </div>
                            <div>
                                <label className="block text-white/50 mb-2 uppercase tracking-wide">HDRI Intensity [{envIntensity}]</label>
                                <input 
                                    type="range" min="0" max="2" step="0.1" 
                                    value={envIntensity}
                                    onChange={(e) => updateConfig('envIntensity', parseFloat(e.target.value))}
                                    className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                                />
                            </div>
                            <div>
                                <label className="block text-white/50 mb-2 uppercase tracking-wide">Sun Color</label>
                                <input 
                                    type="color" 
                                    value={sunColor}
                                    onChange={(e) => updateConfig('sunColor', e.target.value)}
                                    className="w-full h-8 cursor-pointer rounded border border-white/20"
                                />
                            </div>

                            <button onClick={resetConfig} className="w-full py-3 mt-4 border border-white/20 hover:bg-white hover:text-black transition-colors uppercase tracking-widest text-[10px]">
                                Reset Defaults
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* --- NAVIGATION --- */}
            <div className="absolute right-8 top-2/3 -translate-y-1/2 flex flex-col gap-6 pointer-events-auto">
                {CHAPTER_DATA.map((chap, idx) => (
                    <button 
                        key={idx}
                        onClick={() => {
                            setChapter(idx);
                            if(idx === 5) setViewMode('fps');
                            else setViewMode('orbit');
                        }}
                        className="group flex items-center justify-end gap-4"
                    >
                        <span className={`text-[9px] uppercase tracking-widest font-mono transition-all duration-300 ${currentChapter === idx ? 'opacity-100 text-emerald-400' : 'opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0'}`}>
                            {idx + 1}
                        </span>
                        <div className={`w-2 h-2 border rotate-45 transition-all duration-500 ${currentChapter === idx ? 'bg-emerald-500 border-emerald-500 scale-150' : 'border-white/30 hover:border-white bg-transparent'}`}></div>
                    </button>
                ))}
            </div>

            {/* --- BOTTOM HUD --- */}
            <footer className="absolute bottom-0 w-full p-8 flex justify-between items-end">
                <div className="font-mono text-[10px] text-white/40 tracking-widest flex gap-8">
                     <div className="flex flex-col">
                        <span className="text-emerald-500 mb-1">MODE</span>
                        <span>{viewMode.toUpperCase()}</span>
                     </div>
                </div>
            </footer>
        </div>
    );
}
