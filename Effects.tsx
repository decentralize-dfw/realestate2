import { EffectComposer, Bloom, SSAO, Noise, Vignette, ToneMapping, ChromaticAberration, DepthOfField } from '@react-three/postprocessing';
import { useStore } from './store';
import { BlendFunction } from 'postprocessing';

export function Effects() {
    const quality = useStore((s) => s.quality);

    // Skip effects on low to save battery/performance
    if (quality === 'low') return null;

    return (
        <EffectComposer disableNormalPass={false} multisampling={quality === 'ultra' ? 8 : 4}>
            {/* ULTRA Mode: Dramatic cinematic bloom */}
            {quality === 'ultra' ? (
                <Bloom
                    luminanceThreshold={0.9}
                    mipmapBlur
                    intensity={0.8}
                    radius={0.85}
                    levels={8}
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
                    intensity={25}
                    luminanceInfluence={0.6}
                    bias={0.025}
                />
            )}

            {/* ULTRA Mode: Chromatic aberration for premium lens effect */}
            {quality === 'ultra' && (
                <ChromaticAberration
                    blendFunction={BlendFunction.NORMAL}
                    offset={[0.0015, 0.0015]}
                />
            )}

            {/* Film Grain - Stronger on ULTRA */}
            <Noise opacity={quality === 'ultra' ? 0.035 : 0.025} />

            {/* Vignette - Darker on ULTRA for cinematic look */}
            <Vignette
                eskil={false}
                offset={quality === 'ultra' ? 0.15 : 0.1}
                darkness={quality === 'ultra' ? 1.0 : 0.9}
            />
        </EffectComposer>
    );
}
