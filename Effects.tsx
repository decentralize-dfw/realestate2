import { EffectComposer, Bloom, SSAO, Noise, Vignette, ToneMapping } from '@react-three/postprocessing';
import { useStore } from './store';
import { BlendFunction } from 'postprocessing';

export function Effects() {
    const quality = useStore((s) => s.quality);

    // Skip effects on low to save battery/performance
    if (quality === 'low') return null;

    return (
        <EffectComposer disableNormalPass={false} multisampling={quality === 'ultra' ? 8 : 4}>
            {/* Cinematic Glow - Mipmap blur for 'Unreal' soft bloom */}
            <Bloom 
                luminanceThreshold={1.1} 
                mipmapBlur 
                intensity={0.4} 
                radius={0.6} 
            />
            
            {/* Realistic Ambient Occlusion (Corners) - Ultra only */}
            {quality === 'ultra' && (
                <SSAO 
                    blendFunction={BlendFunction.MULTIPLY} 
                    samples={30} 
                    radius={0.05} 
                    intensity={15} 
                />
            )}

            {/* Film Grain & Vignette for Cinematic Look */}
            <Noise opacity={0.025} />
            <Vignette eskil={false} offset={0.1} darkness={0.9} />
            
            {/* Tone Mapping handled by Canvas, but can be augmented here if needed */}
        </EffectComposer>
    );
}
