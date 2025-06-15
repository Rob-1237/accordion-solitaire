import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { EffectComposer, Bloom } from '@react-three/postprocessing';

// First gradient (blue-gray to green-gray)
const BaseGradientPlane = () => {
  const mesh = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (!mesh.current) return;
    mesh.current.rotation.z = Math.sin(state.clock.getElapsedTime() * 0.2) * (Math.PI / 36); // 5 degrees
  });

  return (
    <mesh ref={mesh} position={[0, 0, 0]}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        vertexShader={`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          varying vec2 vUv;
          void main() {
            vec3 color1 = vec3(0.08, 0.10, 0.15);  // Darker blue-gray
            vec3 color2 = vec3(0.10, 0.15, 0.12);  // Darker green-gray
            
            vec2 uv = vUv - 0.5;
            float angle = 0.2;
            float t = dot(uv, vec2(cos(angle), sin(angle))) + 0.5;
            t = clamp(t, 0.0, 1.0);
            
            vec3 color = mix(color1, color2, t);
            gl_FragColor = vec4(color, 1.0);
          }
        `}
      />
    </mesh>
  );
};

// Second gradient (medium-gray to light-gray to medium-gray)
const OverlayGradientPlane = () => {
  const mesh = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (!mesh.current) return;
    mesh.current.rotation.z = Math.sin(state.clock.getElapsedTime() * 0.2) * (Math.PI / 30) - (Math.PI / 4);
  });

  return (
    <mesh ref={mesh} position={[0, 0, 0]}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        vertexShader={`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          varying vec2 vUv;
          void main() {
            // Three-color gradient with darker values
            vec3 color1 = vec3(0.15, 0.15, 0.15);  // Darker medium gray
            vec3 color2 = vec3(0.20, 0.20, 0.20);  // Darker light gray
            vec3 color3 = vec3(0.15, 0.15, 0.15);  // Darker medium gray again
            
            vec2 uv = vUv - 0.5;
            float angle = 0.2;
            float t = dot(uv, vec2(cos(angle), sin(angle))) + 0.5;
            t = clamp(t, 0.0, 1.0);
            
            // Create a three-color gradient
            vec3 color;
            if (t < 0.5) {
              color = mix(color1, color2, t * 2.0);
            } else {
              color = mix(color2, color3, (t - 0.5) * 2.0);
            }
            
            // Reduced opacity further
            gl_FragColor = vec4(color, 0.025);  // Reduced from 0.0375 to 0.025
          }
        `}
        transparent={true}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
};

// Noise utility functions
const random = (st: vec2) => {
  return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

const noise = (st: vec2) => {
  const i = floor(st);
  const f = fract(st);
  
  // Four corners in 2D of a tile
  const a = random(i);
  const b = random(i + vec2(1.0, 0.0));
  const c = random(i + vec2(0.0, 1.0));
  const d = random(i + vec2(1.0, 1.0));

  // Smooth interpolation
  const u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

// Add velocity tracking for fluid-like motion
const InteractiveNoisePlane = () => {
  const mesh = useRef<THREE.Mesh>(null);
  const velocityRef = useRef<THREE.Vector2>(new THREE.Vector2(0, 0));
  const prevMouseRef = useRef<THREE.Vector2>(new THREE.Vector2(0, 0));
  const { viewport, mouse } = useThree();

  // Update velocity based on mouse movement with slower response
  useFrame((state) => {
    if (!mesh.current) return;
    
    const currentMouse = new THREE.Vector2(mouse.x, mouse.y);
    const velocity = currentMouse.sub(prevMouseRef.current);
    // Slower velocity response (reduced from 0.5 to 0.2)
    velocityRef.current.lerp(velocity.multiplyScalar(0.2), 0.05); // Reduced from 0.1 to 0.05 for more viscosity
    prevMouseRef.current.copy(currentMouse);
    
    // Update uniforms
    const material = mesh.current.material as THREE.ShaderMaterial;
    material.uniforms.uVelocity.value = velocityRef.current;
    material.uniforms.uTime.value = state.clock.getElapsedTime() * 0.5; // Slow down time
    material.uniforms.uMouse.value = currentMouse;
  });

  return (
    <mesh ref={mesh} position={[0, 0, 0]}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        vertexShader={`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          varying vec2 vUv;
          uniform vec2 uMouse;
          uniform vec2 uVelocity;
          uniform float uTime;
          
          // Simplex noise functions
          vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
          vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
          vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
          
          float snoise(vec2 v) {
            const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                              -0.577350269189626, 0.024390243902439);
            vec2 i  = floor(v + dot(v, C.yy));
            vec2 x0 = v -   i + dot(i, C.xx);
            vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
            vec4 x12 = x0.xyxy + C.xxzz;
            x12.xy -= i1;
            i = mod289(i);
            vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
                           + i.x + vec3(0.0, i1.x, 1.0));
            vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
            m = m*m;
            m = m*m;
            vec3 x = 2.0 * fract(p * C.www) - 1.0;
            vec3 h = abs(x) - 0.5;
            vec3 ox = floor(x + 0.5);
            vec3 a0 = x - ox;
            m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
            vec3 g;
            g.x  = a0.x  * x0.x  + h.x  * x0.y;
            g.yz = a0.yz * x12.xz + h.yz * x12.yw;
            return 130.0 * dot(m, g);
          }
          
          void main() {
            vec2 uv = vUv - 0.5;
            
            // Mouse repulsion with stronger effect but slower speed
            vec2 mousePos = uMouse;
            float dist = length(uv - mousePos);
            float repulsionRadius = 0.7;
            float repulsionStrength = 8.0;
            
            // Calculate repulsion first
            float wave = sin(dist * 20.0 - uTime * 0.6) * 0.5 + 0.5; // Halved speed from 1.2 to 0.6
            float repulsion = smoothstep(repulsionRadius, 0.0, dist) * repulsionStrength * wave;
            
            // Fluid-like base movement with higher viscosity
            vec2 noiseCoord = uv * 6.0;
            
            // Add velocity influence with more viscosity but slower
            vec2 velocity = uVelocity * 0.75; // Halved from 1.5
            noiseCoord += velocity * 0.4; // Halved from 0.8
            
            // Multiple layers of fluid turbulence with more viscosity
            float fluid = 0.0;
            // Base fluid motion (slower)
            fluid += snoise(noiseCoord * 1.5 + uTime * 0.05) * 0.5; // Halved speed from 0.1
            // Secondary fluid motion (slower)
            fluid += snoise(noiseCoord * 3.0 - uTime * 0.04) * 0.25; // Halved speed from 0.08
            // Tertiary fluid motion (slower)
            fluid += snoise(noiseCoord * 6.0 + uTime * 0.025) * 0.125; // Halved speed from 0.05
            
            // Combine fluid motion with repulsion and add viscosity
            vec2 repulsionDir = normalize(uv - mousePos);
            float viscosityFactor = 0.5;
            noiseCoord += repulsionDir * repulsion * viscosityFactor + vec2(fluid) * 0.4;
            
            // Final noise with fluid-like properties
            float n = snoise(noiseCoord);
            n = smoothstep(-0.4, 0.4, n);
            
            // Stronger viscosity effect
            float viscosity = smoothstep(0.0, repulsionRadius * 2.0, dist);
            n = mix(n * 0.15, n, viscosity);
            
            // Slower wave motion
            n += sin(uv.x * 8.0 + uTime * 0.35) * 0.05; // Halved speed from 0.7
            n += sin(uv.y * 8.0 + uTime * 0.35) * 0.05; // Halved speed from 0.7
            
            // Edge falloff
            float edgeFalloff = 1.0 - smoothstep(0.4, 0.5, length(uv));
            n *= edgeFalloff;
            
            // Final color with reduced opacity
            gl_FragColor = vec4(0.0, 0.0, 0.0, n * 0.1); // Reduced from 0.3 to 0.1
          }
        `}
        transparent={true}
        uniforms={{
          uMouse: { value: new THREE.Vector2(0, 0) },
          uVelocity: { value: new THREE.Vector2(0, 0) },
          uTime: { value: 0 }
        }}
      />
    </mesh>
  );
};

// Update uniforms in animation frame
const NoiseUpdater = () => {
  const { viewport, mouse } = useThree();
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uMouse.value.set(
        (mouse.x * viewport.width) / 2,
        (mouse.y * viewport.height) / 2
      );
      materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
    }
  });

  return null;
};

const ParticleSystem = () => {
  const particlesRef = useRef<THREE.Points>(null);
  const particleCount = 300;
  const { viewport } = useThree();
  
  // Create particle positions and velocities
  const { positions, velocities } = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 2);
    
    const width = viewport.width;
    const height = viewport.height;
    
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * width;
      positions[i * 3 + 1] = (Math.random() - 0.5) * height;
      positions[i * 3 + 2] = 0;
      
      // Reduced velocity by another 50% (from 0.005 to 0.0025)
      velocities[i * 2] = (Math.random() - 0.5) * 0.0025;
      velocities[i * 2 + 1] = (Math.random() - 0.5) * 0.0025;
    }
    
    return { positions, velocities };
  }, [viewport]);

  // Create geometry with proper initialization
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.computeBoundingSphere();
    geo.computeBoundingBox();
    return geo;
  }, [positions]);

  // Update particle positions
  useFrame(() => {
    if (!particlesRef.current) return;
    
    const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
    const width = viewport.width;
    const height = viewport.height;
    
    for (let i = 0; i < particleCount; i++) {
      // Update position based on velocity
      positions[i * 3] += velocities[i * 2];
      positions[i * 3 + 1] += velocities[i * 2 + 1];
      
      // Wrap particles around screen edges using viewport dimensions
      if (positions[i * 3] > width/2) positions[i * 3] = -width/2;
      if (positions[i * 3] < -width/2) positions[i * 3] = width/2;
      if (positions[i * 3 + 1] > height/2) positions[i * 3 + 1] = -height/2;
      if (positions[i * 3 + 1] < -height/2) positions[i * 3 + 1] = height/2;
    }
    
    particlesRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={particlesRef}>
      <primitive object={geometry} />
      <pointsMaterial
        size={0.05}
        color={0x008080}
        transparent={true}
        opacity={0.4}
        sizeAttenuation={false}
        depthWrite={false}
        depthTest={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

// Dark particles (exact copy of ParticleSystem)
const DarkParticleSystem = () => {
  const particlesRef = useRef<THREE.Points>(null);
  const particleCount = 300; // Match original count
  const { viewport } = useThree();
  
  // Create particle positions and velocities (exact copy of original)
  const { positions, velocities } = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 2);
    
    const width = viewport.width;
    const height = viewport.height;
    
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * width;
      positions[i * 3 + 1] = (Math.random() - 0.5) * height;
      positions[i * 3 + 2] = 0; // Match original z=0
      
      velocities[i * 2] = (Math.random() - 0.5) * 0.0025;
      velocities[i * 2 + 1] = (Math.random() - 0.5) * 0.0025;
    }
    
    return { positions, velocities };
  }, [viewport]);

  // Create geometry with proper initialization (exact copy of original)
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.computeBoundingSphere();
    geo.computeBoundingBox();
    return geo;
  }, [positions]);

  // Update particle positions (exact copy of original)
  useFrame(() => {
    if (!particlesRef.current) return;
    
    const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
    const width = viewport.width;
    const height = viewport.height;
    
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] += velocities[i * 2];
      positions[i * 3 + 1] += velocities[i * 2 + 1];
      
      if (positions[i * 3] > width/2) positions[i * 3] = -width/2;
      if (positions[i * 3] < -width/2) positions[i * 3] = width/2;
      if (positions[i * 3 + 1] > height/2) positions[i * 3 + 1] = -height/2;
      if (positions[i * 3 + 1] < -height/2) positions[i * 3 + 1] = height/2;
    }
    
    particlesRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={particlesRef}>
      <primitive object={geometry} />
      <pointsMaterial
        size={0.05}
        color={0x708090}
        transparent={true}
        opacity={1.0}
        sizeAttenuation={false}
        depthWrite={false}
        depthTest={false}
        blending={THREE.NormalBlending}
      />
    </points>
  );
};

const EtherealBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 -z-10 w-screen h-screen overflow-hidden">
      <Canvas
        camera={{ 
          position: [0, 0, 5],
          fov: 75,
          near: 0.1,
          far: 1000,
          aspect: window.innerWidth / window.innerHeight
        }}
        style={{
          width: '100vw',
          height: '100vh',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'transparent',
        }}
        gl={{
          antialias: true,
          alpha: true,
          depth: true,
          clearColor: [0, 0, 0, 0], // Set clear color to fully transparent
        }}
        orthographic={false}
      >
        <color attach="background" args={[0x000000]} /> {/* Use hex color with alpha handled by gl.clearColor */}
        <BaseGradientPlane />
        <OverlayGradientPlane />
        <InteractiveNoisePlane />
        <NoiseUpdater />
        <ParticleSystem />
        <DarkParticleSystem />
        <EffectComposer>
          <Bloom
            intensity={2.0}
            luminanceThreshold={0.05}
            luminanceSmoothing={0.9}
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
};

export default EtherealBackground; 