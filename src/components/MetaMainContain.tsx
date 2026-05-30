import React from 'react';
'use client';

import { useRef, useState } from "react";
import { Box, useFBO } from "@react-three/drei"

import { useLoader, useThree, useFrame , createPortal} from "@react-three/fiber"

import { TextureLoader, BackSide, Mesh } from "three"
// import { Frame2GlMap } from './IFrameTest'

import * as THREE from 'three';

import * as frameUtils from './IFrameUtils'
import { ShowFrameList } from './MainShowFrames'
import { mat4 } from 'three/examples/jsm/nodes/Nodes.js';


// This is the parent, not the iFrame children - are in a spearate project

export const MetaMainContain: React.FC = () => {

  const cameraRef = useRef()
  const camera = useThree(state => state.camera) //cameraRef.current; 

  console.log("MetaMainContain camera ", camera)
  console.log("MetaMainContain camera ", camera.rotation, camera.position, camera.matrixWorldInverse, camera.projectionMatrix, camera.projectionMatrixInverse)
  // near, far matrix, position, rotation, fov, aspect ratio
  // matrix , matricWorldInverse, projectionMatrix, projectionMatrixInverse, position, rotation, fov, aspect

  const meshref = useRef<THREE.Mesh>(null)
  // const renderTarget = useFBO()

  // useFrame((state, delta) => {    
  //   // console.log('Box rendered ')
  // })

  const thick = .01
  return (
    <>

      {/* <RotatingBoxGreen /> */}

      {/* <mesh ref={meshref} scale={1} position={[2, 0, 0]} >
        <planeGeometry args={[2, 2]} />
        <meshBasicMaterial  />
      </mesh>

      <Box args={[8, 8, 8]} position={[20, 4, 20]}>
        <meshStandardMaterial color="grey" />
      </Box> */}

      {/* <TexturedBox/> not working */}

      {/* <Box args={[1, 1, 1]}>
        <meshStandardMaterial color="hotpink" />
      </Box> */}

        {/* stupid axis display */}
      <Box args={[4, thick, thick]}>
        <meshStandardMaterial color="red" />
      </Box>
      <Box args={[thick, 4, thick]}>
        <meshStandardMaterial color="green" />
      </Box>
      <Box args={[thick, thick, 4]}>
        <meshStandardMaterial color="blue" />
      </Box>

      <ShowFrameList/> 

      {/* Green square facing camera near far clip plane matrix={camera.matrixWorldInverse} */}
      {/* <mesh position={camera.position.sub(new THREE.Vector3(0, 0, camera.far - 0.1))}  >
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial color="green" />
      </mesh> */}

    </>
  )
}

var count333 = 0

// window.onmessage = function (event) {
//   if (event.data == "message") {
//     console.log(" window.onmessage Message received!");
//   }
// };

function processMessageFromFrame (/*this: Window,*/ evt: MessageEvent<any>) {

  if ( evt.data as frameUtils.LoadedMessageFromChild ){
    let msg = evt.data as frameUtils.LoadedMessageFromChild // this doesn't work. It passes everyting
    if ( msg.type === "LoadedMessageFromChild") {
      console.log("MetaMain got LoadedMessageFromChild ", msg)
    } else {
      // console.log("MetaMain got unknown LoadedMessageFromChild type ", msg.type, msg)
    }
  } else {
    // console.log("MetaMain message unknown ")
  }

	// var message;
	// // if (evt.origin !== "https://robertnyman.com") {
	// // 	message = "You are not worthy";
	// // }
	// // else {
	// 	message =  evt.data + " from " + evt.origin;
	// // }
	// // document.getElementById("received-message").innerHTML = message;
  // console.log("MetaMain got a message ", message, evt)
}

if (window.addEventListener) {
	// For standards-compliant web browsers
	window.addEventListener("message", processMessageFromFrame, false);
}
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

export default MetaMainContain

