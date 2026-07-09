/* eslint-disable */
import * as THREE from 'three'
import * as React from 'react'
import { useRef, useState } from 'react'
import preval from 'preval.macro'
import { Perf } from 'r3f-perf'

import { MenuItem, DropdownMenu } from "./components/MainMenu"

import * as  nav1 from './components/NavigatorTest1'
import { StarsDialog } from './knotfree-ts-lib/components/StarsDialog'

import MarkdownDialog from './components/MarkdownDialog'
import { MainWorldDisplay } from './components/MainWorldDisplay'
import { WorldDisplayState } from './components/WorldDisplayState'
import Switch from '@mui/material/Switch'
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import Close from '@mui/icons-material/Close';

import { OrbitPropertyDialog } from './components/OrbitPropertyDialog'

import * as bvts from './knotfree-ts-lib/3d/BuildVisibleTreeStatus';
import { myMapCacheIntf } from './knotfree-ts-lib/3d/CacheIntf'; // just a map.
import * as oct from './knotfree-ts-lib/3d/UrlOctTree'
import * as utils from './knotfree-ts-lib/3d/utils'

import * as pubsub from "./components/PubSubTopicAndSubscribers"
import { MyInputDialog } from './knotfree-ts-lib/components/MyInputDialog'
import { StartLoadFromDbAndRun } from './components/AppCanvas'
import AppCanvas from './components/AppCanvas'
import AboutGotohereDialog from './components/AboutGotohereDialog'

const doClear = new URLSearchParams(window.location.search).get("clear")
// I just changed some definitions so lets start fresh.
// in all cases it's called groupId.id now and not groupId.grp. I changed it to be more clear.
if (doClear === "true") {
  console.log("App got call to clear caches ", doClear)
  // eg http://localhost:3020/?clear=true
  localStorage.clear() // kills other things too. probably a bad idea.
  oct.ClearChildBitsCache()
  myMapCacheIntf.clear()
}

let startingCube: oct.Cube = { world: "testmain", x: 1, y: 2, z: 10, p: 0 }  // in meters

const locparam = new URLSearchParams(window.location.search).get("location")
if (locparam) {
  console.log("App got location param ", locparam)
  // eg http://localhost:3020/?location=testmain.2s0u5e4p.vr
  const [startingCubeTmp, err] = oct.StringToCube(locparam)
  if (err) {
    console.error("App error parsing location param ", locparam, " err: ", err)
  }
  else {
    startingCube = startingCubeTmp
    console.log("App parsed location param ", locparam, " to cube ", startingCube)
  }
}

const InitialGlobalAppDisplayState: WorldDisplayState = {
  worldName: startingCube.world,
  previousCameraPosition: new THREE.Vector3(-2, 1.75, 10),
  currentCameraPosition: new THREE.Vector3(-2, 1.75, 12),
  timeSinceLastCameraMovement: 0,
  // each view should really have their own one of these.
  theGlobalTree: new bvts.BuildVisibleTreeStatus(myMapCacheIntf), // we get our own tree !!
  uniqueId: utils.randomString(24),
  onlyShowOutlineBoxes: false,
  showOriginAxis: true,
  toggleOnlyShowOutlineBoxes: () => {
    console.log("App OnlyShowOutlineBoxes toggle needs override. " +
      "This is a placeholder. It should be overridden by the parent component.")
  }
}

// it's async but I'm not waiting.
StartLoadFromDbAndRun(InitialGlobalAppDisplayState)

console.log("App url ", window.location.href)

// The problem is that NewestAppToggleOnlyShowOutlineBoxes and the state change every time.
// We must call the latest.
var LatestAppToggleOnlyShowOutlineBoxes: (state: WorldDisplayState) => void = () => {}

export default function App() {

  // let's parse the url and see if we have a world name in it.
  // eg http://localhost:3020/?location=testmain.2s0u5e4p.vr

  // from appCanvas export const DefaultCameraPosition = new THREE.Vector3(-2, 1.75, 10);

  // console.log("App starting with localStorage cache size  ", localStorage.length)
  // console.log("App starting with localStorage child bits cache loadout of   ", oct.GetTheWholeChildBitsLocalCache().size, " items.")

  //because we can reference a function before it's defined
  const startingAppDisplayState: WorldDisplayState = {
    ...InitialGlobalAppDisplayState,
    onlyShowOutlineBoxes: false,
    toggleOnlyShowOutlineBoxes: () => { LatestAppToggleOnlyShowOutlineBoxes(startingAppDisplayState) }
  }

  const [appDisplayState, setAppDisplayState] = useState(startingAppDisplayState);

  function NewestAppToggleOnlyShowOutlineBoxes() {
    // there's no storage for this one. Imagine the confusion that could result
    let showThem = !appDisplayState.onlyShowOutlineBoxes;
    console.log("App OnlyShowOutlineBoxes is now ", showThem)
    const newState = {
      ...appDisplayState,
      onlyShowOutlineBoxes: showThem,
    }
    setAppDisplayState(newState)
  }
  // really a useEffect thing. No?
  LatestAppToggleOnlyShowOutlineBoxes = NewestAppToggleOnlyShowOutlineBoxes

  // console.log("App Starting with  ", appDisplayState.uniqueId)

  const hideHelpOnStart = localStorage.getItem("hideHelpOnStart");
  // console.log("App hideHelpOnStart ", hideHelpOnStart)
  const [hideHelpOnStartState, setHideHelpOnStartState] = useState(hideHelpOnStart === null);
  const [helpClicked, setHelpClicked] = useState(hideHelpOnStart === null);
  const [stars, setStars] = useState(false);
  const [orbit, setOrbit] = useState(false);

  const axisWillShow = localStorage.getItem("suppressAxisAtOrigin") === null;

  // we have to set this twice. FIXME: 
  const [showAxisAtOrigin, setShowAxisAtOrigin] = useState(axisWillShow);

  const [showingLeaves, setShowingLeaves] = useState([] as oct.TreeStatus[])

  const [loadingMessage, setLoadingMessage] = useState("loading...")

  // FIXME: not working or tested. Fun to dream though.
  // we have a dialog for it and we have this state but nobody is using it.
  const [worldNameOpen, setWorldNameOpen] = useState(false); // open the dialog
  const [worldName, setWorldName] = useState("testmain");


  // use effect to subscribe to the pubsub topic for showingLeaves, which is what the MainWorldDisplay will publish when it has new leaves to show.

  // we have a leaves publish for what's showing on the main world display, and then we pass that down to the AppCanvas 
  // which passes it down to the MainWorldDisplay which uses it to know what to show.

  // We have ANOTHER publish for the leaves showing on the orbital view, which is separate from the main world display. 
  // the orbital canvas can useFrame and get the camera and then order a bug async tree build (a whole ms !)
  // and then publish which will get picked up by it's parent which will pass the new list as a prop which will 
  // force a re-render and then the orbital canvas will show the new leaves.

  // btw. add the demo properties in there as well. Somewhere along the way the demp spaces get filtered.

  React.useEffect(() => {

    // const unsubscribe = 
    pubsub.subscribe("ShowingLeavesChanges", "App" + appDisplayState.uniqueId,
      (leaves: oct.TreeStatus[]) => {
        // it's sending me a damn map. wtf. 
        // console.log("App got showingLeaves ", leaves)
        // trigger a re-render of the AppCanvas with the new leaves.
        // it HAS TO be TreeStatus[] because the MainWorldDisplay is going to use it to render the leaves.
        // can we check here?
        for (const leaf of leaves) {  // Ii guess this is pretty good.
          if (!leaf.name || !leaf.groupId || !leaf.cube) {
            console.error("App got showingLeaves with invalid leaf ", leaf)
          }
        }

        setShowingLeaves(leaves)
      })

    return () => {
      pubsub.unsubscribe("ShowingLeavesChanges", "App" + appDisplayState.uniqueId)
    }
  }, [showingLeaves])

  React.useEffect(() => { // loading message.

    pubsub.subscribe("LoadingMessage", "App" + appDisplayState.uniqueId,
      (message: string) => {
        // it's sending me a damn map. wtf. 
        // console.log("App got loadingMessage ", message)
        setLoadingMessage(message)
      })

    return () => {
      pubsub.unsubscribe("LoadingMessage", "App" + appDisplayState.uniqueId)
    }
  }, [loadingMessage])


  const MainMenuActions: MenuItem[] = [
    { id: "About", label: "About", onClick: () => setHelpClicked(true) },
    { id: "Enter-a-pace", label: "Orbital view.", onClick: () => setOrbit(true) },
    { id: "misc-options", label: "Explore kooky options.", onClick: () => setWorldNameOpen(true) },
    // { id: "premium", label: "Upgrade to Premium (Locked)", onClick: () => {}, disabled: true },
    // { id: "logout", label: "Sign Out", onClick: () => alert("Logging out!") },
    { id: "Egg", label: "easter egg", onClick: () => setStars(true) },
  ];

  var shouldShowMainWorldDisplay = true
  var shouldShowOrbitalCanvasDisplay = false
  if (orbit) { // || helpClicked || stars) {
    shouldShowMainWorldDisplay = false
    // for now, we don't want to show the main world display when we're in orbital view, 
    // because the orbital view is meant to be a separate thing. 
    // We could also show it and just have the orbital view be a different camera, but for now we'll just hide it.
    // maybe it will unhook it's keybpoard controls when it unmounts and then the dialogs will work better. sheesh.
  }
  if (orbit) {
    shouldShowOrbitalCanvasDisplay = true
  }

  //  was <DropdownMenu triggerLabel={(<div><MoreHorizIcon /></div>)} items={MainMenuActions} />
  // want MenuOpenIcon because Wendy didn't see it.

  // <CloseIcon />

  //  <DropdownMenu triggerLabel={(<div><MenuOpenIcon/></div>)} items={MainMenuActions} />


  // console.log("App refresh  refresh  refresh  refresh  worldName ", worldName, "hideHelpOnStartState ", hideHelpOnStartState)
  return (
    <>
      {/* top bar */}
      <span style={{ display: 'flex', gap: '4px', alignItems: 'center', fontSize: '12px' }}>
        <div>github.com/awootton/metaverse-proto-one </div>
        <div><a href="https://x.com/alan_t_wootton" target="_blank" rel="noopener noreferrer">X blog</a> </div>
        <div>Build Date: {preval`module.exports = new Date().toLocaleString();`}.</div>
        <DropdownMenu triggerLabel={(<div><MenuOpenIcon /></div>)} items={MainMenuActions} />
        {/* <StarPurple500Icon onClick={() => { setStars(true) }}  /> */}
        <div>{loadingMessage}.</div>
      </span>

      <AppCanvas
        state={{
          ...appDisplayState,
          showOriginAxis: showAxisAtOrigin, // the SetState here
          toggleOnlyShowOutlineBoxes: () => LatestAppToggleOnlyShowOutlineBoxes(appDisplayState)
        }} // pass the state down to the AppCanvas
        //  previousCameraPosition={defaultCameraPosition}
        //  timeSinceLastCameraMovement={0}
        //  theGlobalTree={new bvts.BuildVisibleTreeStatus(myMapCacheIntf)}
        shouldShowMainWorldDisplay={shouldShowMainWorldDisplay}
        showingLeaves={showingLeaves}
      />

      {/* <MarkdownDialog
        open={helpClicked}
        onClose={() => setHelpClicked(false)}
        title={"Hi"}
        body={helpText}
        inject={(<><Switch checked={!hideHelpOnStartState} size="small" onClick={() => toggleHideHelpOnStart()} />Hide Help on Start</>)}
      /> */}

      <AboutGotohereDialog
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
        // spaces={demo PropertiesState} // this would be the comma delimited list of properties that you want to load and display in the 3D view. The dialog would have an input box where you can enter these, and an OK button to confirm.
        // worldName={worldName}
        // maybe the dialog should make it's own state thing for it's own canvas.
        worldDisplayState={{
          ...appDisplayState,
          showOriginAxis: showAxisAtOrigin, // the SetState here
          toggleOnlyShowOutlineBoxes: () => LatestAppToggleOnlyShowOutlineBoxes(appDisplayState)
        }}
        shouldShowOrbitalCanvasDisplay={shouldShowOrbitalCanvasDisplay}

        onClose={() => { setOrbit(false) }} //
        onConfirm={() => { }}
        title="Orbital View"
      />

      <MyInputDialog
        open={worldNameOpen}
        onClose={() => { setWorldNameOpen(false) }}
        title="Explore some options."
        body="When there's other worlds besides just 'testmain' put the name here.
         Follow my progress online. @alan-t-wootton. I'm working on it. 
         Volunteers? 
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

        inject={(
          <>
            <br />
            <div>
              <Switch checked={showAxisAtOrigin} size="small" onClick={() => toggleShowAxisAtOrigin()} />Show the axis at the origin
            </div>
            <div>
              <Switch checked={appDisplayState.onlyShowOutlineBoxes} size="small" 
              onClick={() => appDisplayState.toggleOnlyShowOutlineBoxes()} />Show owned properties as blue cubes. See their addresses.
            </div>
          </>
        )}
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


  // the logic is reversed. If it's null then we show the axis on start. If it's set then we don't show it.
  function toggleShowAxisAtOrigin() {
    // can we please keeep this key: '"suppressAxisAtOrigin"' here and only here. Thanx.
    let suppressAxisAtOrigin = localStorage.getItem("suppressAxisAtOrigin");
    let weWillShowAxis = suppressAxisAtOrigin === null

    weWillShowAxis = !weWillShowAxis; // now it's toggled.

    console.log("App weWillShowAxis ", weWillShowAxis)

    if (weWillShowAxis) { // is this toggled? 
      localStorage.removeItem("suppressAxisAtOrigin");
    } else {
      localStorage.setItem("suppressAxisAtOrigin", "true");
    }
    // save toggled state.
    setShowAxisAtOrigin(weWillShowAxis);
    const newState = {
      ...appDisplayState,
      showAxisAtOrigin: weWillShowAxis,
    }
    setAppDisplayState(newState)
    console.log("App weWillShowAxis ", weWillShowAxis)
  }
}


const helpText99 = `
## To my dearest love. I made this for you. Please text me when you see it.

#### It's a demonstration of how buying a domain name in a particular format can be the same as buying a property in the metaverse.

People love buying domain names and trying to do interesting things with them. I won't pretend to know the 
thousands of interesting things that people will think of but I know there's more to it than stock quotes, sports, weather and porn.

As we know, the rush to do this stuff in 3d hasn't happened hard but here's a demo of a way how it could happen. A bird in the hand. 

Remember. You own all this. I give you all the copyright and all the rights to it. You can do whatever you want with it. 
I don't care. I just want to see it happen and I love you to the moon and back. 

`

// https://x.com/alan_t_wootton/status/2074578390208983408?s=20 

const helpText = `
## How to buy property in The Metaverse. Just buy a domain name of the right format.
#### Like, for real. There’s a new demo release. Today! 

[See the latest content at X.com.](https://x.com/alan_t_wootton/status/2074578390208983408?s=20 )

http://gotohere.com is this demo.

There's no shortage of people debating about how the best way to buy virtual property in the metaverse.
What I have is a solid demonstration of it happening.
Next up is how to interact with the property and how others can interact with it. 
How other things, cars, avatars, and other things can interact with property and each other.

As I describe the technique I'll provide working code and a working demo. It's what I do. And then, There will be ... The Metaverse.

Follow me. @alan_t_wootton on X. I'm blogging about it there. I don't have time for much social media. I have a lot of work to do.

`



// It's in markdown. 
const helpTextOld = `

#### This is a demo. Not THE Metaverse.

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

There are instructions if you want to see yours shown here. Note that the "..." menu at the top has some other fun stuff in it like 
an orbital view mode where you can visualize properties by entering their names.

Note that the 'name' of the property, like an address, is written on the floor of the cubes.

The axis in the middle is 0 north, 0 east, 0 up. The nav controls are crap. They would be defined by your avatar which nobody has yet invented. 
Shift reload this page to get the latest version.
`


// What was this for again?
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


// function RotatingBoxGreen(props: {}) {

//   const ref = useRef<THREE.Mesh>(null!)

//   // useFrame((state, delta) => {
//   //   ref.current.rotation.x += 0.04
//   //   ref.current.rotation.y += 0.04

//   //   // Object.assign(document, { "foreignScene": state.scene })
//   //   // foreignScene = state.scene

//   // })
//   return (
//     // <mesh ref={ref} {...props} >
//     <mesh {...props} >
//       <boxGeometry args={[1.5, 0.2, 1]} />
//       <meshStandardMaterial color="green" />
//     </mesh>
//   )
// }

// function RotatingBoxPurple(props: {}) {

//   const ref = useRef<THREE.Mesh>(null!)

//   // useFrame((state, delta) => {
//   //   ref.current.rotation.x += 0.04
//   //   ref.current.rotation.y += 0.04

//   //   // Object.assign(document, { "foreignScene": state.scene })
//   //   // foreignScene = state.scene

//   // })
//   return (
//     // <mesh ref={ref} {...props} >
//     <mesh {...props} >
//       <boxGeometry args={[1.5, 0.2, 1]} />
//       <meshStandardMaterial color="orange" />
//     </mesh>
//   )
// }

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
