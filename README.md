# VEA | Architectural Excellence Redefined

An immersive 3D architectural experience showcasing refined living spaces through cutting-edge web technologies.

## ✨ Features

- **Immersive 3D Visualization** - Powered by Three.js and React Three Fiber
- **VR Ready** - Full WebXR support for virtual reality experiences
- **Cinematic Presentation** - Multiple curated chapters with smooth transitions
- **Premium UI/UX** - Zen, clean, and luxurious design language
- **Interactive Hotspots** - Discover contextual information throughout the experience
- **Real-time Environment Controls** - Adjust lighting and atmosphere dynamically
- **Performance Optimized** - Adaptive quality settings and code splitting

## 🚀 Live Demo

Visit: **[https://decentralize-dfw.github.io/realestate2/](https://decentralize-dfw.github.io/realestate2/)**

## 🛠️ Tech Stack

- React 19 | Three.js 0.167 | TypeScript | Vite
- @react-three/fiber, drei, xr, rapier
- Framer Motion | GSAP | Zustand

## 📦 Installation & Development

```bash
# Install dependencies
npm install --legacy-peer-deps

# Start development server (localhost:3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🌐 GitHub Pages Deployment

This project automatically deploys to GitHub Pages via GitHub Actions.

### Automatic Deployment
- Push to `main` or `claude/fix-xr-store-export-Oerp0` branch
- GitHub Actions builds and deploys automatically
- Live in ~2-3 minutes

### Manual Setup
1. Repository Settings → Pages
2. Source: "GitHub Actions"
3. Push to trigger deployment

## 🎮 Controls

- **Orbit**: Drag to rotate, scroll to zoom
- **FPS** (Ch. 6): W/A/S/D move, Shift sprint, Space jump
- **Quality**: Low/High/Ultra
- **Environment**: Adjust lighting in real-time

## 📋 Project Structure

```
├── .github/workflows/  # Auto-deployment
├── public/            # Static assets
├── Interface.tsx      # Premium UI components
├── Scene.tsx          # 3D scene & camera
├── World.tsx          # 3D models
├── store.ts           # State management
└── vite.config.ts     # Build config
```

## 🎨 Design Philosophy

**Zen • Clean • Luxury**

- Refined typography with elegant spacing
- Glass-morphism & backdrop blur effects
- Physics-based animations
- Emerald accent palette
- Architectural language

---

**VEA** - Where architectural vision transcends the digital realm.
