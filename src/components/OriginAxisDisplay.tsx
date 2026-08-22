
import * as THREE from 'three';

import { useRef } from "react";
import { Box, useGLTF } from "@react-three/drei"

import { useLoader, useThree, useFrame, createPortal } from "@react-three/fiber"

import { TextureLoader, BackSide, Mesh } from "three"
// import { Frame2GlMap } from './IFrameTest'


import { mat4 } from 'three/examples/jsm/nodes/Nodes.js';

import { Text, Billboard } from '@react-three/drei';
import { text } from 'stream/consumers';
import React from 'react';

// import { Text3D, Center } from '@react-three/drei'

// TODO: add the labels back.

// adding this makes veverything go WHITE. Juat watch the compass if ypu're lost. 
// just this one line trshes everything. I got it from grok.com. 
// it looks fine in preview.app here.

// const { scene } = useGLTF("/letter_N.glb");
// this washed one is not better at all. const { scene } = useGLTF("/ImageToStl.com_letter_N.glb");



interface BillboardTextProps {
  text: string
  color: string
  size: number
  position: [number, number, number]
}

// What's another way. My font engine has gone insane. 
// export const XXXBillboardText: React.FC<BillboardTextProps> = (props: BillboardTextProps) => {
//   return (
//     <Billboard
//       follow={true}
//       lockX={false}
//       lockY={false}
//       lockZ={false}
//       position={props.position}
//     >
//       <Text
//         fontSize={props.size}
//         color={props.color}
//         anchorX="center"
//         anchorY="middle"
//       >
//         {props.text}
//       </Text>
//     </Billboard>
//   )
// }

// rename this. It's just the Axis draw.

// This is the parent, not the iFrame children - are in a spearate project

// FIXME: add the labels back that are not full of errors. The font engine is broken..

export const OriginAxisDisplay: React.FC = () => {

  const cameraRef = useRef()
  const camera = useThree(state => state.camera) //cameraRef.current; 

  // console.log("OriginAxisDisplay camera ", camera)
  // console.log("OriginAxisDisplay camera ", camera.rotation, camera.position, camera.matrixWorldInverse, camera.projectionMatrix, camera.projectionMatrixInverse)
  // near, far matrix, position, rotation, fov, aspect ratio
  // matrix , matricWorldInverse, projectionMatrix, projectionMatrixInverse, position, rotation, fov, aspect

  // const meshref = useRef<THREE.Mesh>(null)
  // const renderTarget = useFBO()

  // useFrame((state, delta) => {    
  //   // console.log('Box rendered ')
  // })

  const xpos = 0
  const ypos = 0
  const zpos = 0
  const size = 1

  {/* <mesh rotation-x={Math.PI * 0.00} position={[xpos, ypos, zpos]} scale={size * .5}>
        <primitive object={scene} color="red" />
      </mesh>
 */}


  const radius = .8
  const thick = .25
  // {/* radiusTop, radiusBottom, height, radialSegments */}
  return (
    <>

      <mesh position={[8, 0, 0]} rotation={[0, 0,  Math.PI / 2 ]} >
        <cylinderGeometry args={[.5, 0, 3, 6]} />
        <meshStandardMaterial color="red" />
      </mesh >

      <Box args={[8, thick, thick]} position={[4, 0, 0]}>
        <meshStandardMaterial color="red" />
      </Box>
      <Box args={[thick, 4, thick]} position={[0, 2, 0]}>
        <meshStandardMaterial color="green" />
      </Box>
      <Box args={[thick, thick, 4]} position={[0, 0, 2]}>
        <meshStandardMaterial color="blue" />
      </Box>
    </>
  )
}

{/* add N, E and Up labels to the ends of the axes */ }
{/* <BillboardText text={"E"} color="red" size={0.5} position={[0, 0, 5]} />
      <BillboardText text={"N"} color="green" size={1.0} position={[8.5, 0, 0]} />
      <BillboardText text={"Up"} color="blue" size={0.5} position={[0, 5, 0]} /> */}

{/* <mesh position={[8.5, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}
        >
        <Text3D font="/fonts/helvetiker_regular.typeface.json" size={2} height={0.5} curveSegments={12}>
          N
          <meshStandardMaterial color="red" />
        </Text3D>
      </mesh> */}

{/* Green square facing camera near far clip plane matrix={camera.matrixWorldInverse} */ }
{/* <mesh position={camera.position.sub(new THREE.Vector3(0, 0, camera.far - 0.1))}  >
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial color="green" />
      </mesh> */}


// as seen from space
// <group rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.15, 0]} >
//   {/* <BillboardText text={"Origin"} color="lightgray" size={25} position={[0, -.1, 0]} /> */}
//   <Text
//     fontSize={25}
//     color="lightgray"
//     anchorX="center"
//     anchorY="middle"
//   >
//     {"Origin"}
//   </Text>
// </group>


// function LetterN() {
//   return (
//     <Center>
//       <Text3D font="/fonts/helvetiker_regular.typeface.json" size={2} height={0.5} curveSegments={12}>
//         N
//         <meshStandardMaterial color="orange" />
//       </Text3D>
//     </Center>
//   )
// }

export default OriginAxisDisplay

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
