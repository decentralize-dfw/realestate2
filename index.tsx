import React from 'react';
import { createRoot } from 'react-dom/client';
import { Scene } from './Scene';
import { Interface } from './Interface';

function App() {
    return (
        <div className="relative w-full h-full">
            <Scene />
            <Interface />
        </div>
    );
}

const rootElement = document.getElementById('root');
if (rootElement) {
    const root = createRoot(rootElement);
    root.render(<App />);
}
