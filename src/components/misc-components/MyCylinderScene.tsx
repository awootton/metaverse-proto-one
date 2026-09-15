 
import { CylinderGeometry, Group } from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import React, { useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';

import { useFrame } from "@react-three/fiber";

import * as sub from "../../knotfree-ts-lib/avatars/PubSubSimple"


export const NestedFlowerPots = () => {

    const cubeRef = useRef<THREE.Mesh>(null);
    const groupRef = useRef<Group>(null);

    useEffect(() => {
      // This effect runs once when the component mounts
      // handleDownload()

    }, []);

    // useFrame(() => {
    //   const cube = cubeRef.current;
    //   if (!cube) return;
    //   cube.rotation.x += 0.01;
    //   cube.rotation.y += 0.01;
    //   cube.scale.set(1, 1, 1);
    // });

    const handleDownload = async () => {
      try {
        const blob = await exportGroupToBlob(groupRef);

        // Preview says it's right. 
        // can we stash it some place else?

        // Create a temporary URL and trigger a download
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = './FlowerPotsPublished.glb';
        link.click();

        URL.revokeObjectURL(url); // Clean up
      } catch (error) {
        console.error('Failed to export GLB:', error);
      }
    };

    useEffect(() => {
      // This effect runs once when the component mounts
     // put on pubsub I think. handleDownload()
      
        sub.subscribe("downloadFlowerPotsDemo", (noarg:String,noerr:(Error|null)) => {
            // has no arg
            // we should make the blob and then send it elsewhere where were someone else can try to convert it and 
            // draw it.
          handleDownload();
        });


    }, []);


//     radiusTop
//     radiusBottom	
// height	
// radialSegments	
// heightSegments	
// openEnded

    return (
      <>
        <group ref={groupRef}>
          <directionalLight position={[0, -.125, 1]} intensity={0.8} />
          <mesh position={[0, -.25, 0]}>
            <cylinderGeometry args={[.25, .125, .5, 24]} />
            <meshStandardMaterial color="orange" />
          </mesh>
          <mesh ref={cubeRef} position={[0, 0, 0]}>
            <cylinderGeometry args={[.25, .125, .5, 24]} />
            <meshStandardMaterial color="hotpink" />
          </mesh>
          <mesh position={[0, .25, 0]}>
            <cylinderGeometry args={[.25, .125, .5, 24]} />
            <meshStandardMaterial color="teal" />
          </mesh>
        </group>

      </>
    );
  };

const exportGroupToBlob = (groupRef: React.RefObject<Group | null>): Promise<Blob> => {

  return new Promise((resolve, reject) => {
    if (!groupRef.current) {
      reject(new Error("Group reference is not attached."));
      return;
    }

    const exporter = new GLTFExporter();
    exporter.parse(
      groupRef.current,
      (gltf) => {
        // Create a binary Blob if gltf is an ArrayBuffer (binary GLB)
        const blob = new Blob([gltf as ArrayBuffer], { type: 'model/gltf-binary' });
        resolve(blob);
      },
      (error) => {
        reject(error);
      },
      { binary: true }
    );
  });
};


export function CylinderCanvas() {


  return (
    <div
      className="App"
      style={{
        height: "100vh",
        width: "100vw"
      }}
    >
      <Canvas
        id="canvas"
        camera={{
          near: 0.1,
          far: 1000,
          zoom: 1,
          position: [0, 1.75, 25]
        }}
      >
        <NestedFlowerPots />

      </Canvas>

    </div>
  );

    //     <button onClick={() => CylinderScene.handleDownload()} style={{ position: 'absolute', top: 20, left: 20 }}>
    //     Export GLB
    //   </button>


}

