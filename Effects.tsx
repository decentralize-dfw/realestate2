import { EffectComposer, Bloom, SSAO, Noise, Vignette } from '@react-three/postprocessing';
import { useStore } from './store';
import { BlendFunction } from 'postprocessing';

export function Effects() {
    const quality = useStore((s) => s.quality);

    // Skip effects on low to save battery/performance
    if (quality === 'low') return null;

    return (
        <EffectComposer disableNormalPass={false} multisampling={quality === 'ultra' ? 8 : 4}>
            {/* ULTRA Mode: Premium studio lighting with subtle bloom */}
            {quality === 'ultra' ? (
                <Bloom
                    luminanceThreshold={1.0}
                    mipmapBlur
                    intensity={0.5}
                    radius={0.7}
                    levels={6}
                />
            ) : (
                <Bloom
                    luminanceThreshold={1.1}
                    mipmapBlur
                    intensity={0.4}
                    radius={0.6}
                />
            )}

            {/* ULTRA Mode: Realistic Ambient Occlusion for depth */}
            {quality === 'ultra' && (
                <SSAO
                    blendFunction={BlendFunction.MULTIPLY}
                    samples={50}
                    radius={0.08}
                    intensity={20}
                    luminanceInfluence={0.6}
                    bias={0.025}
                />
            )}

            {/* Film Grain - Subtle on ULTRA for professional look */}
            <Noise opacity={quality === 'ultra' ? 0.02 : 0.025} />

            {/* Vignette - Softer on ULTRA for studio quality */}
            <Vignette
                eskil={false}
                offset={quality === 'ultra' ? 0.1 : 0.1}
                darkness={quality === 'ultra' ? 0.8 : 0.9}
            />
        </EffectComposer>
    );
}
