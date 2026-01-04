import React, { useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import { useStore } from './store';
import * as THREE from 'three';
import { RigidBody } from '@react-three/rapier';

// ASSET URLS
const MODELS = {
    city: 'https://raw.githubusercontent.com/decentralize-dfw/vea-randomfiles/main/DEMO2city-opt-v2.glb',
    ghost: 'https://raw.githubusercontent.com/decentralize-dfw/vea-randomfiles/main/DEMO2city-ghost.glb',
    metal: 'https://raw.githubusercontent.com/decentralize-dfw/vea-randomfiles/main/DEMO2city-metal-v1.glb',
    white: 'https://raw.githubusercontent.com/decentralize-dfw/vea-randomfiles/main/DEMO2city-whitefacade-v3.glb',
    normal: 'https://raw.githubusercontent.com/decentralize-dfw/vea-randomfiles/main/DEMO2kopuk-normalfacade-opt-v5.glb',
    surround: 'https://raw.githubusercontent.com/decentralize-dfw/vea-randomfiles/main/DEMO2-sehirici-apartmanici-opt-v6.glb',
    interior: 'https://raw.githubusercontent.com/decentralize-dfw/vea-randomfiles/main/DEMO2interior-soloapartement-opt-v4.glb',
    collider: 'https://raw.githubusercontent.com/decentralize-dfw/vea-randomfiles/main/SCENE5-COLLDERd.glb',
};

// Preload critical assets
Object.values(MODELS).forEach(url => useGLTF.preload(url));

export function World() {
    const chapter = useStore((s) => s.currentChapter);
    const subPhase = useStore((s) => s.subPhase);
    
    const city = useGLTF(MODELS.city);
    const ghost = useGLTF(MODELS.ghost);
    const metal = useGLTF(MODELS.metal);
    const white = useGLTF(MODELS.white);
    const normal = useGLTF(MODELS.normal);
    const surround = useGLTF(MODELS.surround);
    const interior = useGLTF(MODELS.interior);
    const collider = useGLTF(MODELS.collider);

    // Apply Shadows
    useEffect(() => {
        [city, ghost, metal, white, normal, surround, interior].forEach(gltf => {
            gltf.scene.traverse((o) => {
                if (o instanceof THREE.Mesh) {
                    o.castShadow = true;
                    o.receiveShadow = true;
                }
            });
        });
    }, [city, ghost, metal, white, normal, surround, interior]);

    // --- VISIBILITY LOGIC ---
    
    // Scene 0 (Arrival): Show City(0) + Normal(4)
    const s0 = chapter === 0;

    // Scene 1 (Context): Show City(0) + Normal(4)
    const s1 = chapter === 1;

    // Scene 2 (Design):
    // Opt 0: City(0) + White(3)
    // Opt 1: Metal(2) + Normal(4) (Based on user request mapping)
    const s2_opt0 = chapter === 2 && subPhase === 0;
    const s2_opt1 = chapter === 2 && subPhase === 1;

    // Scene 3 (Structure): Ghost(1) + Surround(5) (Ref: Ghost view)
    const s3 = chapter === 3;

    // Scene 4 & 5 (Interior): Interior(6)
    const s4_5 = chapter === 4 || chapter === 5;

    return (
        <group>
            {/* 0. CITY BASE */}
            <primitive object={city.scene} visible={s0 || s1 || s2_opt0} />

            {/* 1. GHOST */}
            <primitive object={ghost.scene} visible={s3} />

            {/* 2. METAL */}
            <primitive object={metal.scene} visible={s2_opt1} />

            {/* 3. WHITE FACADE */}
            <primitive object={white.scene} visible={s2_opt0} />

            {/* 4. NORMAL FACADE */}
            <primitive object={normal.scene} visible={s0 || s1 || s2_opt1} />

            {/* 5. SURROUNDINGS */}
            <primitive object={surround.scene} visible={s3} />

            {/* 6. INTERIOR */}
            <primitive object={interior.scene} visible={s4_5} />

            {/* 7. COLLIDER (Physics Only) */}
            {/* Critical: 'trimesh' is needed for complex static geometry so player doesn't fall */}
            {chapter === 5 && (
                <RigidBody type="fixed" colliders="trimesh">
                     <primitive object={collider.scene} visible={false} />
                </RigidBody>
            )}

            {/* Safety Floor */}
             <RigidBody type="fixed" rotation={[-Math.PI / 2, 0, 0]} position={[0, -10, 0]}>
                <planeGeometry args={[500, 500]} />
                <meshBasicMaterial visible={false} />
            </RigidBody>
        </group>
    );
}
