import React, { useRef, useEffect } from 'react'


import { Canvas } from '@react-three/fiber'
import { MainWorldDisplay } from './MainWorldDisplay'

import * as oct from '../knotfree-ts-lib/3d/UrlOctTree'

// a make a canvas thst shows MainWorldDisplay, Just like the other one.
// orbit around the box.

import { OrbitControls } from '@react-three/drei';
import { OutlineBoxComponent } from './OutlineBoxComponent';

import * as bvts from '../knotfree-ts-lib/3d/BuildVisibleTreeStatus';
import { myMapCacheIntf } from '../knotfree-ts-lib/3d/CacheIntf'; // just a map.

// const appVisibleTree = new bvts.BuildVisibleTreeStatus(myMapCacheIntf);

export type Props = {
  spaces: string // comma delimited. UrlCubes to load and display in the scene, for demo purposes. This would be set by the dialog input and saved to local storage when the user clicks OK.
  color?: string // optional color for the boxes, default to green
  // worldName: string // the world to load the spaces from. This is needed because the UrlCubes don't include the world name, and we need it to fetch the properties for the cubes. We could also include the world name in the UrlCubes, but that would be redundant and more complicated to parse.
  state: {
    worldName: string
    previousCameraPosition: THREE.Vector3
    timeSinceLastCameraMovement: number
    theGlobalTree: bvts.BuildVisibleTreeStatus
  }
}

export default function OrbitCanvas(orbitalProps: Props) {

  // default to looking at the origin, but ideally would look at the center of the loaded property or properties. 
  // For now we can just look at the origin and make sure the demo properties are located there.
  const targetPosition: [number, number, number] = [0, 1.75, 0];
  const size = 2 ** 6;

  // do they parse? lol
  const [spacesArray, error] = oct.ParseCubeList(orbitalProps.spaces)
  let showTheSpaces = true
  console.log("OrbitCanvas spacesArray ", spacesArray)
  if (error) {
    // and empty list is not really an error console.error("Error parsing spaces: ", error)
    showTheSpaces = false
  } else {
    // if they do parse then center on the first one.
    if (spacesArray.length > 0) {
      const firstCube = spacesArray[0]
      const cubeSize = 2 ** firstCube.p
      targetPosition[0] = firstCube.x + cubeSize / 2
      targetPosition[1] = firstCube.y + cubeSize / 2
      targetPosition[2] = firstCube.z + cubeSize / 2
    }
  }

  // function MakeBoxesForSpaces() {
  //   if (!showTheSpaces) return null
  //   return (
  //     <>
  //       {spacesArray.map((cube, index) => (
  //         <OutlineBoxComponent key={index} cube={cube} errorMsg={undefined} color={"green"} />
  //       ))}
  //     </>
  //   )
  // }

  return (
    <>

      <Canvas id="canvas"
      >

        <ambientLight intensity={0.25} />

        {/* Positioned light that can cast shadows */}
        <directionalLight
          position={[10, 10, 5]}
          intensity={1.5}
        />

        <OrbitControls
          target={targetPosition}
          enableDamping={true} // Smooth stopping momentum
          dampingFactor={0.05}
          maxDistance={10 * size}     // Limit how far user can zoom out
          minDistance={0.5 * size}      // Limit how far user can zoom in
          maxPolarAngle={Math.PI / 2} // Prevent looking underneath the ground
        />

        <MainWorldDisplay demoSpaces={orbitalProps.spaces} state={orbitalProps.state} />

      </Canvas >
    </>
  )
  
}

