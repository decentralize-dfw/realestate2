import { EffectComposer, Bloom, SSAO, Noise, Vignette, ToneMapping, SSR, BrightnessContrast, HueSaturation } from '@react-three/postprocessing';
import { useStore } from './store';
import { BlendFunction, ToneMappingMode } from 'postprocessing';
import { useThree } from '@react-three/fiber';

export function Effects() {
    const quality = useStore((s) => s.quality);
    const chapter = useStore((s) => s.currentChapter);
    const { gl } = useThree();

    // Skip effects on low to save battery/performance
    if (quality === 'low') return null;

    const isInterior = chapter === 4 || chapter === 5;

    return (
        <EffectComposer
            disableNormalPass={false}
            multisampling={quality === 'ultra' ? 8 : 4}
        >
            {/* ===========================================
                ULTRA MODE - Maximum Quality Real-time Lighting
                SSGI-inspired setup with enhanced AO, bloom, and SSR
                =========================================== */}

            {quality === 'ultra' ? (
                <>
                    {/* Screen Space Reflections - Adds indirect lighting bounce effect
                        Simulates light bouncing off surfaces for more realistic GI */}
                    <SSR
                        temporalResolve={true}
                        temporalResolveMix={0.9}
                        temporalResolveCorrectionMix={0.4}
                        maxSamples={0}
                        resolutionScale={1}
                        blurMix={0.2}
                        blurKernelSize={8}
                        blurSharpness={0.5}
                        rayStep={0.1}
                        intensity={1}
                        maxRoughness={1}
                        jitter={0.3}
                        jitterSpread={0.25}
                        jitterRough={0.1}
                        roughnessFadeOut={1}
                        rayFadeOut={0}
                        MAX_STEPS={20}
                        NUM_BINARY_SEARCH_STEPS={6}
                        maxDepthDifference={5}
                        maxDepth={1}
                        thickness={3}
                        ior={1.45}
                    />

                    {/* Enhanced SSAO - Ground Truth Ambient Occlusion style
                        Creates natural darkness in corners and contact points */}
                    <SSAO
                        blendFunction={BlendFunction.MULTIPLY}
                        samples={isInterior ? 128 : 64}
                        rings={7}
                        distanceThreshold={0.6}
                        distanceFalloff={0.1}
                        rangeThreshold={0.05}
                        rangeFalloff={0.01}
                        luminanceInfluence={0.7}
                        radius={isInterior ? 0.08 : 0.12}
                        intensity={isInterior ? 25 : 35}
                        bias={0.025}
                        worldDistanceThreshold={10}
                        worldDistanceFalloff={5}
                        worldProximityThreshold={0.5}
                        worldProximityFalloff={0.3}
                    />

                    {/* Dramatic Bloom - Emissive glow and light bleeding
                        Creates realistic light spill from bright areas */}
                    <Bloom
                        luminanceThreshold={isInterior ? 0.6 : 0.75}
                        luminanceSmoothing={0.9}
                        mipmapBlur
                        intensity={isInterior ? 1.5 : 1.2}
                        radius={0.85}
                        levels={8}
                    />

                    {/* Subtle brightness/contrast enhancement */}
                    <BrightnessContrast
                        brightness={0.02}
                        contrast={0.08}
                    />

                    {/* Slight saturation boost for vibrant colors */}
                    <HueSaturation
                        hue={0}
                        saturation={0.12}
                    />

                    {/* ACESFilmic ToneMapping for cinematic look */}
                    <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />

                    {/* Minimal film grain for organic feel */}
                    <Noise opacity={0.015} />

                    {/* Cinematic vignette */}
                    <Vignette
                        eskil={false}
                        offset={0.15}
                        darkness={0.7}
                    />
                </>
            ) : (
                <>
                    {/* ===========================================
                        HIGH MODE - Balanced Quality/Performance
                        =========================================== */}

                    {/* Standard SSAO */}
                    <SSAO
                        blendFunction={BlendFunction.MULTIPLY}
                        samples={32}
                        radius={0.15}
                        intensity={20}
                        luminanceInfluence={0.6}
                        bias={0.025}
                    />

                    {/* Moderate Bloom */}
                    <Bloom
                        luminanceThreshold={1.0}
                        mipmapBlur
                        intensity={0.5}
                        radius={0.65}
                    />

                    {/* Film Grain */}
                    <Noise opacity={0.025} />

                    {/* Vignette */}
                    <Vignette
                        eskil={false}
                        offset={0.1}
                        darkness={0.85}
                    />
                </>
            )}
        </EffectComposer>
    );
}
