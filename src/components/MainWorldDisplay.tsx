import React from 'react';

import * as THREE from 'three'
import { Canvas, RootState, useFrame, useThree } from '@react-three/fiber'


import * as oct from '../knotfree-ts-lib/3d/UrlOctTree';
import { OriginAxisDisplay } from './OriginAxisDisplay';

import { OutlineBoxComponent } from './OutlineBoxComponent'
import { DrawDogComponent } from './Shiba';
import * as octload from '../knotfree-ts-lib/3d/OctTreeLoaders';
import { myMapCacheIntf } from '../knotfree-ts-lib/3d/CacheIntf'; // just a map. 
import * as bvts from '../knotfree-ts-lib/3d/BuildVisibleTreeStatus';
import { WorldDisplayState } from './WorldDisplayState';

// lose this crap.
// 5th 16 m west cube south by 1*16 m
const cube1: oct.Cube = {
  world: "testmain",
  x: -1 * 2 ** 4,
  y: 0,
  z: -5 * 2 ** 4,
  p: 4
}

// 5th 16 m west cube south by 2*16 m

const cube2: oct.Cube = {
  world: "testmain",
  x: -2 * 2 ** 4,
  y: 0,
  z: -5 * 2 ** 4,
  p: 4
}

const cube3: oct.Cube = {
    world: "testmain",
    x: 2 * 2 ** 2,
    y: 0,
    z: -5 * 2 ** 2,
    p: 2
}

let samples = "meta_group_id.testmain-0n0u0e4p,meta_group_id.testmain-1n0u0e4p,meta_group_id.testmain-2n0u0e4p"
// save in local storage for later?
let sampleArray = samples.split(",").map(s => s.trim())
console.log("sampleArray ", sampleArray)

// I want to show demo properties in green. Where to put that? local storage?

interface MainWorldDisplayProps {

  state: WorldDisplayState
  //  worldName: string
  demoSpaces: string // comma delimited list of UrlCubes to show as green boxes in the scene, for demo purposes. This would be set by the dialog input and saved to local storage when the user clicks OK.
}

// How do I trigger the tree traversal and render those cubes in here?
// Maybe every time the camera moves more than a meter and it's been 250 ms since the last traversal, 
// and, also if it's never been done yet. 
// we would also need to report the cubes whatever loads the iFrames.
// should I useRef or use the pubsub here?

// this doesn't work because the other component is still running.

// this state has to live in the parent component. 
// var previousCameraPosition: THREE.Vector3 = new THREE.Vector3(1e999, 0, 0)
// var timeSinceLastCameraMovement: number = 0
// // what does it mean to have two copies of THIS gadget? 
// var theGlobalTree = new bvts.BuildVisibleTreeStatus(myMapCacheIntf)

// TraverseTheTree will build the tree and update the cubes to render based on the camera position.
// it needs a callback for when it's done so it can trigger something. 
export async function TraverseTheTree(worldName: string, position: THREE.Vector3, state: WorldDisplayState) {

  // console.log("TraverseTheTree called. Traversing the tree and updating cubes to render. position: ", position, "worldName: ", worldName)

  const startTime = Date.now()
  const errPromise = state.theGlobalTree.BuildVisibleTree(worldName, position)
  const err = await errPromise
  const endTime = Date.now()
  console.log("Time taken for TraverseTheTree: ", endTime - startTime, "ms")
  // after the first one it's saying 0 ms. Which is correct. It's actually about 0.1

  if (err instanceof Error) {
    console.error("Error in TraverseTheTree: ", err)
  } else {
    // update cubes to render based on the visible tree. 
    // this is where we would trigger a re-render in React with the new cubes to render. 
    // null is correct. Means no error. 

    // console.log("Cache: ", myMapCacheIntf.keys())

    // this is the result: 
    console.log("TraverseTheTree Visible cubes: ", state.theGlobalTree.showingLeaves)
    // is it new? do we p
  }
}

export function MainWorldDisplay(props: MainWorldDisplayProps) {

  console.log("MainWorldDisplay props ", props)

  useFrame((state: RootState, delta: number) => {

    const camera = state.camera

    const distanceMoved = camera.position.distanceTo(props.state.previousCameraPosition)
    if (distanceMoved > 1) {

      // console.log("Camera is now : ", camera)
      // console.log("previousCameraPosition : ", props.state.previousCameraPosition)

      // console.log("Camera moved more than 1 meter. Distance moved: ", distanceMoved)
      props.state.previousCameraPosition.copy(camera.position)
      // trigger tree traversal and update cubes to render here.
      // maybe use a pubsub event for this? or just call the function directly if it's in the same component?
      const timestamp: number = Date.now();
      const deltaTime = timestamp - props.state.timeSinceLastCameraMovement
      if (deltaTime > 250) {
        // console.log("It's been more than 250 ms since the last tree traversal. Triggering new tree traversal.")
        props.state.timeSinceLastCameraMovement = timestamp
        // trigger tree traversal and update cubes to render here.
        // and, here we go.
        TraverseTheTree(props.state.worldName, camera.position, props.state);
      } else {
      }
    } else {
      // reset the timer? no, then it would never trugger if the camera is moving slowly. 
      // timeSinceLastCameraMovement = Date.now()
    }

    // console.log("delta: ", delta, "Camera position: ", camera.position)
    // Called every frame
    // const camera = state.camera
    // console.log("Camera position: ", camera.position)

  })

  function MakeBoxesForDemoSpaces() {
    if (!props.demoSpaces)
      return null
    const tmp = props.demoSpaces.trim()
    const spacesArray = tmp.split(",").map(s => s.trim())
    return (
      <>
        {spacesArray.map((cubeStr, index) => {
          const [cube, error] = oct.stringToCube(cubeStr)
          if (error) {
            console.error("Error parsing cube string: ", cubeStr, error)
            const errStr = error.message
            return <div>Error parsing cube string: {cubeStr}. {errStr}</div>
          }
          return <OutlineBoxComponent key={index} cube={cube} errorMsg={undefined} color={"#39FF14"}
            propsMessage={"this space 4 sale"} />
        })}
      </>
    )
  }
  return (<>

    <OriginAxisDisplay />


    <DrawDogComponent cube={cube1} />
    <OutlineBoxComponent cube={cube1} errorMsg={undefined}
      propsMessage={"Under construction. Hard hats required."} />

    <OutlineBoxComponent cube={cube2} errorMsg={undefined} propsMessage={"this space 4 sale"} />
    <OutlineBoxComponent cube={cube3} errorMsg={undefined} propsMessage={"Condemned. "} />

    <MakeBoxesForDemoSpaces />

  </>)
}

