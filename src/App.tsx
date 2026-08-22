/* eslint-disable */
import * as THREE from 'three'
import * as React from 'react'
import { useEffect, useState } from 'react'

import preval from 'preval.macro'
import { MenuItem, DropdownMenu } from "./components/MainMenu"
import { StarsDialog } from './knotfree-ts-lib/components/StarsDialog'
import Switch from '@mui/material/Switch'
import MenuOpenIcon from '@mui/icons-material/MenuOpen';

import * as oct from './knotfree-ts-lib/3d/Dns8Tree'
import * as utils from './knotfree-ts-lib/3d/utils'

import * as pubsub from "./knotfree-ts-lib/avatars/PubSubTopicAndSubscribers"
import * as sub from "./knotfree-ts-lib/avatars/PubSubSimple"

import AppCanvas from './components/AppCanvas'
import AboutGotohereDialog from './components/AboutGotohereDialog'

import { MakeListOfIFrames } from './FrameUtils/MakeListOfIFrames'

// This is the shopping thing now, not using orbital controls.
import { UnRealEstateShopper } from './components/OrbitPropertyDialog2'
import { IdentityDialog } from './components/IdentityDialog'
import { MiscInputDialog } from './components/misc-components/MiscInputDialog'


const doClear = new URLSearchParams(window.location.search).get("clear")
if (doClear === "true") {
  // console.log("App got call to clear caches ", doClear)
  // eg http://localhost:3020/?clear=true
  localStorage.clear() // kills other things too. probably a bad idea.
  oct.ClearChildBitsCache()
  oct.ClearTreeStatusCache()
}

let startingCube: oct.Cube = { world: "testmain", x: 1, y: 2, z: 10, p: 0 }  // in meters

const locparam = new URLSearchParams(window.location.search).get("location")
if (locparam) {
  // console.log("App got location param ", locparam)
  // eg http://localhost:3020/?location=testmain.2s0u5e4p.vr
  const [startingCubeTmp, err] = oct.StringToCube(locparam)
  if (err) {
    console.error("App error parsing location param ", locparam, " err: ", err)
  }
  else {
    startingCube = startingCubeTmp
    // console.log("App parsed location param ", locparam, " to cube ", startingCube)
  }
}

type AppState = {
  worldName: string,
}

// const startingUniqueId = utils.randomString(24) // this is a unique identifier for the component instance, 
// so we can use it to subscribe to pubsub messages and avoid conflicts between multiple instances.
// it must hold still and be unique.

// these postiions that change should not be ion here.

export const DefaultCameraPosition = new THREE.Vector3(-2, 1.75, 10);

const InitialGlobalAppDisplayState: AppState = {
  worldName: startingCube.world,
}

// const XCanvasWithProps = Canvas as React.ComponentType<
//   React.ComponentPropsWithoutRef<'canvas'> & {
//     camera?: { position: THREE.Vector3 }
//     children?: React.ReactNode
//   }
// >

// console.log("App url ", window.location.href)
// console.log("App url ", window.location.href)

export default function App() {

  // how much space in in the demospaces? // refactor to to something like "shopping"
  // and less lke "demo".

  let str = localStorage.getItem("DemoProperties")

  // This should NOT be loading over and over. 
  // console.log("App starting with localStorage cache size  ", localStorage.length)
  // console.log("App starting with localStorage child bits cache loadout of   ", oct.GetTheWholeChildBitsLocalCache().size, " items.")

  //because we can reference a function before it's defined
  const startingAppDisplayState: AppState = {
    ...InitialGlobalAppDisplayState,
  }

  const [onlyShowOutlineBoxes, setOnlyShowOutlineBoxes] = useState(false);

  const [appDisplayState, setAppDisplayState] = useState(startingAppDisplayState);

  function ToggleOnlyShowOutlineBoxes() { // why do we even need this?
    let showThem = !onlyShowOutlineBoxes;
    setOnlyShowOutlineBoxes(showThem)
    mainpubsub.publish("ShowingLeavesChanges", [])
  }

  const hideHelpOnStart = localStorage.getItem("hideHelpOnStart");
  // console.log("App hideHelpOnStart ", hideHelpOnStart)
  const [hideHelpOnStartState, setHideHelpOnStartState] = useState(hideHelpOnStart === null);

  // dialogs
  const [helpClicked, setHelpClicked] = useState(hideHelpOnStart === null);
  const [shopping, setShopping] = useState(false);
  const [identityDialog, setIdentityDialog] = useState(false);
  const [miscDialog, setMiscDialog] = useState(true); // open the dialog
  const [stars, setStars] = useState(false); // easter egg

  const axisWillShow = localStorage.getItem("suppressAxisAtOrigin") === null;

  // we have to set this twice. FIXME: 
  const [showAxisAtOrigin, setShowAxisAtOrigin] = useState(axisWillShow);
  const [orbit, setOrbit] = useState(false);


  // Change this from showingLeaves to leavesToRender.
  // The leavesToRender is the list of leaves that we want to render in the scene.
  // right now it's hundreds of cubes but could be thousands. I don't know what happens then.
  // It comes from another place and comes in here by subscription. 
  // We don't want to change it here. We just want to render it.
  // The is a list of verifiable names for oct.Cube's
  const [leavesToRender, SetLeavesToRender] = useState([] as string[])

  const [loadingMessage, setLoadingMessage] = useState("loading...")

  // We should be able to just render once and then let the canvas do it's thing.

  const [worldName, setWorldName] = useState("testmain");

  // use effect to subscribe to the pubsub topic for leavesToRender, which is what the MainWorldDisplay will publish when it has new leaves to show.

  // we have a leaves publish for what's showing on the main world display, and then we pass that down to the AppCanvas 
  // which passes it down to the MainWorldDisplay which uses it to know what to show.

  React.useEffect(() => {

    // It's just the names. We try to keep them sorted.
    mainpubsub.subscribe("ShowingLeavesChanges", "App",
      (leaves: string[]) => {

        // trigger a re-render of the AppCanvas with the new leaves.
        // We'll just check that they're in the cache and that's good enough.
        // console.log("App subscribe got ShowingLeavesChanges names ", Array.from(oct.gTreeStatusCache.keys()).join(","))
        // console.log("App subscribe got ShowingLeavesChanges entities ", Array.from(oct.gTreeStatusCache.values()).map(e => e.name).join(","))
        // This is just a verification.
        for (const leafName of leaves) {
          const leaf = oct.GetTreeStatusFromCache(leafName)
          if (!leaf) {
            console.error("ERROR App got showingLeaves with a leaf that is not in the cache ", leafName)
          }
        }

        // did they change though?
        if (DidLeavesChange(leavesToRender, leaves)) {
          SetLeavesToRender([...leaves]) // force a re-render of the AppCanvas with the new leaves.???
        } else {
          // console.log("App got showingLeaves that did NOT change ", leaves.length, " leaves.")
        }
      },"common state setter for leavesToRender")

    return () => {
      mainpubsub.unsubscribe("ShowingLeavesChanges", "App")
    }
  }, [leavesToRender]) // important to do this so we have live leavesToRender values.
  // It doesn't hurt to re-subscribe.

  // DidLeavesChange checks if the leaves changed by sorting them my name
  // and then just comparing the names. If they are the same then we don't need to re-render.
  // The beauty part is that we don't even have to sort the previous list
  // because we always sorted the that list before we publish it. So we can just compare the names in order.
  // Thanks CP for writing the fluffiest possible version of this possible. lol.
  function DidLeavesChange(oldLeaves: string[], newLeaves: string[]): boolean {
    if (oldLeaves.length !== newLeaves.length) {
      return true
    }
    // let's keep them sorted by name all the time.
    // oldLeaves.sort((a, b) => a.localeCompare(b));
    // The old leaves are already sorted from the last time we published them. 
    // So we don't have to sort them again. We just have to sort the new leaves before we compare them.
    newLeaves.sort((a, b) => a.localeCompare(b));
    for (let i = 0; i < oldLeaves.length; i++) {
      const oldLeaf = oldLeaves[i]
      const newLeaf = newLeaves[i]
      if (oldLeaf !== newLeaf) {
        return true
      }
    }
    return false
  }

  React.useEffect(() => { // loading message.
    mainpubsub.subscribe("LoadingMessage", "App",
      (message: string) => {
        setLoadingMessage(message)
      },"Just changes the 'loading' message.")
    return () => {
      mainpubsub.unsubscribe("LoadingMessage", "App")
    }
  }) // loadingMessage
  // run every time }, []) // loadingMessage, not just once or when loading message changes. 
  // We want to subscribe every time the component renders so that the callback has the LATEST state. EVERY TIME.


  const MainMenuActions: MenuItem[] = [
    { id: "About", label: "About", onClick: () => setHelpClicked(true) },
    // { id: "Enter-a-pace", label: "Orbital view.", onClick: () => setOrbit(true) },
    { id: "Shopping-for-space", label: "Shopping for space.", onClick: () => setShopping(true) },

    { id: "Identity", label: "Identity.", onClick: () => setIdentityDialog(true) },

    { id: "misc-options", label: "Optional options.", onClick: () => setMiscDialog(true) },
    // { id: "premium", label: "Upgrade to Premium (Locked)", onClick: () => {}, disabled: true },
    // { id: "logout", label: "Sign Out", onClick: () => alert("Logging out!") },
    { id: "Egg", label: "easter egg", onClick: () => setStars(true) },
  ];

  const containerStyleSkinny = {
    width: '100%',
    height: '12px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f0f0f0'
  } as const


  // MakeListOfIFrames is now just a list of spans
  {/* {MakeListOfIFrames()} */ }

  // we can't do this here or there are constant re-renders. We have to do it in the AppCanvas where the camera is.
  // then we pub it here to the compass.
  //let compassAngle = 270         <Compass heading={compassAngle} size={32} />

  return (
    <>

      <div className="skinny-bar" style={containerStyleSkinny}  >
        {MakeListOfIFrames()}
      </div>

      {/* top bar */}
      <span style={{ display: 'flex', gap: '4px', alignItems: 'center', fontSize: '12px' }}>
        <div>github.com/awootton/metaverse-proto-one </div>
        <div><a href="https://x.com/alan_t_wootton" target="_blank" rel="noopener noreferrer">blog</a> </div>
        <div>Build Date: {preval`module.exports = new Date().toLocaleString();`}.</div>
        <DropdownMenu triggerLabel={(<div><MenuOpenIcon /></div>)} items={MainMenuActions} />
        {/* <StarPurple500Icon onClick={() => { setStars(true) }}  /> */}
        <div>{loadingMessage}.</div>
        <Switch checked={onlyShowOutlineBoxes} size="small"
          onClick={() => ToggleOnlyShowOutlineBoxes()} />X-Ray
        <Switch checked={orbit} size="small"
          onClick={() => setOrbit(!orbit)} />Orbital View

        <Compass size={32} />
      </span >

      <AppCanvas
        worldName={worldName}
        showOriginAxis={showAxisAtOrigin}
        onlyShowOutlineBoxes={onlyShowOutlineBoxes}
        UseOrbitalControls={orbit}
        initialCameraPosition={DefaultCameraPosition}
        showingLeaves={leavesToRender}
      />

      {/* <Canvas id="canvas0"
        camera={{ position: [0, 1.75, -4] }}
      >  <CubeWithEdges cube={cube0} />
      </Canvas > */}

      {/* <MarkdownDialog the old about dialog. It's now the AboutGotohereDialog
        open={helpClicked}
        onClose={() => setHelpClicked(false)}
        title={"Hi"}
        body={helpText}
        inject={(<><Switch checked={!hideHelpOnStartState} size="small" onClick={() => toggleHideHelpOnStart()} />Hide Help on Start</>)}
      /> */}

      < AboutGotohereDialog
        open={helpClicked}
        onClose={() => setHelpClicked(false)
        }
        title={"Hi"}
        body={helpText}
        inject={(<><Switch checked={!hideHelpOnStartState} size="small" onClick={() => toggleHideHelpOnStart()} />Hide Help on Start</>)}
      />

      < StarsDialog
        open={stars}
        onClose={() => { setStars(false) }} //
        onConfirm={() => { }}
        title=""
      />

      <MiscInputDialog
        open={miscDialog}
        onClose={() => { setMiscDialog(false) }}
        title="Explore some options."
        body="When there's other worlds besides just 'testmain' put the name here.
        Of course it's broken, so nevermind. I'll get there.
         Follow my progress online. @alan-t-wootton. I'm working on it. 
         Volunteers? 
         "
        onConfirm={(str) => {
          console.log("Confirmed with input: ", str)
          setMiscDialog(false)
          if (str.length >= 8) {
            setWorldName(str)
          }
        }}
        label="Enter a world name"
        default={worldName}
        showOriginAxis={showAxisAtOrigin}
        toggleShowAxisAtOrigin={() => toggleShowAxisAtOrigin()}

        onlyShowOutlineBoxes={onlyShowOutlineBoxes}
        toggleOnlyShowOutlineBoxes={() => toggleOnlyShowOutlineBoxes()}
      />

      <UnRealEstateShopper // not orbital, SHOPPING!  SHOPPING!  SHOPPING! 
        open={shopping}
        onClose={(reason: string) => {

          if (reason === 'wasCloseButton') {
            setShopping(false)
          }
          // don't just quit from clicks and the drags that happen in an orbital view.
        }}
        title="Space Shopping."
        // body="try a name"
        onConfirm={() => {
          // we're going to send garbage and they can get the 
          // real version from local storage.
          mainpubsub.publish("DemoPropertiesChanges", utils.RandomString(24))
        }
        } worldName={worldName}        //   console.log("Confirmed with input: ", str)
      />

      <IdentityDialog
        open={identityDialog}
        onClose={() => { setIdentityDialog(false) }}
        title="Let's establish the identity of some things."
        body=""
        onConfirm={(str) => {
          console.log("Confirmed with input: ", str)
        }}
        label="Type or use a suggested passphrase"
      //  default={worldName}
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
    // console.log("App toggleHideHelpOnStart ", hideHelpOnStart, hideHelpOnStartState)
  }

  function toggleOnlyShowOutlineBoxes() {
    // there's no storage for this one. Imagine the confusion that could result
    let showThem = !onlyShowOutlineBoxes;
    // console.log("App OnlyShowOutlineBoxes is now ", showThem)
    setOnlyShowOutlineBoxes(showThem);
    const newState = {
      ...appDisplayState,
      onlyShowOutlineBoxes: showThem,
    }
    setAppDisplayState(newState)
  }


  // the logic is reversed. If it's null then we show the axis on start. If it's set then we don't show it.
  function toggleShowAxisAtOrigin() {
    // can we please keeep this key: '"suppressAxisAtOrigin"' here and only here. Thanx.
    let suppressAxisAtOrigin = localStorage.getItem("suppressAxisAtOrigin");
    let weWillShowAxis = suppressAxisAtOrigin === null

    weWillShowAxis = !weWillShowAxis; // now it's toggled.

    // console.log("App weWillShowAxis ", weWillShowAxis)

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
    // console.log("App weWillShowAxis ", weWillShowAxis)
  }
}

export const mainpubsub = new pubsub.PubSubTopicAndSubscribers("mainpubsub","mainland")

export const Compass = ({ size = 150 }) => {

  useEffect(() => {
    sub.subscribe("CompassHeading", (avalue: any) => {
      const newHeading = avalue as number
      // convert to degrees and round to the nearest integer
      const newHeadingDegrees = Math.round(newHeading * (180 / Math.PI));
      setHeading(newHeadingDegrees)
    })
    return () => {
      sub.unsubscribe("CompassHeading")
    }
  }, []) // important to do this so we have live heading values.
  // It doesn't hurt to re-subscribe (too much).

  const [heading, setHeading] = useState(180)

  return (
    <div style={{ width: size, height: size, position: 'relative' }}>
      <svg
        viewBox="0 0 100 100"
        style={{
          width: '100%',
          height: '100%',
          transform: `rotate(${-heading}deg)`,
          transition: 'transform 0.2s ease-out',
        }}
      >
        {/* Outer Dial */}
        <circle cx="50" cy="50" r="45" fill="#f3f4f6" stroke="#1f2937" strokeWidth="3" />

        {/* Cardinal Direction Labels */}
        <text x="50" y="20" textAnchor="middle" fontSize="18" fontWeight="bold" fill="#1f2937">N</text>
        <text x="83" y="54" textAnchor="middle" fontSize="18" fontWeight="bold" fill="#1f2937">E</text>
        <text x="50" y="88" textAnchor="middle" fontSize="18" fontWeight="bold" fill="#1f2937">S</text>
        <text x="17" y="54" textAnchor="middle" fontSize="18" fontWeight="bold" fill="#1f2937">W</text>

        {/* Compass Needle */}
        <polygon points="50,15 56,50 44,50" fill="#ef4444" /> {/* North (Red) */}
        <polygon points="50,85 56,50 44,50" fill="#9ca3af" /> {/* South (Grey) */}
        <circle cx="50" cy="50" r="3" fill="#1f2937" />
      </svg>
    </div>
  );
};

const helpText99 = `
      ## To my dearest love. I made this for you. Please text me when you see it.

      #### It's a demonstration of how buying a domain name in a particular format can be the same as buying a property in the metaverse.

      People love buying domain names and trying to do interesting things with them. I won't pretend to know the
      thousands of interesting things (or even one) that people will think of but I know there's more to it than stock quotes, sports, weather and porn.

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

// Y'all gotta let me own a little someting here and there. 

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
