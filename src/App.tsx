/* eslint-disable */
import * as THREE from 'three'
import * as React from 'react'
import { useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import preval from 'preval.macro'

import { MenuItem, DropdownMenu } from "./components/MainMenu"

import * as  nav1 from './components/NavigatorTest1'
// import { Compass } from './components/Compass'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { StarsDialog } from './knotfree-ts-lib/components/StarsDialog'

import MarkdownDialog from './components/MarkdownDialog'
import { MainWorldDisplay } from './components/MainWorldDisplay'
import Switch from '@mui/material/Switch'
import { OrbitPropertyDialog } from './components/OrbitPropertyDialog'
import MyInputDialog from './knotfree-ts-lib/components/MyInputDialog'

import * as bvts from './knotfree-ts-lib/3d/BuildVisibleTreeStatus';
import { myMapCacheIntf } from './knotfree-ts-lib/3d/CacheIntf'; // just a map.

// 10 meters east and a little south, and 1.75 meters up, which is about eye level for an average person standing on the ground. 
export const defaultCameraPosition = new THREE.Vector3(-2, 1.75, 10)

import * as ps4 from "./components/PubSub4App"


const appVisibleTree = new bvts.BuildVisibleTreeStatus(myMapCacheIntf) // this is the main state that we want to share between the MainWorldDisplay and the OrbitPropertyDialog and other components. It has to live in the parent component, which is the App component. We can pass it down to the MainWorldDisplay and the OrbitPropertyDialog as props, and they can use it to trigger tree traversals and render the cubes in the scene.

export default function App() {

  const appDisplayState = {
    worldName: "testmain",
    previousCameraPosition: new THREE.Vector3(1e999, 0, 0),
    timeSinceLastCameraMovement: 0,
    theGlobalTree: appVisibleTree // we get our own tree !!
  }

  console.log("App url ", window.location.href)

  const hideHelpOnStart = localStorage.getItem("hideHelpOnStart");
  console.log("App hideHelpOnStart ", hideHelpOnStart)
  const [hideHelpOnStartState, setHideHelpOnStartState] = useState(hideHelpOnStart === null);
  const [helpClicked, setHelpClicked] = useState(hideHelpOnStart === null);
  const [stars, setStars] = useState(false);
  const [orbit, setOrbit] = useState(false);

  // FIXME: not working or tested.
  // we have a dialog for it and we have this state but nobody is using it.
  const [worldNameOpen, setWorldNameOpen] = useState(false); // open the dialog
  const [worldName, setWorldName] = useState("testmain");

  const demoProperties = localStorage.getItem("demoProperties");
  console.log("App demoProperties ", demoProperties)

  const [demoPropertiesState, setDemoPropertiesState] = useState(demoProperties || "");

  const MainMenuActions: MenuItem[] = [
    { id: "About", label: "About", onClick: () => setHelpClicked(true) },
    { id: "Enter-a-pace", label: "Enter a space-Orbital view.", onClick: () => setOrbit(true) },
    { id: "Change-the-World", label: "Enter a whole new world.", onClick: () => setWorldNameOpen(true) },
    // { id: "premium", label: "Upgrade to Premium (Locked)", onClick: () => {}, disabled: true },
    // { id: "logout", label: "Sign Out", onClick: () => alert("Logging out!") },
    { id: "Egg", label: "easter egg", onClick: () => setStars(true) },
  ];

  function changeDemoProperties(newProperties: string) {
    localStorage.setItem("demoProperties", newProperties)
    setDemoPropertiesState(newProperties)
  }

  React.useEffect(() => {
    console.log("App useEffect 1")
    ps4.subscribe("DemoPropertiesChanges", "App", (status: Object, err: Error) => {
      console.log("App got pubsub message", status, err)
      if (status && typeof status === "string") {
        changeDemoProperties(status as string)
      } else {
        // got funny object from pubsub. Expected a string.
        console.log("App got pubsub message but it's not a string", status)
        changeDemoProperties("") // and now it's off.
      }
    })
    return () => {
      ps4.unsubscribe("DemoPropertiesChanges", "App")
      console.log("App useEffect DemoPropertiesChanges cleanup")
    };
  }, [demoPropertiesState])

  const cameraControlRef = useRef<nav1.ControlCameraRef>(null);

  const fov = 75
  const aspect = window.innerWidth / window.innerHeight
  const near = 0.25
  const far = 4000

  let initialcamera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  initialcamera.position.copy(defaultCameraPosition)
  initialcamera.lookAt(0, defaultCameraPosition.y, 0)

  console.log("App refresh  refresh  refresh  refresh no, no no ")

  return (
    <>
      {/* top bar */}
      <span style={{ display: 'flex', gap: '4px', alignItems: 'center', fontSize: '12px' }}>
        <div>github.com/awootton/metaverse-proto-one </div>
        <div><a href="https://x.com/alan_t_wootton" target="_blank" rel="noopener noreferrer">X blog</a> </div>
        <div>Build Date: {preval`module.exports = new Date().toLocaleString();`}.</div>
        {/* <MoreHorizIcon onClick={() => setHelpClicked(true)} /> */}
        <DropdownMenu triggerLabel={(<div><MoreHorizIcon /></div>)} items={MainMenuActions} />
        {/* <StarPurple500Icon onClick={() => { setStars(true) }}  /> */}
      </span>

      <Canvas id="canvas"
        camera={initialcamera}
      >

        <ambientLight intensity={0.25} />

        {/* Positioned light that can cast shadows */}
        <directionalLight
          position={[10, 10, 5]}
          intensity={1.5}

        />

        <nav1.NavigationCamera cameraRef={cameraControlRef} />

        {/* // <MainWorldDisplay worldName={worldName} demoSpaces={demoPropertiesState} /> */}

        <MainWorldDisplay demoSpaces={demoPropertiesState} state={appDisplayState} />

        {/* worldName: string  state: WorldDisplayState
        
            previousCameraPosition: THREE.Vector3 // = new THREE.Vector3(1e999, 0, 0)
            timeSinceLastCameraMovement: number // = 0
            // what does it mean to have two copies of THIS gadget? 
            theGlobalTree: bvts.BuildVisibleTreeStatus // = new bvts.BuildVisibleTreeStatus(myMapCacheIntf) */}

      </Canvas >

      <nav1.NavigationControls1 cameraRef={cameraControlRef} />

      <MarkdownDialog
        open={helpClicked}
        onClose={() => setHelpClicked(false)}
        title={"Hi"}
        body={helpText}
        inject={(<><Switch checked={!hideHelpOnStartState} size="small" onClick={() => toggleHideHelpOnStart()} />Hide Help on Start</>)}
      />
      <StarsDialog
        open={stars}
        onClose={() => { setStars(false) }} //
        onConfirm={() => { }}
        title=""
      />

      <OrbitPropertyDialog
        open={orbit}
        spaces={demoPropertiesState} // this would be the comma delimited list of properties that you want to load and display in the 3D view. The dialog would have an input box where you can enter these, and an OK button to confirm.
        worldName={worldName}
        onClose={() => { setOrbit(false) }} //
        onConfirm={() => { }}
        title=""
      />

      <MyInputDialog
        open={worldNameOpen}
        onClose={() => { setWorldNameOpen(false) }}
        title="Enter a world name."
        body="Enter a whole new universe to explore. For demo purposes, you can enter 'testmain' which is the world that the demo properties are located in. 
         In the future, you would be able to enter any world that exists, and if you entered a world that doesn't exist yet, you would have to reserve some spaces to make it happen.
         That means purchasing domains names or getting them for free through knotfree.net. RTFM baby.
         The world name is also the first part of the property addresses. eg testmain-3n0u3e3p is a property located in the 'testmain' world.
         There's an 8 character minimum. Don't be weird.
         It needs testing. Volunteers? 
         "
        onConfirm={(str) => {
          console.log("Confirmed with input: ", str)
          setWorldNameOpen(false)
          if (str.length >= 8) {
            setWorldName(str)
          }
        }}
        label="Enter a world name"
        default={worldName}
      />

    </>
  )



  function toggleHideHelpOnStart() {
    let hideHelpOnStart = localStorage.getItem("hideHelpOnStart");
    if (hideHelpOnStart !== null) {
      localStorage.removeItem("hideHelpOnStart");
    } else {
      localStorage.setItem("hideHelpOnStart", "true");
    }
    hideHelpOnStart = localStorage.getItem("hideHelpOnStart");
    setHideHelpOnStartState(hideHelpOnStart === null);
    console.log("App toggleHideHelpOnStart ", hideHelpOnStart, hideHelpOnStartState)
  }
}

const helpText = `
## Don't look at this website. 

#### Dammit Jim. I'm a demo. Not THE Metaverse.

It's a proto of some 'The Metaverse' tech that I'm blogging on [X](https://x.com/alan_t_wootton) 
while I'm developing it and if you didn't read that than this won't make any sense to you. RTFM baby.
This is not The Metaverse. 🤓lol. Not yet.

The source code is here [github](https://github.com/awootton/metaverse-proto-one), and I am blogging about the development process on 
[X](https://x.com/alan_t_wootton). You ARE allowed to work on this. Take it away from me. I want you to. Tell your friends. Phone the neighbors.

This thing (image below) is meant to show a property that has been "bought" by someone. 

A space, or property, is reserved (owned) by ***buying the Domain Name*** for it! You could buy the correct .xyz domain 
and it would show up here. I'm giving out .vr domains for free to anyone who wants one through the tools at knotfree.net. 
Just ask me on X if you want more than 8. Give me a ❤️.

This is just the boundary box, but the idea is that the property will be rendered inside the box:

![examplePropertyCube](/examplePropertyCube.png)

There are instructions if you want to see yours shown here. We're not doing content yet.

Note that the 'name' of the property, like an address, is written on the floor of the cubes. Ignore the dog.

The axis in the middle is 0 north, 0 east, 0 up. The nav controls are crap. They would be defined by your avatar which nobody has yet.
`




// // can we even fetch https://knotfree.net/api1/getPublicKey from the browser? Yes.
// React.useEffect(() => {
//   fetch('https://knotfree.net/api1/getPublicKey')
//     .then(response => response.text())
//     .then(data => console.log('Knotfree Public key found:', data))
//     .catch(error => console.error('Error fetching Knotfree public key:', error));
// }, []);

// // how about this guy `https://one.one.one.one/dns-query?name=$gotohere.com&type=TXT`from the browser? NOPE.
// React.useEffect(() => {
//   fetch('https://one.one.one.one/dns-query?name=gotohere.com&type=TXT')
//     .then(response => response.text())
//     .then(data => console.log('one.one.one.one found:', data))
//     .catch(error => console.error('Error fetching one.one.one.one:', error));
// }, []);

// ima need an api in knotfree for this crap. DONE !!! 




// [Currently blogging at X](https://www.markdownguide.org)

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
  //  webpackHotUpdate38887362502c69910bfe no thanks

  if (!event.data.source?.includes("devtools") &&
    !event.data.type?.includes("webpack") &&
    !event.data.type?.startsWith("webpackHotUpdate")
  ) {
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
