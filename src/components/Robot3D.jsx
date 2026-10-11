import React, { useRef, useState, useEffect, Suspense, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, ContactShadows, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

/**
 * Premium 3D AI Robot Mascot for CallMateAI
 * Adorable, expressive, futuristic designer toy robot
 */
function RobotModel({ pose = 'hero', interactive = true }) {
  const rootGroup = useRef();
  const headGroup = useRef();
  const rightArmGroup = useRef();
  const rightForearmGroup = useRef();
  const leftArmGroup = useRef();
  const chestCoreRef = useRef();
  const antennaLightRef = useRef();
  const pedestalGroup = useRef();
  const innerRingRef = useRef();
  const outerRingRef = useRef();

  // Natural blink state with smooth interpolation
  const [blink, setBlink] = useState(false);

  useEffect(() => {
    let blinkTimeout;
    const triggerBlink = () => {
      setBlink(true);
      blinkTimeout = setTimeout(() => {
        setBlink(false);
      }, 150);
    };

    const interval = setInterval(triggerBlink, 3600);
    return () => {
      clearInterval(interval);
      clearTimeout(blinkTimeout);
    };
  }, []);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();

    // 1. Floating & subtle gentle body sway
    if (rootGroup.current) {
      rootGroup.current.position.y = Math.sin(t * 1.5) * 0.06;
      rootGroup.current.rotation.y = THREE.MathUtils.lerp(
        rootGroup.current.rotation.y,
        interactive ? state.pointer.x * 0.18 : Math.sin(t * 0.4) * 0.08,
        0.04
      );
      rootGroup.current.rotation.z = Math.sin(t * 1.1) * 0.015;
    }

    // 2. Interactive Head Tracking (curious, cute puppy tilt)
    if (headGroup.current && interactive) {
      headGroup.current.rotation.y = THREE.MathUtils.lerp(
        headGroup.current.rotation.y,
        state.pointer.x * 0.42,
        0.06
      );
      headGroup.current.rotation.x = THREE.MathUtils.lerp(
        headGroup.current.rotation.x,
        -state.pointer.y * 0.26,
        0.06
      );
      headGroup.current.rotation.z = THREE.MathUtils.lerp(
        headGroup.current.rotation.z,
        -state.pointer.x * 0.12,
        0.06
      );
    }

    // 3. Friendly waving animation on right arm
    if (rightArmGroup.current) {
      if (pose === 'hero' || pose === 'greeting') {
        // Upper arm stays raised with slight breathing
        rightArmGroup.current.rotation.z = -1.1 + Math.sin(t * 2) * 0.05;
        rightArmGroup.current.rotation.x = -0.25 + Math.cos(t * 1.5) * 0.05;
        
        // Forearm and cute mitten hand waves side-to-side
        if (rightForearmGroup.current) {
          rightForearmGroup.current.rotation.z = Math.sin(t * 4.5) * 0.35 + 0.3;
        }
      } else {
        rightArmGroup.current.rotation.z = -0.25 + Math.sin(t * 1.5) * 0.04;
      }
    }

    // 4. Subtle relaxed breathing on left arm
    if (leftArmGroup.current) {
      leftArmGroup.current.rotation.z = 0.22 + Math.sin(t * 1.4 + 1.2) * 0.04;
      leftArmGroup.current.rotation.x = Math.sin(t * 1.2) * 0.03;
    }

    // 5. Pulsing chest core & antenna beacon
    const pulse = Math.sin(t * 3.2) * 0.5 + 2.4;
    if (chestCoreRef.current) {
      chestCoreRef.current.material.emissiveIntensity = pulse;
    }
    if (antennaLightRef.current) {
      antennaLightRef.current.material.emissiveIntensity = pulse * 1.2;
    }

    // 6. Holographic pedestal rings rotation
    if (innerRingRef.current) {
      innerRingRef.current.rotation.z = t * 0.7;
    }
    if (outerRingRef.current) {
      outerRingRef.current.rotation.z = -t * 0.45;
    }
    if (pedestalGroup.current) {
      pedestalGroup.current.rotation.y = t * 0.25;
    }
  });

  // High-Quality Shared Materials
  const materials = useMemo(() => {
    return {
      // Smooth glossy pearl-white helmet & body
      pearlBody: new THREE.MeshPhysicalMaterial({
        color: '#ffffff',
        roughness: 0.14,
        metalness: 0.05,
        clearcoat: 0.8,
        clearcoatRoughness: 0.1,
        reflectivity: 0.7
      }),
      // Deep obsidian glossy curved visor glass
      visorGlass: new THREE.MeshPhysicalMaterial({
        color: '#030712',
        roughness: 0.04,
        metalness: 0.15,
        clearcoat: 1.0,
        clearcoatRoughness: 0.04,
        reflectivity: 0.95
      }),
      // Matte dark titanium trim & joints
      darkTrim: new THREE.MeshStandardMaterial({
        color: '#111827',
        roughness: 0.35,
        metalness: 0.8
      }),
      // Brilliant cyan glowing neon (eyes, core, headset ring)
      cyanGlow: new THREE.MeshStandardMaterial({
        color: '#38bdf8',
        emissive: '#00f2fe',
        emissiveIntensity: 2.8,
        roughness: 0.15
      }),
      // Electric violet glowing neon
      violetGlow: new THREE.MeshStandardMaterial({
        color: '#a855f7',
        emissive: '#8b5cf6',
        emissiveIntensity: 2.6,
        roughness: 0.15
      }),
      // Soft internal visor glow aura
      visorBacklight: new THREE.MeshBasicMaterial({
        color: '#0284c7',
        transparent: true,
        opacity: 0.12
      })
    };
  }, []);

  return (
    <group ref={rootGroup} position={[0, -0.05, 0]}>
      
      {/* ========================================================================= */}
      {/* 1. HEAD & VISOR (ADORABLE CHIBI PROPORTIONS)                              */}
      {/* ========================================================================= */}
      <group ref={headGroup} position={[0, 0.52, 0]}>
        
        {/* Main Smooth Helmet (Slightly wider for cute chibi look) */}
        <mesh castShadow receiveShadow scale={[1.08, 0.98, 1.02]}>
          <sphereGeometry args={[0.54, 64, 48]} />
          <primitive object={materials.pearlBody} attach="material" />
        </mesh>

        {/* Glossy Black Curved Visor (Covers most of the front face) */}
        <group position={[0, -0.02, 0.18]} scale={[0.92, 0.74, 0.86]}>
          <mesh castShadow>
            <sphereGeometry args={[0.52, 64, 48, 0, Math.PI * 2, 0, Math.PI * 0.52]} />
            <primitive object={materials.visorGlass} attach="material" />
          </mesh>

          {/* Subtle internal backlight glow inside visor */}
          <mesh position={[0, 0, -0.02]} scale={[0.96, 0.96, 0.96]}>
            <sphereGeometry args={[0.5, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
            <primitive object={materials.visorBacklight} attach="material" />
          </mesh>

          {/* Delicate border bezel framing the visor */}
          <mesh position={[0, 0, 0.01]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.49, 0.018, 16, 48]} />
            <primitive object={materials.darkTrim} attach="material" />
          </mesh>
        </group>

        {/* ======================================================================= */}
        {/* 2. EXPRESSIVE GLOWING CYAN EYES & SMILE                                  */}
        {/* ======================================================================= */}
        <group position={[0, -0.01, 0.57]}>
          
          {/* Eyes Group with smooth blink scaling */}
          <group scale={blink ? [1, 0.08, 1] : [1, 1, 1]}>
            
            {/* Left Eye: Cute Curved Smiling Crescent Arc */}
            <group position={[-0.17, 0.05, 0]}>
              {/* Main curved eye arc */}
              <mesh rotation={[0, 0, Math.PI * 0.98]}>
                <torusGeometry args={[0.075, 0.022, 16, 32, Math.PI * 0.82]} />
                <primitive object={materials.cyanGlow} attach="material" />
              </mesh>
              {/* Left eye top glint / sparkle */}
              <mesh position={[0.02, 0.05, 0.01]}>
                <sphereGeometry args={[0.016, 12, 12]} />
                <primitive object={materials.cyanGlow} attach="material" />
              </mesh>
            </group>

            {/* Right Eye: Cute Curved Smiling Crescent Arc */}
            <group position={[0.17, 0.05, 0]}>
              <mesh rotation={[0, 0, Math.PI * 0.98]}>
                <torusGeometry args={[0.075, 0.022, 16, 32, Math.PI * 0.82]} />
                <primitive object={materials.cyanGlow} attach="material" />
              </mesh>
              {/* Right eye top glint / sparkle */}
              <mesh position={[-0.02, 0.05, 0.01]}>
                <sphereGeometry args={[0.016, 12, 12]} />
                <primitive object={materials.cyanGlow} attach="material" />
              </mesh>
            </group>

            {/* Cute Little Digital Smile Arc */}
            <mesh position={[0, -0.08, -0.01]} rotation={[0, 0, Math.PI]}>
              <torusGeometry args={[0.048, 0.014, 16, 24, Math.PI * 0.72]} />
              <primitive object={materials.cyanGlow} attach="material" />
            </mesh>
          </group>

          {/* Cute glowing blush dots on cheeks */}
          <mesh position={[-0.24, -0.05, -0.02]}>
            <circleGeometry args={[0.024, 16]} />
            <meshBasicMaterial color="#38bdf8" transparent opacity={0.35} />
          </mesh>
          <mesh position={[0.24, -0.05, -0.02]}>
            <circleGeometry args={[0.024, 16]} />
            <meshBasicMaterial color="#38bdf8" transparent opacity={0.35} />
          </mesh>
        </group>

        {/* ======================================================================= */}
        {/* 3. HEADPHONES WITH CONCENTRIC BLUE & VIOLET ILLUMINATED RINGS            */}
        {/* ======================================================================= */}
        {/* Left Earcup */}
        <group position={[-0.56, 0.02, 0]} rotation={[0, 0, Math.PI / 2]}>
          {/* Main rounded cushion */}
          <mesh castShadow>
            <cylinderGeometry args={[0.2, 0.22, 0.13, 36]} />
            <primitive object={materials.pearlBody} attach="material" />
          </mesh>
          {/* Outer dark bevel frame */}
          <mesh position={[0, 0.065, 0]}>
            <cylinderGeometry args={[0.18, 0.18, 0.02, 32]} />
            <primitive object={materials.darkTrim} attach="material" />
          </mesh>
          {/* Concentric Electric Cyan Ring */}
          <mesh position={[0, 0.076, 0]}>
            <torusGeometry args={[0.14, 0.018, 16, 36]} />
            <primitive object={materials.cyanGlow} attach="material" />
          </mesh>
          {/* Concentric Electric Violet Ring */}
          <mesh position={[0, 0.076, 0]}>
            <torusGeometry args={[0.085, 0.016, 16, 28]} />
            <primitive object={materials.violetGlow} attach="material" />
          </mesh>
        </group>

        {/* Right Earcup */}
        <group position={[0.56, 0.02, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.2, 0.22, 0.13, 36]} />
            <primitive object={materials.pearlBody} attach="material" />
          </mesh>
          <mesh position={[0, 0.065, 0]}>
            <cylinderGeometry args={[0.18, 0.18, 0.02, 32]} />
            <primitive object={materials.darkTrim} attach="material" />
          </mesh>
          {/* Concentric Electric Cyan Ring */}
          <mesh position={[0, 0.076, 0]}>
            <torusGeometry args={[0.14, 0.018, 16, 36]} />
            <primitive object={materials.cyanGlow} attach="material" />
          </mesh>
          {/* Concentric Electric Violet Ring */}
          <mesh position={[0, 0.076, 0]}>
            <torusGeometry args={[0.085, 0.016, 16, 28]} />
            <primitive object={materials.violetGlow} attach="material" />
          </mesh>
        </group>

        {/* Sleek Ergonomic Headband over helmet */}
        <mesh position={[0, 0.36, 0]} rotation={[0, 0, 0]}>
          <torusGeometry args={[0.53, 0.034, 16, 48, Math.PI * 0.84]} />
          <primitive object={materials.darkTrim} attach="material" />
        </mesh>

        {/* ======================================================================= */}
        {/* 4. ANTENNA WITH GLOWING BLUE TIP                                        */}
        {/* ======================================================================= */}
        <group position={[0, 0.54, 0]}>
          {/* Antenna Mounting Base */}
          <mesh>
            <cylinderGeometry args={[0.05, 0.07, 0.04, 24]} />
            <primitive object={materials.darkTrim} attach="material" />
          </mesh>
          {/* Tapered Stem */}
          <mesh position={[0, 0.08, 0]}>
            <cylinderGeometry args={[0.012, 0.02, 0.14, 16]} />
            <primitive object={materials.darkTrim} attach="material" />
          </mesh>
          {/* Glowing Beacon Sphere Tip */}
          <mesh ref={antennaLightRef} position={[0, 0.17, 0]}>
            <sphereGeometry args={[0.048, 24, 24]} />
            <primitive object={materials.cyanGlow} attach="material" />
          </mesh>
          {/* Subtle outer glow halo ring */}
          <mesh position={[0, 0.17, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.065, 0.008, 12, 24]} />
            <primitive object={materials.cyanGlow} attach="material" />
          </mesh>
        </group>
      </group>

      {/* ========================================================================= */}
      {/* 5. NECK CONNECTOR SWIVEL (SEAMLESS CONNECTION)                           */}
      {/* ========================================================================= */}
      <mesh position={[0, 0.14, 0]}>
        <cylinderGeometry args={[0.15, 0.18, 0.08, 28]} />
        <primitive object={materials.darkTrim} attach="material" />
      </mesh>

      {/* ========================================================================= */}
      {/* 6. COMPACT ROUNDED TORSO & CHEST REACTOR                                 */}
      {/* ========================================================================= */}
      <group position={[0, -0.16, 0]}>
        
        {/* Smooth pear-shaped torso body */}
        <mesh castShadow receiveShadow scale={[0.88, 0.94, 0.84]}>
          <sphereGeometry args={[0.44, 48, 48]} />
          <primitive object={materials.pearlBody} attach="material" />
        </mesh>

        {/* Circular Chest Reactor Housing */}
        <group position={[0, 0.04, 0.33]} rotation={[0.18, 0, 0]}>
          {/* Outer dark bezel ring */}
          <mesh>
            <cylinderGeometry args={[0.12, 0.13, 0.035, 32]} />
            <primitive object={materials.darkTrim} attach="material" />
          </mesh>
          {/* Glowing Cyan Circular Reactor Node */}
          <mesh ref={chestCoreRef} position={[0, 0.02, 0]}>
            <sphereGeometry args={[0.082, 24, 24]} />
            <primitive object={materials.cyanGlow} attach="material" />
          </mesh>
          {/* Surrounding concentric violet ring */}
          <mesh position={[0, 0.025, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.105, 0.012, 12, 32]} />
            <primitive object={materials.violetGlow} attach="material" />
          </mesh>
        </group>

        {/* Subtle ergonomic side rib accents */}
        <mesh position={[-0.34, -0.02, 0]} rotation={[0, 0, 0.25]}>
          <capsuleGeometry args={[0.035, 0.14, 12, 16]} />
          <primitive object={materials.darkTrim} attach="material" />
        </mesh>
        <mesh position={[0.34, -0.02, 0]} rotation={[0, 0, -0.25]}>
          <capsuleGeometry args={[0.035, 0.14, 12, 16]} />
          <primitive object={materials.darkTrim} attach="material" />
        </mesh>

        {/* Lower chassis / pelvic thruster base */}
        <group position={[0, -0.32, 0]}>
          <mesh>
            <cylinderGeometry args={[0.2, 0.14, 0.09, 32]} />
            <primitive object={materials.darkTrim} attach="material" />
          </mesh>
          {/* Thruster Blue Underglow Disc */}
          <mesh position={[0, -0.05, 0]}>
            <cylinderGeometry args={[0.11, 0.11, 0.02, 24]} />
            <primitive object={materials.cyanGlow} attach="material" />
          </mesh>
        </group>
      </group>

      {/* ========================================================================= */}
      {/* 7. ARTICULATED SHORT ROUNDED ARMS                                         */}
      {/* ========================================================================= */}
      
      {/* --- RIGHT ARM (FRIENDLY WAVING GESTURE) --- */}
      <group ref={rightArmGroup} position={[0.36, -0.02, 0]}>
        {/* Shoulder socket joint */}
        <mesh>
          <sphereGeometry args={[0.1, 24, 24]} />
          <primitive object={materials.darkTrim} attach="material" />
        </mesh>

        {/* Upper Arm Segment */}
        <mesh position={[0.12, 0.06, 0]} rotation={[0, 0, -0.7]}>
          <capsuleGeometry args={[0.065, 0.16, 16, 20]} />
          <primitive object={materials.pearlBody} attach="material" />
        </mesh>

        {/* Elbow & Forearm Group (Waves side to side) */}
        <group ref={rightForearmGroup} position={[0.24, 0.16, 0]}>
          {/* Elbow swivel */}
          <mesh>
            <sphereGeometry args={[0.07, 16, 16]} />
            <primitive object={materials.darkTrim} attach="material" />
          </mesh>

          {/* Forearm */}
          <mesh position={[0.06, 0.12, 0]} rotation={[0, 0, 0.35]}>
            <capsuleGeometry args={[0.06, 0.15, 16, 20]} />
            <primitive object={materials.pearlBody} attach="material" />
          </mesh>

          {/* Cute Rounded Mitten Hand */}
          <group position={[0.12, 0.24, 0]}>
            {/* Palm */}
            <mesh castShadow>
              <sphereGeometry args={[0.078, 20, 20]} />
              <primitive object={materials.pearlBody} attach="material" />
            </mesh>
            {/* Cute Thumb */}
            <mesh position={[-0.045, -0.01, 0.02]} rotation={[0, 0, -0.6]}>
              <capsuleGeometry args={[0.03, 0.06, 12, 12]} />
              <primitive object={materials.pearlBody} attach="material" />
            </mesh>
            {/* Glowing Cyan Palm Beacon */}
            <mesh position={[0, 0, 0.065]}>
              <circleGeometry args={[0.032, 16]} />
              <primitive object={materials.cyanGlow} attach="material" />
            </mesh>
          </group>
        </group>
      </group>

      {/* --- LEFT ARM (NATURAL GENTLE RESTING SWAY) --- */}
      <group ref={leftArmGroup} position={[-0.36, -0.02, 0]}>
        {/* Shoulder socket joint */}
        <mesh>
          <sphereGeometry args={[0.1, 24, 24]} />
          <primitive object={materials.darkTrim} attach="material" />
        </mesh>

        {/* Upper Arm Segment */}
        <mesh position={[-0.08, -0.1, 0]} rotation={[0, 0, 0.45]}>
          <capsuleGeometry args={[0.065, 0.16, 16, 20]} />
          <primitive object={materials.pearlBody} attach="material" />
        </mesh>

        {/* Forearm Segment */}
        <group position={[-0.15, -0.22, 0]}>
          <mesh>
            <sphereGeometry args={[0.068, 16, 16]} />
            <primitive object={materials.darkTrim} attach="material" />
          </mesh>
          <mesh position={[-0.04, -0.08, 0.02]} rotation={[0, 0, 0.2]}>
            <capsuleGeometry args={[0.06, 0.14, 16, 20]} />
            <primitive object={materials.pearlBody} attach="material" />
          </mesh>
          {/* Left Cute Mitten Hand */}
          <mesh position={[-0.06, -0.18, 0.03]}>
            <sphereGeometry args={[0.074, 20, 20]} />
            <primitive object={materials.pearlBody} attach="material" />
          </mesh>
        </group>
      </group>

      {/* ========================================================================= */}
      {/* 8. FLOATING HOLOGRAPHIC PEDESTAL (CONCENTRIC CYAN & VIOLET RINGS)         */}
      {/* ========================================================================= */}
      <group position={[0, -0.72, 0]}>
        
        {/* Base Obsidian Platform Disc */}
        <mesh receiveShadow position={[0, -0.04, 0]}>
          <cylinderGeometry args={[0.82, 0.9, 0.06, 48]} />
          <primitive object={materials.darkTrim} attach="material" />
        </mesh>

        {/* Inner Glowing Core Disc */}
        <mesh position={[0, -0.005, 0]}>
          <cylinderGeometry args={[0.45, 0.45, 0.02, 36]} />
          <meshStandardMaterial
            color="#082f49"
            emissive="#0284c7"
            emissiveIntensity={0.8}
            roughness={0.2}
          />
        </mesh>

        {/* Rotating Concentric Rings */}
        <group ref={pedestalGroup}>
          
          {/* Outer Cyan Ring */}
          <mesh ref={outerRingRef} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.76, 0.02, 16, 64]} />
            <primitive object={materials.cyanGlow} attach="material" />
          </mesh>

          {/* Middle Violet Ring */}
          <mesh rotation={[Math.PI / 2, 0, 0.7]}>
            <torusGeometry args={[0.58, 0.016, 16, 48]} />
            <primitive object={materials.violetGlow} attach="material" />
          </mesh>

          {/* Inner Cyan Ring */}
          <mesh ref={innerRingRef} rotation={[Math.PI / 2, 0, 1.4]}>
            <torusGeometry args={[0.38, 0.014, 16, 36]} />
            <primitive object={materials.cyanGlow} attach="material" />
          </mesh>

          {/* Holographic Projection Orbiting Accent Pips */}
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const angle = (i / 6) * Math.PI * 2;
            return (
              <mesh
                key={i}
                position={[Math.cos(angle) * 0.68, 0.02, Math.sin(angle) * 0.68]}
              >
                <sphereGeometry args={[0.018, 12, 12]} />
                <primitive object={materials.cyanGlow} attach="material" />
              </mesh>
            );
          })}
        </group>
      </group>
    </group>
  );
}

/**
 * Lightweight SVG/CSS Fallback for non-WebGL devices
 */
function RobotFallback() {
  return (
    <div className="relative w-full h-full flex items-center justify-center select-none pointer-events-none">
      <div className="relative w-72 h-80 flex flex-col items-center justify-center animate-bounce-gentle">
        {/* Holographic Aura */}
        <div className="absolute w-60 h-60 rounded-full bg-gradient-to-tr from-cyan-500/25 via-indigo-600/25 to-purple-500/25 blur-3xl animate-pulse" />
        
        {/* Antenna */}
        <div className="relative flex flex-col items-center z-10 -mb-1">
          <div className="w-3.5 h-3.5 rounded-full bg-cyan-400 shadow-[0_0_15px_#38bdf8] animate-ping" />
          <div className="w-1 h-3 bg-slate-700 rounded-full -mt-1" />
        </div>

        {/* Head */}
        <div className="relative w-44 h-36 rounded-[40px] bg-gradient-to-b from-white via-slate-100 to-slate-200 shadow-2xl flex items-center justify-center border border-white/60 z-10">
          {/* Headphones */}
          <div className="absolute -left-4 w-6 h-16 rounded-full bg-slate-900 border-2 border-cyan-400 shadow-[0_0_15px_#38bdf8] flex items-center justify-center">
            <div className="w-2.5 h-8 rounded-full border border-purple-400" />
          </div>
          <div className="absolute -right-4 w-6 h-16 rounded-full bg-slate-900 border-2 border-cyan-400 shadow-[0_0_15px_#38bdf8] flex items-center justify-center">
            <div className="w-2.5 h-8 rounded-full border border-purple-400" />
          </div>

          {/* Curved Glossy Visor */}
          <div className="w-32 h-24 rounded-[30px] bg-slate-950 flex flex-col items-center justify-center gap-2 shadow-[inset_0_2px_8px_rgba(255,255,255,0.2)] border border-slate-800">
            {/* Expressive Smiling Eyes */}
            <div className="flex gap-5">
              <div className="w-5 h-3.5 border-t-4 border-cyan-400 rounded-t-full shadow-[0_0_10px_#38bdf8]" />
              <div className="w-5 h-3.5 border-t-4 border-cyan-400 rounded-t-full shadow-[0_0_10px_#38bdf8]" />
            </div>
            {/* Smile */}
            <div className="w-4 h-2 border-b-2 border-cyan-400 rounded-b-full shadow-[0_0_8px_#38bdf8]" />
          </div>
        </div>

        {/* Torso */}
        <div className="relative -mt-3 w-32 h-26 rounded-[32px] bg-gradient-to-b from-white to-slate-300 shadow-xl flex items-center justify-center border border-white/40 z-0">
          <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center border border-cyan-400 shadow-[0_0_16px_#38bdf8]">
            <div className="w-4 h-4 rounded-full bg-cyan-400 animate-ping" />
          </div>
        </div>

        {/* Holographic Pedestal */}
        <div className="mt-4 w-52 h-7 rounded-full border-2 border-cyan-400/80 bg-indigo-950/40 blur-[1px] shadow-[0_0_25px_rgba(56,189,248,0.6)] flex items-center justify-center">
          <div className="w-36 h-3 rounded-full border border-purple-400/80" />
        </div>
      </div>
    </div>
  );
}

/**
 * Full 3D Robot Scene Canvas with Cinematic Cyan-Violet Rim Lighting
 */
export default function Robot3D({
  pose = 'hero',
  className = 'w-full h-full min-h-[380px]',
  interactive = true,
  showSparkles = true
}) {
  const [hasWebGL, setHasWebGL] = useState(true);

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        setHasWebGL(false);
      }
    } catch {
      setHasWebGL(false);
    }
  }, []);

  if (!hasWebGL) {
    return (
      <div className={className}>
        <RobotFallback />
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <Suspense fallback={<RobotFallback />}>
        <Canvas
          camera={{ position: [0, 0.28, 3.4], fov: 44 }}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance',
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.15
          }}
          className="w-full h-full"
        >
          {/* =============================================================== */}
          {/* CINEMATIC CYAN-VIOLET RIM LIGHTING SETUP                        */}
          {/* =============================================================== */}
          {/* Soft ambient base fill */}
          <ambientLight intensity={1.1} />

          {/* Crisp key light from front-top */}
          <directionalLight
            position={[2.5, 4.5, 3.5]}
            intensity={2.4}
            color="#ffffff"
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
          />

          {/* Powerful Violet Rim Light from back-left */}
          <pointLight
            position={[-3.5, 2.5, -2.5]}
            intensity={3.2}
            color="#a855f7"
          />

          {/* Powerful Electric Cyan Rim Light from back-right */}
          <pointLight
            position={[3.5, 2.0, -2.0]}
            intensity={3.5}
            color="#38bdf8"
          />

          {/* Bottom Holographic Platform Up-Light (Soft Cyan Glow onto Body) */}
          <pointLight
            position={[0, -0.7, 0.6]}
            intensity={2.8}
            color="#00f2fe"
            distance={4.5}
          />

          {/* Front Soft Fill for Visor Reflections */}
          <pointLight
            position={[0, 0.8, 2.8]}
            intensity={1.2}
            color="#e0f2fe"
          />

          {/* Robot Mascot Model */}
          <Float speed={1.8} rotationIntensity={0.15} floatIntensity={0.35}>
            <RobotModel pose={pose} interactive={interactive} />
          </Float>

          {/* Floating Starlight Sparkles */}
          {showSparkles && (
            <Sparkles
              count={28}
              scale={3.6}
              size={2.8}
              speed={0.35}
              opacity={0.55}
              color="#38bdf8"
            />
          )}

          {/* Soft Floor Shadow beneath Pedestal */}
          <ContactShadows
            position={[0, -0.84, 0]}
            opacity={0.65}
            scale={4.2}
            blur={2.8}
            far={2.5}
            color="#020617"
          />
        </Canvas>
      </Suspense>
    </div>
  );
}
