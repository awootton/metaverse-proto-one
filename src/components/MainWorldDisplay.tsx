import React, { useEffect } from 'react';

import { useRef, useState } from 'react'

import * as THREE from 'three'
import { Canvas, RootState, useFrame, useThree } from '@react-three/fiber'


import * as oct from '../knotfree-ts-lib/3d/UrlOctTree';
import { OriginAxisDisplay } from './OriginAxisDisplay';

import { myMapCacheIntf } from '../knotfree-ts-lib/3d/CacheIntf'; // just a map. 
import * as bvts from '../knotfree-ts-lib/3d/BuildVisibleTreeStatus';
import { WorldDisplayState } from './WorldDisplayState';
import * as pubsub from './PubSubTopicAndSubscribers'
import { LeafRenderingComponent } from './LeafRenderingComponent';

import { RetreiveTheDemoCubes, MakeBoxesForDemoSpaces } from './DemoProperties'
import * as utils from '../knotfree-ts-lib/3d/utils';

import { OutlineBoxComponent } from './OutlineBoxComponent'
import MakeBoxesForShowingLeaves from './MakeBoxesForShowingLeaves'


// lose this crap.
// 5th 16 m west cube south by 1*16 m
// const cube1: oct.Cube = {
//   world: "testmain",
//   x: -1 * 2 ** 4,
//   y: 0,
//   z: -5 * 2 ** 4,
//   p: 4
// }

// 5th 16 m west cube south by 2*16 m

// const cube2: oct.Cube = {
//   world: "testmain",
//   x: -2 * 2 ** 4,
//   y: 0,
//   z: -5 * 2 ** 4,
//   p: 4
// }

// const cube3: oct.Cube = {
//   world: "testmain",
//   x: 2 * 2 ** 2,
//   y: 0,
//   z: -5 * 2 ** 2,
//   p: 2
// }

let samples = "meta_group_id.testmain-0n0u0e4p,meta_group_id.testmain-1n0u0e4p,meta_group_id.testmain-2n0u0e4p"
// save in local storage for later?
let sampleArray = samples.split(",").map(s => s.trim())
console.log("sampleArray ", sampleArray)


export type MainWorldDisplayProps = {
  state: WorldDisplayState
  showingLeaves: oct.TreeStatus[]
  // add demo spaces here too.
  indexBase: number // this is a base index for the components to be rendered in the scene. We want to make sure the surrounding boxes are drawn first, so they are behind the leaves.
}

// MainWorldDisplay the the main component that displays the world. 
// It will also handle the tree traversal and updating the cubes to render based on the camera position. 
// It will also subscribe to changes in the demo spaces and update the cubes to render accordingly.
// There's two of these when the OrbitPropertyDialog is open. So, tree traversal is BROKEN. 

export function MainWorldDisplay(props: MainWorldDisplayProps) {

  console.log("MainWorldDisplay starting with  ", props.state.uniqueId, " show Props as outlines", props.state.onlyShowOutlineBoxes)
  const [demoSpacesVersion, setDemoSpacesVersion] = React.useState("")

  React.useEffect(() => {
    console.log("MainWorldDisplay DemoPropertiesChanges" + props.state.uniqueId)
    pubsub.subscribe("DemoPropertiesChanges", "MainWorldDisplay" + props.state.uniqueId, (status: Object, err: Error) => {

      console.log(`MainWorldDisplay${props.state.uniqueId} got pubsub message`, status, err)
      // I don't really care about the value I just want to re-trigger a calc of the property spaces.
      setDemoSpacesVersion("" + status) // force a redraw.
      //const str = ReCalcTheDemoProperties(props.state) why?
    })
    return () => {
      pubsub.unsubscribe("DemoPropertiesChanges", "MainWorldDisplay" + props.state.uniqueId)
      console.log(`MainWorldDisplay${props.state.uniqueId} useEffect DemoPropertiesChanges cleanup`)
    }
  }, [demoSpacesVersion]);

  // these would get flushed with every re-render, which would be bad. We need them to persist. So we put them in the state.What state?
  // previousCameraPosition: new THREE.Vector3(1e999, 0, 0),
  // timeSinceLastCameraMovement: 0,

  // what if I put them in a ref?

  // if the showingLeaves changed, and there's demoSpaces, then we need to re-calc the demo spaces.
  // if the demoSpaces changed, then we need to re-calc the demo spaces.
  // but, it doesn't happen often and the demo spaces are not always on. 

  function ReCalcTheDemoProperties(ourState: WorldDisplayState): oct.Cube[] {

    // console.log("ReCalcTheDemoProperties: TOP")

    // this will get them out of localStorage.getItem("DemoProperties")
    const demoCubes = RetreiveTheDemoCubes(ourState)
    if (props.showingLeaves.length === 0) { // no point
      console.log("ReCalcTheDemoProperties: no showingLeaves, returning all the demoCubes ", demoCubes.length)
      return demoCubes
    }

    // TODO: do this only if demoCubes or showingLeaves changed.

    const demoCubesFiltered = []

    // need to filter these!  
    const intersector = new oct.OctTreeIntersector(ourState.worldName)
    for (const treeStatus of props.showingLeaves) {
      intersector.AddKnownCube(treeStatus.cube)
    }

    for (const cube of demoCubes) {
      const [was, err] = intersector.CheckForIntersection(cube)
      if (was) {
        // console.log("ReCalcTheDemoProperties: demo cube ", cube, " intersects with showingLeaves, skipping")
        continue
      }
      demoCubesFiltered.push(cube)
    }

    return demoCubesFiltered
  }

  const demoCubes = ReCalcTheDemoProperties(props.state)

  function showAxis() {
    if (props.state.showOriginAxis) {
      return (<OriginAxisDisplay />)
    }
    return null
  }

  return (<>

    {showAxis()}

    {/* You guys are history.
      <DrawDogComponent cube={cube1} /> */}
    {/* <OutlineBoxComponent cube={cube1} errorMsg={undefined}
      propsMessage={"Under construction. Hard hats required."} />

    <OutlineBoxComponent cube={cube2} errorMsg={undefined} propsMessage={"this space 4 sale"} /> */}
    {/* <OutlineBoxComponent cube={cube3} errorMsg={undefined} propsMessage={"Condemned. "} /> */}

    <MakeBoxesForDemoSpaces worldDisplayState={props.state} demoCubeList={demoCubes} indexBase={1000 * 1000} />

    <MakeBoxesForShowingLeaves {...props} indexBase={props.indexBase} />

  </>)

}



// we'll use the names, sorted, so it can tell when it changes.
// no state for this. We pass it in to tigger.
// const [showingLeaves, setShowingLeaves] = React.useState("")

// never call setUniqueId. It's just a unique string to identify this instance of the component for pubsub purposes.
//const [uniqueId, setUniqueId] = React.useState(ourState.current.uniqueId)

// watch for changes in the demo spaces.
// will this trigger a re-render?
// no, pass these as props
// const [demoSpacesVersion, setDemoSpacesVersion] = React.useState("")

// const tmpstr = ReCalcTheDemoProperties(ourState.current) // this will get called on every render, which is not ideal. We could memoize it or something if we wanted to be sure it only gets called when the relevant state changes. For now it's just a console log so it's not a big deal.

// const [demoSpacesString, setDemoSpacesString] = React.useState(tmpstr)

// function setShowingLeavesString(str: string) {
//   setShowingLeaves(str)
// }

// no man, leaves get passed in.
// React.useEffect(() => {
//   // become addicted to showingLeaves state changes as mainWorldShowingLeavesChanges .

//   pubsub.subscribe("ShowingLeavesChanges", "mainWorld"+uniqueId,
//     (status: Object, err: Error) => {

//     console.log(`ShowingLeavesChanges${uniqueId} got pubsub message`, status, err)
//     if (status && typeof status === "string") {
//       setShowingLeavesString(status as string)
//     } else {
//       // got funny object from pubsub. Expected a string.
//       console.log(`ShowingLeavesChanges${uniqueId} got pubsub message but it's not a string`, status)
//       // setShowingLeavesString("") // and now there's none.
//     }
//   })

//   return () => {
//     pubsub.unsubscribe("ShowingLeavesChanges", "mainWorldShowingLeavesChanges")
//     console.log("ShowingLeavesChanges useEffect cleanup")
//   };
// }, []) // like once, ever. showingLeaves

// we should pass these in too.
// React.useEffect(() => {
//   console.log("MainWorldDisplay DemoPropertiesChanges" + uniqueId)
//   pubsub.subscribe("DemoPropertiesChanges", "MainWorldDisplay" + uniqueId, (status: Object, err: Error) => {

//     console.log(`MainWorldDisplay${uniqueId} got pubsub message`, status, err)
//     // I don't really care about the value I just want to re-trigger a calc of the property spaces.

//     const str = ReCalcTheDemoProperties(ourState.current)
//     setDemoSpacesString(str) // force a redraw.

//     if (status && typeof status === "string") {
//       setDemoSpacesVersion(status as string)
//     } else {
//       // got funny object from pubsub. Expected a string.
//       console.log(`MainWorldDisplay${uniqueId} got pubsub message but it's not a string`, status)
//       setDemoSpacesVersion("" + status) // and now it's off.
//     }
//   })
//   return () => {
//     pubsub.unsubscribe("DemoPropertiesChanges", "MainWorldDisplay" + uniqueId)
//     console.log(`MainWorldDisplay${uniqueId} useEffect DemoPropertiesChanges cleanup`)
//   };
// }, [demoSpacesVersion])


// if (ourState.current.uniqueId !== uniqueId) {
//   console.log("MainWorldDisplay uniqueId mismatch ", ourState.current.uniqueId, " to ", uniqueId)
// }

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
