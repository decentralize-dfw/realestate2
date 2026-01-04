import { create } from 'zustand';

export type Quality = 'low' | 'high' | 'ultra';
export type ViewMode = 'orbit' | 'fps';

interface ConfigState {
    sunIntensity: number;
    envIntensity: number;
    sunColor: string;
    isConfigOpen: boolean;
    toggleConfig: () => void;
    updateConfig: (key: keyof Omit<ConfigState, 'isConfigOpen' | 'toggleConfig' | 'updateConfig'>, value: any) => void;
    resetConfig: () => void;
}

interface AppState extends ConfigState {
    quality: Quality;
    viewMode: ViewMode;
    currentChapter: number;
    subPhase: number; // For Scene 1 (0-2), Scene 2 (0-1), Scene 4 (0-5)
    
    isMenuOpen: boolean;
    screenshotTrigger: number;
    flashTrigger: number; // Triggers the black fade effect
    
    setQuality: (q: Quality) => void;
    setViewMode: (v: ViewMode) => void;
    setChapter: (index: number) => void;
    setSubPhase: (index: number) => void;
    toggleMenu: () => void;
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
    screenshotTrigger: 0,
    flashTrigger: 0,

    ...DEFAULT_CONFIG,
    isConfigOpen: false,

    setQuality: (quality) => set({ quality }),
    setViewMode: (viewMode) => set({ viewMode }),
    setChapter: (index) => set((state) => {
        // Reset subphase when changing chapters
        const newPhase = 0;
        // Trigger flash if entering interior (Chapter 4)
        if (index === 4 && state.currentChapter !== 4) {
             set({ flashTrigger: state.flashTrigger + 1 });
        }
        return { currentChapter: index, subPhase: newPhase };
    }),
    setSubPhase: (index) => set({ subPhase: index }),
    toggleMenu: () => set((state) => ({ isMenuOpen: !state.isMenuOpen })),
    triggerScreenshot: () => set((state) => ({ screenshotTrigger: state.screenshotTrigger + 1 })),
    triggerFlash: () => set((state) => ({ flashTrigger: state.flashTrigger + 1 })),
    
    toggleConfig: () => set((state) => ({ isConfigOpen: !state.isConfigOpen })),
    updateConfig: (key, value) => set({ [key]: value }),
    resetConfig: () => set({ ...DEFAULT_CONFIG })
}));

// Data from original project
export const CHAPTER_DATA = [
    { 
        title: 'The Arrival', 
        subtitle: 'Distinguished Living',
        desc: 'Experience an architectural masterpiece that redefines urban luxury.',
        detailTitle: 'Architectural Vision',
        detailDesc: 'Isometric presentation revealing the complete design philosophy.',
        options: []
    },
    { 
        title: 'Context', 
        subtitle: 'Prime Location',
        desc: 'Nestled in the heart of the city\'s most prestigious neighborhood.',
        detailTitle: 'Urban Integration',
        detailDesc: 'Seamlessly woven into the urban fabric.',
        options: ['Surrounding', 'Transportation', 'Units'] 
    },
    { 
        title: 'Design', 
        subtitle: 'Pure Elegance',
        desc: 'Timeless sophistication meets modern minimalism.',
        detailTitle: 'Material Excellence',
        detailDesc: 'Premium materials sourced globally.',
        options: ['White Facade', 'Metal Concept']
    },
    { 
        title: 'Structure', 
        subtitle: 'Intelligent Design',
        desc: 'Ghost view revealing the sophisticated internal organization.',
        detailTitle: 'Systems Integration',
        detailDesc: 'State-of-the-art building systems.',
        options: []
    },
    { 
        title: 'Interior', 
        subtitle: 'Grand Salon',
        desc: 'Floor-to-ceiling windows flood the expansive living area.',
        detailTitle: 'Living Excellence',
        detailDesc: 'Curated for entertaining and daily luxury.',
        options: ['Salon', 'Kitchen', 'Bed 1', 'Bath 1', 'Bed 2', 'Bath 2']
    },
    { 
        title: 'Walkthrough', 
        subtitle: 'Free Exploration',
        desc: 'Use W/A/S/D to move, Shift to sprint, Space to jump.',
        detailTitle: 'Virtual Reality',
        detailDesc: 'Full immersion. Feel the flow, discover the details.',
        options: []
    },
];

export const HOTSPOTS_DATA = {
    surrounding: [
        { pos: [-8, 2, 5], title: 'Central Park', desc: '800m - Green Space' },
        { pos: [6, 1.5, -7], title: 'Shopping District', desc: '1.2km - Luxury Retail' },
        { pos: [-5, 3, -6], title: 'Cultural Center', desc: '600m - Art Galleries' },
        { pos: [7, 2.5, 4], title: 'Restaurant Row', desc: '450m - Fine Dining' }
    ],
    transportation: [
        { pos: [-3, 0.5, 6], title: 'Metro Line A', desc: '250m - City Center' },
        { pos: [5, 0.5, -4], title: 'Bus Hub', desc: '180m - All Routes' },
        { pos: [9, 0.5, -9], title: 'Helipad', desc: '3.2km - Private Service' }
    ],
    units: [
        { pos: [0, 12, 0], title: 'Penthouse', desc: 'Top Floor - 360 View' },
        { pos: [3, 8, 3], title: '2BR Corner', desc: '12th Floor' },
        { pos: [-3, 5, -3], title: 'Studio Loft', desc: '8th Floor' }
    ],
    interior: [
        // Dummy positions for Scene 4
        { pos: [1.5, 1.0, 1.5], title: "Italian Marble", desc: "Carrara Import" },
        { pos: [4, 1.2, 0], title: "Master Bed", desc: "King Size Suite" }
    ]
};
