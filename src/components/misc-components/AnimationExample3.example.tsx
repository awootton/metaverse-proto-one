

import React, { useRef, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
// import { GLTFExporter } from 'three-stdlib'
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter';
import { useFrame } from "@react-three/fiber";


// converted from js by atw

function SceneComponent() {
    const groupRef = useRef<THREE.Group>(null);
    const cubeToRotateRef = useRef<THREE.Mesh>(null);

    useFrame((_, delta) => {
        if (cubeToRotateRef.current) {
            cubeToRotateRef.current.rotation.y += delta;
        }
    });

    useEffect(() => {
        // 1. Give the target mesh a name so the keyframe track binds correctly
        // cubeToRotateRef.current.name = 'RotatingCube'
        // if (cubeToRotateRef.current) {
        //   cubeToRotateRef.current.rotation.y += delta;


        // 2. Build keyframe data (rotating 360 degrees on Y axis over 2 seconds)
        const times = [0, 2]
        const qInitial = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), 0)
        const qFinal = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI * 2)

        const quaternionTrack = new THREE.QuaternionKeyframeTrack(
            'RotatingCube.quaternion',
            times,
            [qInitial.x, qInitial.y, qInitial.z, qInitial.w, qFinal.x, qFinal.y, qFinal.z, qFinal.w]
        )

        const clip = new THREE.AnimationClip('SpinAction', 2, [quaternionTrack])

        // 3. Export the group containing both cubes with the animation options
        const exporter = new GLTFExporter()
        if (!groupRef.current)
            return;

        exporter.parse(
            groupRef.current,
            (gltf) => {
                const blob = new Blob([gltf as ArrayBuffer], { type: 'application/octet-stream' })
                const link = document.createElement('a')
                link.href = URL.createObjectURL(blob)
                link.download = 'animated-cubes.glb'
                link.click()
            },
            (error) => console.error('An error occurred:', error),
            { binary: true, animations: [clip] }
            //   { binary: true, animations: [clip] }
        )
    }, [])

    return (
        <group ref={groupRef} scale={10}>
            {/* Static Cube */}
            <mesh position={[-1.5, 0, 0]}>
                <boxGeometry />
                <meshBasicMaterial color="orange" />
            </mesh>

            {/* Rotating Cube to be Exported */}
            <mesh ref={cubeToRotateRef} position={[1.5, 0, 0]}>
                <boxGeometry />
                <meshBasicMaterial color="blue" />
            </mesh>
        </group>
    )
}

export   function AnimationExample1() {
    return (
        <Canvas>
            <ambientLight />
            <SceneComponent />
        </Canvas>
    )
}
