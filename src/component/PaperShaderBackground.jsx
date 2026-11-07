import { GrainGradient } from '@paper-design/shaders-react'

export default function PaperShaderBackground() {
  return (
    <div className="post-hero-shader" aria-hidden="true">
      <GrainGradient
        style={{ width: '100%', height: '100%' }}
        colorBack="hsl(42, 30%, 98%)"
        softness={0.76}
        intensity={0.2}
        noise={0}
        shape="corners"
        offsetX={0}
        offsetY={0}
        scale={1}
        rotation={0}
        speed={0.08}
        colors={['hsl(14, 76%, 67%)', 'hsl(45, 78%, 70%)', 'hsl(340, 58%, 72%)']}
      />
    </div>
  )
}
