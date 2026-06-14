import React from 'react';
'use client';

import { useRef, useState } from "react";
import { Box, useFBO } from "@react-three/drei"

import { useLoader, useThree, useFrame, createPortal } from "@react-three/fiber"

import { TextureLoader, BackSide, Mesh } from "three"
// import { Frame2GlMap } from './IFrameTest'

import * as THREE from 'three';

import * as frameUtils from './IFrameUtils'
import { ShowFrameList } from './MainShowFrames'
import { mat4 } from 'three/examples/jsm/nodes/Nodes.js';

import { Text, Billboard } from '@react-three/drei';
import { text } from 'stream/consumers';

interface BillboardTextProps {
  text: string
  color: string
  size: number
  position: [number, number, number]
}
export const BillboardText: React.FC<BillboardTextProps> = (props: BillboardTextProps) => {
  return (
    <Billboard
      follow={true}
      lockX={false}
      lockY={false}
      lockZ={false}
      position={props.position}
    >
      <Text
        fontSize={props.size}
        color={props.color}
        anchorX="center"
        anchorY="middle"
      >
        {props.text}
      </Text>
    </Billboard>
  )
}

// rename this. It's just the Axis draw.

// This is the parent, not the iFrame children - are in a spearate project

export const OriginAxisDisplay: React.FC = () => {

  const cameraRef = useRef()
  const camera = useThree(state => state.camera) //cameraRef.current; 

  // console.log("OriginAxisDisplay camera ", camera)
  // console.log("OriginAxisDisplay camera ", camera.rotation, camera.position, camera.matrixWorldInverse, camera.projectionMatrix, camera.projectionMatrixInverse)
  // near, far matrix, position, rotation, fov, aspect ratio
  // matrix , matricWorldInverse, projectionMatrix, projectionMatrixInverse, position, rotation, fov, aspect

  const meshref = useRef<THREE.Mesh>(null)
  // const renderTarget = useFBO()

  // useFrame((state, delta) => {    
  //   // console.log('Box rendered ')
  // })

  const thick = .25
  return (
    <>

      <group rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} >
        {/* <BillboardText text={"Origin"} color="lightgray" size={25} position={[0, -.1, 0]} /> */}
        <Text
          fontSize={25}
          color="lightgray"
          anchorX="center"
          anchorY="middle"
        >
          {"Origin"}
        </Text>
      </group>

      {/* stupid axis display */}
      <Box args={[8, thick, thick]} position={[4, 0, 0]}>
        <meshStandardMaterial color="red" />
      </Box>
      <Box args={[thick, 4, thick]} position={[0, 2, 0]}>
        <meshStandardMaterial color="green" />
      </Box>
      <Box args={[thick, thick, 4]} position={[0, 0, 2]}>
        <meshStandardMaterial color="blue" />
      </Box>

      {/* add N, E and Up labels to the ends of the axes */}
      <BillboardText text={"E"} color="red" size={0.5} position={[0, 0, 5]} />
      <BillboardText text={"N"} color="green" size={1.0} position={[8.5, 0, 0]} />
      <BillboardText text={"Up"} color="blue" size={0.5} position={[0, 5, 0]} />

      {/* Green square facing camera near far clip plane matrix={camera.matrixWorldInverse} */}
      {/* <mesh position={camera.position.sub(new THREE.Vector3(0, 0, camera.far - 0.1))}  >
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial color="green" />
      </mesh> */}

    </>
  )
}

// function processMessageFromFrame(/*this: Window,*/ evt: MessageEvent<any>) {

//   if (evt.data as frameUtils.LoadedMessageFromChild) {
//     let msg = evt.data as frameUtils.LoadedMessageFromChild // this doesn't work. It passes everyting
//     if (msg.type === "LoadedMessageFromChild") {
//       console.log("MetaMain got LoadedMessageFromChild ", msg)
//     } else {
//       // console.log("MetaMain got unknown LoadedMessageFromChild type ", msg.type, msg)
//     }
//   } else {
//     // console.log("MetaMain message unknown ")
//   }

//   // var message;
//   // // if (evt.origin !== "https://robertnyman.com") {
//   // // 	message = "You are not worthy";
//   // // }
//   // // else {
//   // 	message =  evt.data + " from " + evt.origin;
//   // // }
//   // // document.getElementById("received-message").innerHTML = message;
//   // console.log("MetaMain got a message ", message, evt)
// }

// if (window.addEventListener) {
//   // For standards-compliant web browsers
//   window.addEventListener("message", processMessageFromFrame, false);
// }
// else {
// 	window.attachEvent("onmessage", displayMessage);
// }

// export function TexturedBox() {

//   const ppp = "/starmaps/stars.jpeg"

//   const texture = useLoader(TextureLoader, ppp) //textureImage)

//   return (
//     <mesh>
//       {/* <boxBufferGeometry args={[999, 999, 999]} /> */}
//       <Box args={[999, 999, 999]} />
//       <meshStandardMaterial map={texture} side={BackSide} />
//     </mesh>
//   );
// }

export default OriginAxisDisplay
