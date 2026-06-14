import React from 'react';

"use client";

import { useRef, useEffect } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { FlyControls } from "@react-three/drei";
import { DeviceOrientationControls } from "@react-three/drei";
import { PerspectiveCamera } from "@react-three/drei";
import { Environment, useCubeTexture } from "@react-three/drei";
import { FirstPersonControls } from "@react-three/drei";
// import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { Mesh } from "three";
import AtwBox from "./OriginAxisDisplay";
import { CameraWalker } from "./CameraWalker";
import { TextureLoader, BackSide } from "three"
import { useTexture, useGLTF } from "@react-three/drei";
import * as oct from "../knotfree-ts-lib/3d/UrlOctTree"

import { Text } from '@react-three/drei';

// import { useTexture, useGLTF } from '@react-three/drei';


import Grid from "./Grid"

// import { Perf } from "r3f-perf" //  has error ./node_modules/r3f-perf/node_modules/three-mesh-bvh/src/utils/ExtensionUtilities.js Attempted import error: 'BatchedMesh' is not exported from 'three' (imported as 'THREE'). 
// import  { Stats }  from "three/examples/jsm/libs/stats.module.js"
// import { Stats } from "https://cdn.skypack.dev/@react-three/drei/Stats";

import { Stats } from "@react-three/drei/core/Stats"

// the origin is actually right in the middle of the dogs head.
export function DrawDogComponent(props: { cube: oct.Cube }) {

  const { scene } = useGLTF("/shiba/scene.gltf");

  // const fileUrl = "/shiba/scene.gltf";
  // const mesh = useRef<Mesh>(null!); // what is this for?

  // const gltf = useLoader(GLTFLoader, fileUrl);

  // const { scene } = useGLTF('fileUrl');

  // console.log('loaded gltf mesh', gltf);
  const size = 2 ** props.cube.p
  console.log('cube size', size)
  const xpos = props.cube.x + size / 2
  const ypos = props.cube.y + size / 2

  const zpos = props.cube.z + size / 2 + size * .25
  return (<>
    {/* <mesh ref={mesh} rotation-x={Math.PI * 0.00} position={[xpos, ypos, zpos]} scale={size * .5}>
      <primitive object={gltf.scene} />
    </mesh> */}

    <mesh rotation-x={Math.PI * 0.00} position={[xpos, ypos, zpos]} scale={size * .5}>
      <primitive object={scene} />
    </mesh>


    {/* <primitive object={scene} /> */}

    <Text position={[xpos, props.cube.y + size * .8, zpos]} fontSize={1.5} color="purple">Big Dog Models</Text>
  </>
  );
}

//      <Text position={[0, 0, 2.5]} fontSize={.5} color="red">E</Text>


// unused 
export function Shiba() {

  // const cubeTexture = useCubeTexture([
  //   'stars.jpeg', 'stars.jpeg', // Positive and negative X faces
  //   'stars.jpeg', 'stars.jpeg', // Positive and negative Y faces
  //   'stars.jpeg', 'stars.jpeg', // Positive and negative Z faces
  // ], { path: 'starmaps/' }); 

  // console.log('loaded cubeTexture', cubeTexture);

  // const ppp = "/starmaps/stars.jpeg"

  // const texture = useLoader(TextureLoader, ppp) //textureImage)

  return (
    <div className='flex justify-center items-center h-screen'>

      <Canvas className='h-2xl w-2xl'
        camera={{ position: [0, 1.75, 4] }}>

        {/* <ambientLight /> */}
        <directionalLight
          position={[3.3, 1.0, -4.4]}
          intensity={Math.PI * 2}
        />
        <directionalLight
          position={[-3.3, -1.0, 4.4]}
          intensity={Math.PI * 1.0}
        />

        {/* <pointLight position={[10, 10, 10]} />   castShadow     */}

        {/* <Environment map={texture} /> doesn't work */}

        {/* <Perf /> */}

        <CameraWalker />

        {/* <Grid size={10} /> */}

        <AtwBox />

        {/* One Meter Cube */}
        <DrawDogComponent cube={{ x: 0, y: 3, z: 0, p: 0, world: "testmain" }} />

        <Stats showPanel={0} />

      </Canvas>

    </div>
  );
}
