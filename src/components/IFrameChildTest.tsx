import React, { useEffect } from 'react';
'use client';

import { useRef } from "react";
import { useFrame, useLoader, useThree } from "@react-three/fiber"

import { MyIframe } from './IFrameUtils';

// import { extend } from '@react-three/fiber'

// unused?
// export type glSetterFunc = (gl: THREE.WebGLRenderer, target: THREE.WebGLRenderTarget) => void

// type glType = {
//     setglfunc: glSetterFunc | undefined,
//     name: string
//     scene: THREE.Scene | undefined
// }

// export const Frame2GlMap = new Map<string, glType>()

function gotMessage (/*this: Window,*/ evt: MessageEvent<any>) {
	var str = "child iframe got a message" + evt.data + " from " + evt.origin;
  // console.log("child gotMessage ", str, evt)
}

// this is what all the children MUST implement
if (window.addEventListener) {
	// For standards-compliant web browsers
	window.addEventListener("message", gotMessage, false);
}


export const LoadSomeFramesTest: React.FC = () => {

    return (
        <>
        <MyIframe name="my-iframe" target="http://localhost:3010/?offscreen-canvas-demo=one" />
        <MyIframe name="my-iframe2" target="http://knotfree.com:3010/?offscreen-canvas-demo=two" />

            {/* <iframe src="http://localhost:3000/?domain=one" id="my-iframe" width={100} height={100}
                onLoad={loaded} sandbox="allow-scripts allow-popups" ></iframe>

            <iframe src="http://knotfree.com:3000/?domain=two" id="my-iframe2" width={100} height={100}
                onLoad={loaded} sandbox="allow-scripts allow-popups" ></iframe> */}
        </>
    )

}  // ref={setRef}

// extend({ iframe })
