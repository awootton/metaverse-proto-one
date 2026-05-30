/* eslint-disable */
import * as THREE from 'three'
import * as React from 'react'
import { useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'

// import { render } from '@react-three/offscreen';

// import { Shiba } from "./components/Shiba"

import { LoadSomeFramesTest } from "./components/IFrameChildTest"
import { MetaMainContain } from "./components/MetaMainContain"
import { AtwBoxChildFrame } from "./components/AtwBoxChildScene"
import { CameraWalker } from "./components/CameraWalker"
import Grid from "./components/Grid"
import { Stats } from "@react-three/drei/core/Stats"

// <iframe src="https://www.youtube.com/embed/uXWycyeTeCs" width={1000} height={500} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture full"></iframe>

import * as dd from './knotfree-ts-lib/3d/messageTypes';

import { OutlineBoxComponent } from './components/OutlineBoxComponent'


export default function App() {

  // console.log("App url ", window.location.href)

  // don't use this 
  const areWeChild = false // window.location.href.includes('domain=')

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [helpClicked, setHelpClicked] = useState(true);

  // const { gl } = useThree()


  function XXXwhichAtwBox() {

    // if(window.location.href.includes('offscreen-canvas-demo=')) {
    //   return (<><RotatingBoxPurple /></>)
    // }
    if (areWeChild) {
      return (<><AtwBoxChildFrame /></>)
    } else {
      return <MetaMainContain />
    }
  }
  React.useEffect(() => {

    console.log("App useEffect")
    const canvas = document.getElementById('canvas')// canvasRef.current;
    console.log("ShowFrameList useEffect canvas", canvas)

    const canvasc = canvasRef.current;
    if (canvasc) {
      // const offscreen = canvasc.transferControlToOffscreen();
      // console.log("Canvas HAVE", canvasc, offscreen); 
    } else {
      console.log("Canvas missong", canvasc);
    }

  }, [])

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setHelpClicked(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const cube1: dd.Cube = {
    world: "testmain",
    x: -1 * 2 ** 4,
    y: 0,
    z: -5 * 2 ** 4,
    p: 4
  }

  console.log(`cube1`, dd.cubeToString(cube1))

  const cube2: dd.Cube = {
    world: "testmain",
    x: -2 * 2 ** 4,
    y: 0,
    z: -5 * 2 ** 4,
    p: 4
  }

  const cube3: dd.Cube = {
    world: "testmain",
    x: 2 * 2 ** 2,
    y: 0,
    z: -5 * 2 ** 2,
    p: 2
  }



  return (
    <>
      <span style={{ display: 'flex', gap: '10px', alignItems: 'center', fontSize: '18px' }}>
        <div>metaverse-proto-one</div>
        <div>github.com/awootton/metaverse-proto-one </div>
        <button
          onClick={() => setHelpClicked(true)}
          style={{
            padding: '0',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}>
          ?
        </button>
      </span>

      <Canvas id="canvas" ref={canvasRef}  camera={{ position: [-10, 1.75, 0], fov: 75 }}>


        {/* <ambientLight intensity={0.5} /> */}
        {/* <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
        <pointLight position={[-10, -10, -10]} /> */}
        {/* <ClickBox position={[-1.2, 0, 0]} />
      // <ClickBox position={[1.2, 0, 0]} /> */}

        {/* <directionalLight position={[10, 10, 10]} intensity={1} />
            scene.add(light); */}

        <ambientLight intensity={0.25} />

        {/* Positioned light that can cast shadows */}
        <directionalLight
          position={[10, 10, 5]}
          intensity={1.5}

        />


        <CameraWalker />

        <MetaMainContain />

        <OutlineBoxComponent cube={cube1} errorMsg={undefined} />
        <OutlineBoxComponent cube={cube2} errorMsg={undefined}/>
        <OutlineBoxComponent cube={cube3} errorMsg={undefined} />

        {/* <Grid size={10} /> */}

        {/* {XXXwhichAtwBox()} */}


        {/* <AtwBox /> */}

        {/* <DrawDogComponent /> */}

        {/* <Stats showPanel={0} /> */}

        {/* <Shiba /> */}

      </Canvas >

      {helpClicked && (
        <div style={{ 
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          zIndex: 1000,
          minWidth: '300px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              Navigation is with WASD keys. Hold shift to go faster. Control to go even faster. R to reset camera, B for birds eye view.
              <br />
              Z to be taller, Q to be shorter.
              <br />
              Click will capture the mouse to look around, and click again, or "esc" to release.
              <br />
              You are curently facing north. 
            </div>
            <button onClick={() => setHelpClicked(false)} style={{
              backgroundColor: 'transparent',
              border: 'blue',
              color: '#007bff',
              fontSize: '20px',
              cursor: 'pointer',
              padding: '4'
            }}>close</button>
          </div>
        </div>
      )}

      {/* <Canvas id="canvas2" >
        <mesh>
          <boxGeometry />
          <meshBasicMaterial color="hotpink" />
        </mesh>
      </Canvas> */}

      <LoadSomeFramesTest />


    </>
  )
}

// const handleInit = (payload) => {
//   const { props, drawingSurface: canvas, width, height, pixelRatio } = payload;

//   console.log("XXXX worker has init")

//   root = createRoot(canvas)

//   root.configure({
//     events: createPointerEvents,
//     size: {
//       width,
//       height,
//       updateStyle: false
//     },
//     dpr: pixelRatio,
//   })

//   root.render(<App />)

//   // r3f6
//   // render(<CompWrapper {...props} />, canvas, {
//   //   events: createPointerEvents,
//   //   size: {
//   //     width,
//   //     height,
//   //     updateStyle: false
//   //   },
//   //   dpr: pixelRatio,
//   // })
// }

// const handleResize = ({ width, height }) => {
//   if (!root) return;
//   root.configure({
//     size: {
//       width,
//       height,
//       updateStyle: false
//     },
//   })
// }

// const handleEvents = (payload) => {
//   emitter.emit(payload.eventName, payload)
//   emitter.on('disconnect', () => {
//     self.postMessage({ type: 'dom_events_disconnect' })
//   })
// }

// const handleProps = (payload) => {
//   emitter.emit('props', payload)
// }

// const handlerMap = {
//   'resize': handleResize,
//   'init': handleInit,
//   'dom_events': handleEvents,
//   'props': handleProps,
// }

// self.onmessage = (event) => {
//   const { type, payload } = event.data
//   const handler = handlerMap[type]
//   if (handler) handler(payload)
// }


function processMessageAsFrame(event: any) {

  if (!event || !event.data || !event.data.type) {
    // return
  }
  // 

  if (!event.data.source?.includes("devtools")) {
    console.log("App processMessageAsFrame got message", event.data);
  }

  const offscreenCanvas = event.data.canvas as OffscreenCanvas;
  if (!offscreenCanvas) {
    // console.error("App processMessageAsFrame no offscreenCanvas in message", event.data);
    return;
  }
  console.log("App processMessageAsFrame got offscreenCanvas", offscreenCanvas);

  // render(
  //   <Canvas gl={{ canvas: offscreenCanvas, antialias: true }}>
  //     {/* Your react-three-fiber scene components */}
  //     <mesh>  use purple box
  //       <boxGeometry />
  //       <meshBasicMaterial color="hotpink" />
  //     </mesh>
  //   </Canvas>
  // );
}

// if (window.addEventListener) {
//   // For standards-compliant web browsers
//   window.addEventListener("message", processMessageAsFrame, false);
// }


window.onmessage = function (event) {
  // const offscreenCanvas = event.data.canvas as OffscreenCanvas;
  // console.log("App onmessage got offscreenCanvas", offscreenCanvas);
  processMessageAsFrame(event);
};




function RotatingBoxGreen(props: {}) {

  const ref = useRef<THREE.Mesh>(null!)

  // useFrame((state, delta) => {
  //   ref.current.rotation.x += 0.04
  //   ref.current.rotation.y += 0.04

  //   // Object.assign(document, { "foreignScene": state.scene })
  //   // foreignScene = state.scene

  // })
  return (
    // <mesh ref={ref} {...props} >
    <mesh {...props} >
      <boxGeometry args={[1.5, 0.2, 1]} />
      <meshStandardMaterial color="green" />
    </mesh>
  )
}

function RotatingBoxPurple(props: {}) {

  const ref = useRef<THREE.Mesh>(null!)

  // useFrame((state, delta) => {
  //   ref.current.rotation.x += 0.04
  //   ref.current.rotation.y += 0.04

  //   // Object.assign(document, { "foreignScene": state.scene })
  //   // foreignScene = state.scene

  // })
  return (
    // <mesh ref={ref} {...props} >
    <mesh {...props} >
      <boxGeometry args={[1.5, 0.2, 1]} />
      <meshStandardMaterial color="orange" />
    </mesh>
  )
}

// function ClickBox(props: MeshProps) {
//   // This reference will give us direct access to the THREE.Mesh object
//   const ref = useRef<THREE.Mesh>(null!)
//   // Hold state for hovered and clicked events
//   const [hovered, hover] = useState(false)
//   const [clicked, click] = useState(false)
//   // Rotate mesh every frame, this is outside of React without overhead
//   useFrame((state, delta) => (ref.current.rotation.x += 0.01))

//   return (
//     <mesh
//       {...props}
//       ref={ref}
//       scale={clicked ? 1.5 : 1}
//       onClick={(event) => click(!clicked)}
//       onPointerOver={(event) => hover(true)}
//       onPointerOut={(event) => hover(false)}>
//       <boxGeometry args={[1, 1, 1]} />
//       <meshStandardMaterial color={hovered ? 'hotpink' : 'orange'} />
//     </mesh>
//   )
// }


{/* <iframe src="https://platform.twitter.com/widgets/tweet_button.html" ></iframe>
<iframe src="https://platform.twitter.com/widgets/tweet_button.html" ></iframe>
<iframe src="https://platform.twitter.com/widgets/tweet_button.html" ></iframe>
<iframe src="https://platform.twitter.com/widgets/tweet_button.html" ></iframe>

<iframe src="http://localhost:5173/index.html" ></iframe> */}
{/* <iframe src="http://localhost:5173/index.html" ></iframe>  */ }
