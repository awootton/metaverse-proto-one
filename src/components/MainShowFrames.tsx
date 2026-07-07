import React from 'react'

import * as pubsub from './PubSubSimple'
import * as  iutil from './IFrameUtils'
import { useFrame,useThree } from '@react-three/fiber'
// import { useFBO } from '@react-three/drei'

// import { extend } from '@react-three/fiber'
// import { Canvas } from '@react-three/fiber'; // Or your scene component
// extend({ Canvas })

// we can't add to the DOM when in the react3 render loop 
// this is crap. we need to have a way to add frames to the scene, and then have the react3 render loop render those frames.

export const ShowFrameList: React.FC = () => {

    const [unique, setUnique] = React.useState<string>(Math.random().toString())

    const [frames, setFrames] = React.useState<Array<HTMLIFrameElement>>(iutil.GetMapEntries())

    // const renderTarget = useFBO()

    // see https://github.com/F-loat/offscreen-canvas-demo

    const { gl } = useThree()

    // const canvasRef = React.useRef<HTMLCanvasElement>(null);


    // useFrame((state) => {
    //     const { gl, scene, camera } = state;

    //     const canvas = gl.domElement as HTMLCanvasElement;
    //     // gl.setRenderTarget(renderTarget); // Direct rendering to the renderTarget
    //     // gl.render(scene, camera);
    //     // gl.setRenderTarget(null); // Reset to render to the screen
    // });

    const handleMapChange = (obj: Object, err: string) => {
        // the object is a list of HTMLIFrameElement
        const frames = Array.from(obj as Array<HTMLIFrameElement>) // obj as Array<HTMLIFrameElement>
        console.log("ShowFrameList handleMapChange", frames)
        setFrames(frames)
    }

    React.useEffect(() => {

        // subscribe to changes in the frame map
        //pubsub.subscribe("frameMapChange", unique, handleMapChange)
        pubsub.subscribe("frameMapChange", handleMapChange)
        console.log("ShowFrameList useEffect subscribed to frameMapChange")

        // const canvas = document.getElementById('canvas')// canvasRef.current;
        // console.log("ShowFrameList useEffect canvas", canvas)

        let element = gl.domElement as HTMLCanvasElement;
        // let offscreen = element.transferControlToOffscreen();
        console.log("element", element) 


        const args = {
            width: element.clientWidth,
            height: element.clientHeight,
            pixelRatio: window.devicePixelRatio,
        }
        console.log("ShowFrameList useThree is ", args)

        // console.log("ShowFrameList renderTarget", renderTarget)

    // const worker = new Worker(new URL('./worker.js', import.meta.url));

    // worker.postMessage( {
    //   drawingSurface: offscreen,
    //   width: canvas.clientWidth,
    //   height: canvas.clientHeight,
    //   pixelRatio: window.devicePixelRatio,
    // }, [ offscreen ] );

    }, []);

    function getFrameElements(): JSX.Element[] {
        // console.log("ShowFrameList getFrameElements frames", frames)

        console.log("ShowFrameList getFrameElements length", frames.length)

        var result: JSX.Element[] = []

        return result

        for (let i = 0; i < frames.length; i++) {
            const frame = frames[i];
            console.log("ShowFrameList getFrameElements", frame)
            result.push(
                <mesh key={i} position={[i * 2, 0, 0]}>
                    <boxGeometry args={[0.2, 0.2, 0.2]} />
                    <meshStandardMaterial color="orange" />
                </mesh>
            )
        }
        result.push(
            <mesh key={9999} position={[-1 * 2, 0, 0]}>
                <boxGeometry args={[0.2, 0.2, 0.2]} />
                <meshStandardMaterial color="yellow" />
            </mesh>
        )
        return result
    }

    // ref = {canvasRef}
    // id="main-frame-canvas"  

    return (

    <> 
    {/* {getFrameElements()} */}
    </>
              
    // <canvas  >
    //         {getFrameElements()}
    // </canvas>
         
    )
}

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
