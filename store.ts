import { create } from 'zustand';

export type Quality = 'low' | 'high' | 'ultra';
export type ViewMode = 'orbit' | 'fps';

interface ConfigState {
    sunIntensity: number;
    envIntensity: number;
    sunColor: string;
    isConfigOpen: boolean;
    toggleConfig: () => void;
    updateConfig: (key: keyof Omit<ConfigState, 'isConfigOpen' | 'toggleConfig' | 'updateConfig' | 'resetConfig'>, value: any) => void;
    resetConfig: () => void;
}

interface AppState extends ConfigState {
    quality: Quality;
    viewMode: ViewMode;
    currentChapter: number;
    subPhase: number; // For Scene 1 (0-2), Scene 2 (0-1), Scene 4 (0-5)

    isMenuOpen: boolean;
    autoRotateEnabled: boolean; // User-controlled auto rotation
    screenshotTrigger: number;
    flashTrigger: number; // Triggers the black fade effect

    setQuality: (q: Quality) => void;
    setViewMode: (v: ViewMode) => void;
    setChapter: (index: number) => void;
    setSubPhase: (index: number) => void;
    toggleMenu: () => void;
    toggleAutoRotate: () => void; // Toggle auto rotation
    triggerScreenshot: () => void;
    triggerFlash: () => void;
}

const DEFAULT_CONFIG = {
    sunIntensity: 2.8,
    envIntensity: 0.8,
    sunColor: '#fff9f0'
};

export const useStore = create<AppState>((set) => ({
    quality: 'high',
    viewMode: 'orbit',
    currentChapter: 0,
    subPhase: 0,
    isMenuOpen: true,
    autoRotateEnabled: true, // NEW: Start with auto-rotate ON
    screenshotTrigger: 0,
    flashTrigger: 0,

    ...DEFAULT_CONFIG,
    isConfigOpen: false,

    setQuality: (quality) => set({ quality }),
    setViewMode: (viewMode) => set({ viewMode }),
    setChapter: (index) => set((state) => {
        // Reset subphase when changing chapters
        const newPhase = 0;
        // Trigger flash for interior scenes (4, 5) and when leaving them
        if ((index === 4 || index === 5) && (state.currentChapter !== 4 && state.currentChapter !== 5)) {
             set({ flashTrigger: state.flashTrigger + 1 });
        }
        else if ((state.currentChapter === 4 || state.currentChapter === 5) && (index !== 4 && index !== 5)) {
             set({ flashTrigger: state.flashTrigger + 1 });
        }
        return { currentChapter: index, subPhase: newPhase };
    }),
    setSubPhase: (index) => set({ subPhase: index }),
    toggleMenu: () => set((state) => ({ isMenuOpen: !state.isMenuOpen })),
    toggleAutoRotate: () => set((state) => ({ autoRotateEnabled: !state.autoRotateEnabled })), // NEW
    triggerScreenshot: () => set((state) => ({ screenshotTrigger: state.screenshotTrigger + 1 })),
    triggerFlash: () => set((state) => ({ flashTrigger: state.flashTrigger + 1 })),

    toggleConfig: () => set((state) => ({ isConfigOpen: !state.isConfigOpen })),
    updateConfig: (key, value) => set({ [key]: value }),
    resetConfig: () => set({ ...DEFAULT_CONFIG })
}));

// Curated Experience Chapters
export const CHAPTER_DATA = [
    {
        title: 'Context',
        subtitle: 'Architectural Mastery',
        desc: 'A statement of refinement emerges from the urban landscape—where visionary design transcends convention and redefines contemporary living.',
        detailTitle: 'Design Philosophy',
        detailDesc: 'An isometric perspective reveals the harmonious interplay of proportion, materiality, and spatial narrative.',
        options: []
    },
    {
        title: 'Neighbor',
        subtitle: 'Urban Resonance',
        desc: 'Thoughtfully positioned within a distinguished enclave, this residence commands its setting with quiet confidence and timeless presence.',
        detailTitle: 'Contextual Integration',
        detailDesc: 'Every element dialogues with its surroundings—a sophisticated fusion of heritage and innovation.',
        options: ['Surroundings', 'Connectivity', 'Residences']
    },
    {
        title: 'Building',
        subtitle: 'Material Integrity',
        desc: 'Each surface tells a story. Through the careful selection of materials and finishes, form transcends function to become art.',
        detailTitle: 'Crafted Facades',
        detailDesc: 'Meticulously curated palettes—alabaster purity meets sculptural metallics in perfect equilibrium.',
        options: ['Luminous Facade', 'Metal Articulation']
    },
    {
        title: 'Flats',
        subtitle: 'Structural Poetry',
        desc: 'Beneath the surface lies extraordinary intelligence. A transparent revelation of engineered precision and thoughtful spatial choreography.',
        detailTitle: 'Systems Excellence',
        detailDesc: 'Advanced infrastructure seamlessly integrated—where innovation supports elevated living without compromise.',
        options: []
    },
    {
        title: 'Panorama',
        subtitle: 'Refined Interiors',
        desc: 'Expansive volumes bathed in natural light. Every space orchestrated for comfort, elegance, and the quiet luxury of daily ritual.',
        detailTitle: 'Curated Living',
        detailDesc: 'Interiors designed for both intimate moments and sophisticated entertaining—a canvas for distinguished life.',
        options: ['Grand Salon', 'Culinary Studio', 'Primary Suite', 'Primary Bath', 'Secondary Suite', 'Secondary Bath']
    },
    {
        title: 'Immersion',
        subtitle: 'Personal Discovery',
        desc: 'Navigate freely through space. W/A/S/D keys guide your journey, Shift accelerates, Space elevates your perspective.',
        detailTitle: 'Virtual Experience',
        detailDesc: 'A fully immersive encounter—discover hidden details, appreciate spatial flow, and envision your story within.',
        options: []
    },
];

export const HOTSPOTS_DATA = {
    surrounding: [
        { pos: [-8, 2, 5], title: 'Botanical Gardens', desc: '800m — Verdant Sanctuary' },
        { pos: [6, 1.5, -7], title: 'Atelier District', desc: '1.2km — Curated Boutiques' },
        { pos: [-5, 3, -6], title: 'Cultural Quarter', desc: '600m — Museums & Galleries' },
        { pos: [7, 2.5, 4], title: 'Gastronomic Mile', desc: '450m — Michelin-Starred Dining' }
    ],
    transportation: [
        { pos: [-3, 0.5, 6], title: 'Metro Nexus', desc: '250m — Direct City Access' },
        { pos: [5, 0.5, -4], title: 'Transit Hub', desc: '180m — Comprehensive Network' },
        { pos: [9, 0.5, -9], title: 'Private Aviation', desc: '3.2km — Exclusive Terminal' }
    ],
    units: [
        { pos: [0, 12, 0], title: 'Penthouse Sanctuary', desc: 'Crowning Level — Panoramic Vistas' },
        { pos: [3, 8, 3], title: 'Corner Residence', desc: 'Elevated — Dual Exposure' },
        { pos: [-3, 5, -3], title: 'Urban Retreat', desc: 'Mid-Rise — Private Balcony' }
    ],
    interior: [
        { pos: [1.5, 1.0, 1.5], title: "Carrara Marble", desc: "Italian Heritage Stone" },
        { pos: [4, 1.2, 0], title: "Primary Suite", desc: "Bespoke Sanctuary" }
    ]
};
