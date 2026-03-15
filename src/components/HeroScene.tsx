import { useThree } from '@react-three/fiber'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { useEffect, useMemo, useRef } from 'react'
import { Color, ShaderMaterial, Vector2 } from 'three'
import fragmentShader from '../shaders/hero.frag'
import vertexShader from '../shaders/hero.vert'

const COLOR_A = new Color('#081432')
const COLOR_B = new Color('#0b2a5a')
const COLOR_ACCENT = new Color('#e8f1ff')

export function HeroScene() {
  return (
    <group>
      <HeroPlane />
      <EffectComposer multisampling={0}>
        <Bloom intensity={1.2} luminanceThreshold={0.15} radius={0.4} />
      </EffectComposer>
    </group>
  )
}

function HeroPlane() {
  const materialRef = useRef<ShaderMaterial | null>(null)
  const { size, invalidate } = useThree()

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uResolution: { value: new Vector2(size.width, size.height) },
      uColorA: { value: COLOR_A },
      uColorB: { value: COLOR_B },
      uAccent: { value: COLOR_ACCENT },
    }),
    [size.height, size.width]
  )

  useEffect(() => {
    if (!materialRef.current) return
    materialRef.current.uniforms.uResolution.value.set(size.width, size.height)
  }, [size.width, size.height])

  useEffect(() => {
    let frameId: number
    
    // Drive the animation outside of R3F's render cycle so invalidate() works 
    // with frameloop="demand" on the parent Canvas.
    const tick = (time: number) => {
      if (materialRef.current) {
        materialRef.current.uniforms.uTime.value = time * 0.001
      }
      invalidate()
      frameId = requestAnimationFrame(tick)
    }

    frameId = requestAnimationFrame(tick)

    return () => cancelAnimationFrame(frameId)
  }, [invalidate])

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  )
}
