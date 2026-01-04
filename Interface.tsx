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
        sunIntensity, envIntensity, hdriIntensity, sunColor, updateConfig, resetConfig,
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
                        <h2 className="text-sm tracking-[0.4em] uppercase text-white/70 animate-pulse font-light">Crafting Your Experience</h2>
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
                        <h1 className="font-serif text-5xl tracking-[0.25em] text-white/95 font-light">VEA</h1>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.5)]"></span>
                            <span className="text-[9px] uppercase tracking-[0.35em] text-white/50 font-mono font-light">
                                Experience Active
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
                    {/* Visual Fidelity */}
                    <div className="flex gap-1 text-[9px] font-mono tracking-[0.15em] bg-black/50 backdrop-blur-xl p-1.5 rounded-lg border border-white/10 mr-4 h-fit shadow-lg">
                        {(['low', 'high', 'ultra'] as Quality[]).map((q) => (
                            <button
                                key={q}
                                onClick={() => setQuality(q)}
                                className={`px-4 py-1.5 rounded-md transition-all duration-300 uppercase font-light ${
                                    quality === q
                                        ? 'bg-gradient-to-br from-white to-white/90 text-black font-medium shadow-md'
                                        : 'text-white/40 hover:text-white/80 hover:bg-white/5'
                                }`}
                            >
                                {q}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={triggerScreenshot}
                        className="p-3 bg-black/50 backdrop-blur-xl border border-white/10 rounded-lg hover:bg-white/10 hover:border-white/30 transition-all duration-300 shadow-lg group"
                        title="Capture Moment"
                    >
                         <svg className="w-4 h-4 text-white/60 group-hover:text-white/90 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/></svg>
                    </button>
                    <button
                        onClick={toggleConfig}
                        className={`p-3 bg-black/50 backdrop-blur-xl border rounded-lg transition-all duration-300 shadow-lg group ${
                            isConfigOpen
                                ? 'border-emerald-400/50 bg-emerald-500/10'
                                : 'border-white/10 hover:bg-white/10 hover:border-white/30'
                        }`}
                        title="Environment Controls"
                    >
                        <svg className={`w-4 h-4 transition-colors ${isConfigOpen ? 'text-emerald-400' : 'text-white/60 group-hover:text-white/90'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/></svg>
                    </button>
                </motion.div>
            </header>

            {/* --- LEFT PANEL — Chapter Information --- */}
            <AnimatePresence mode='wait'>
                <motion.div
                    key={currentChapter}
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -50, opacity: 0 }}
                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute top-1/3 left-8 w-96 pointer-events-auto"
                >
                    <div className="w-16 h-[1px] bg-gradient-to-r from-emerald-400 to-transparent mb-5 shadow-[0_0_8px_rgba(52,211,153,0.3)]"></div>
                    <div className="text-[9px] font-mono tracking-[0.35em] text-emerald-400/90 mb-3 uppercase font-light">
                        {chapterInfo.subtitle}
                    </div>
                    <h2 className="font-serif text-6xl mb-5 text-white/95 leading-[1.1] font-light tracking-wide">
                        {chapterInfo.title}
                    </h2>
                    <p className="font-sans text-sm text-white/70 leading-relaxed tracking-wide border-l-2 border-white/10 pl-5 font-light">
                        {chapterInfo.desc}
                    </p>
                </motion.div>
            </AnimatePresence>

            {/* --- ENVIRONMENT CONFIGURATOR --- */}
            <AnimatePresence>
                {isConfigOpen && (
                    <motion.div
                        initial={{ x: 400, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 400, opacity: 0 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className="absolute top-24 right-8 w-96 bg-gradient-to-br from-black/90 via-black/85 to-black/90 backdrop-blur-2xl border border-white/10 pointer-events-auto rounded-2xl p-8 shadow-2xl"
                    >
                         <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-5">
                            <h3 className="font-mono text-xs tracking-[0.3em] uppercase text-white/80 font-light">
                                Lighting Environment
                            </h3>
                            <button
                                onClick={toggleConfig}
                                className="text-white/40 hover:text-white/90 text-2xl transition-colors leading-none"
                            >
                                ×
                            </button>
                        </div>

                        <div className="space-y-7 font-mono text-[11px]">
                            <div>
                                <label className="flex justify-between text-white/50 mb-3 uppercase tracking-[0.15em] font-light">
                                    <span>Daylight Intensity</span>
                                    <span className="text-emerald-400 font-medium">{sunIntensity.toFixed(1)}</span>
                                </label>
                                <input
                                    type="range" min="0" max="5" step="0.1"
                                    value={sunIntensity}
                                    onChange={(e) => updateConfig('sunIntensity', parseFloat(e.target.value))}
                                    className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-emerald-400 hover:bg-white/15 transition-colors"
                                />
                            </div>
                            <div>
                                <label className="flex justify-between text-white/50 mb-3 uppercase tracking-[0.15em] font-light">
                                    <span>Ambient Luminance</span>
                                    <span className="text-emerald-400 font-medium">{envIntensity.toFixed(1)}</span>
                                </label>
                                <input
                                    type="range" min="0" max="2" step="0.1"
                                    value={envIntensity}
                                    onChange={(e) => updateConfig('envIntensity', parseFloat(e.target.value))}
                                    className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-emerald-400 hover:bg-white/15 transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-white/50 mb-3 uppercase tracking-[0.15em] font-light">
                            <div>
                                <label className="flex justify-between text-white/50 mb-3 uppercase tracking-[0.15em] font-light">
                                    <span>HDRI Intensity</span>
                                    <span className="text-emerald-400 font-medium">{hdriIntensity.toFixed(1)}</span>
                                </label>
                                <input
                                    type="range" min="0" max="1" step="0.1"
                                    value={hdriIntensity}
                                    onChange={(e) => updateConfig("hdriIntensity", parseFloat(e.target.value))}
                                    className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-emerald-400 hover:bg-white/15 transition-colors"
                                />
                            </div>
                                    Light Temperature
                                </label>
                                <input
                                    type="color"
                                    value={sunColor}
                                    onChange={(e) => updateConfig('sunColor', e.target.value)}
                                    className="w-full h-12 cursor-pointer rounded-lg border border-white/20 hover:border-white/40 transition-colors"
                                />
                            </div>

                            <button
                                onClick={resetConfig}
                                className="w-full py-3.5 mt-6 border border-white/20 hover:bg-white hover:text-black rounded-lg transition-all duration-300 uppercase tracking-[0.25em] text-[10px] font-light hover:shadow-lg"
                            >
                                Restore Defaults
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* --- CHAPTER NAVIGATION --- */}
            <div className="absolute right-8 top-2/3 -translate-y-1/2 flex flex-col gap-5 pointer-events-auto">
                {CHAPTER_DATA.map((chap, idx) => (
                    <button
                        key={idx}
                        onClick={() => {
                            setChapter(idx);
                            if(idx === 5) setViewMode('fps');
                            else setViewMode('orbit');
                        }}
                        className="group flex items-center justify-end gap-4 relative"
                    >
                        <span className={`text-[9px] uppercase tracking-[0.25em] font-mono transition-all duration-500 ease-out font-light ${
                            currentChapter === idx
                                ? 'opacity-100 text-emerald-400 font-medium'
                                : 'opacity-0 -translate-x-3 group-hover:opacity-80 group-hover:translate-x-0 text-white/60'
                        }`}>
                            {String(idx + 1).padStart(2, '0')}
                        </span>
                        <div className={`w-2 h-2 border rotate-45 transition-all duration-500 ${
                            currentChapter === idx
                                ? 'bg-emerald-400 border-emerald-400 scale-[1.6] shadow-[0_0_12px_rgba(52,211,153,0.6)]'
                                : 'border-white/25 hover:border-white/70 hover:scale-125 bg-transparent'
                        }`}></div>
                    </button>
                ))}
            </div>

            {/* --- FOOTER METADATA --- */}
            <footer className="absolute bottom-0 w-full p-8 flex justify-between items-end">
                <div className="font-mono text-[10px] text-white/30 tracking-[0.2em] flex gap-10 font-light">
                     <div className="flex flex-col gap-1">
                        <span className="text-emerald-400/70 text-[9px] tracking-[0.3em]">VIEW MODE</span>
                        <span className="text-white/60">{viewMode.toUpperCase()}</span>
                     </div>
                     <div className="flex flex-col gap-1">
                        <span className="text-emerald-400/70 text-[9px] tracking-[0.3em]">CHAPTER</span>
                        <span className="text-white/60">{String(currentChapter + 1).padStart(2, '0')} / 06</span>
                     </div>
                </div>
                <div className="font-mono text-[9px] text-white/20 tracking-[0.2em] font-light">
                    VEA © 2026
                </div>
            </footer>
        </div>
    );
}
