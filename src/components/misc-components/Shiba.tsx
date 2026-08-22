import React from 'react';

"use client";

import { Canvas, useFrame, useLoader } from "@react-three/fiber";
// import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import AtwBox from "./../OriginAxisDisplay";
import { CameraWalker } from "./CameraWalker";
import { useTexture, useGLTF } from "@react-three/drei";
import * as oct from "../../knotfree-ts-lib/3d/Dns8Tree"

import { Text } from '@react-three/drei';
import { Stats } from 'fs';

// import { useTexture, useGLTF } from '@react-three/drei';

// import Grid from "./misc-components/Grid"

// import { Perf } from "r3f-perf" //  has error ./node_modules/r3f-perf/node_modules/three-mesh-bvh/src/utils/ExtensionUtilities.js Attempted import error: 'BatchedMesh' is not exported from 'three' (imported as 'THREE'). 
// import  { Stats }  from "three/examples/jsm/libs/stats.module.js"
// import { Stats } from "https://cdn.skypack.dev/@react-three/drei/Stats";

// this would be nice if we weren't having problems. -->> import { Stats } from "@react-three/drei/core/Stats"

// the origin is actually right in the middle of the dogs head.
export function DrawDogComponent(props: { cube: oct.Cube }) {

  const { scene } = useGLTF("/shiba/scene.gltf");

  // const fileUrl = "/shiba/scene.gltf";
  // const mesh = useRef<Mesh>(null!); // what is this for?

  // const gltf = useLoader(GLTFLoader, fileUrl);

  // const { scene } = useGLTF('fileUrl');

  // console.log('loaded gltf mesh', gltf);
  const size = 2 ** props.cube.p
  console.log('DrawDogComponent cube size', size)
  const xpos = props.cube.x + size / 2
  const ypos = props.cube.y + size / 2

  const zpos = props.cube.z + size / 2 + size * .25
  const FONT_URL = '/fonts/Inter_18pt-Bold.ttf'

  return (<>
    {/* <mesh ref={mesh} rotation-x={Math.PI * 0.00} position={[xpos, ypos, zpos]} scale={size * .5}>
      <primitive object={gltf.scene} />
    </mesh> */}

    <mesh rotation-x={Math.PI * 0.00} position={[xpos, ypos, zpos]} scale={size * .5}>
      <primitive object={scene} />
    </mesh>

  </>
  );
}

// just after last mesh. 
//     <Text position={[xpos, props.cube.y + size * .8, props.cube.z + size / 2 + size / 4]} fontSize={1.5} font={FONT_URL} color="purple">Big Dog Models</Text>

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


      </Canvas>

    </div>
  );
}

        // <Stats showPanel={0} />



// shiba gltf does not belong to me.

// Copyright 2026 Alan Tracey Wootton
// See LICENSE
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.
