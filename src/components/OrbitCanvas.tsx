import React, { useRef, useEffect } from 'react'

import { Canvas } from '@react-three/fiber'
import { MainWorldDisplay } from './MainWorldDisplay'

import * as oct from '../knotfree-ts-lib/3d/DomainNameOctTree'

import { RootState, useFrame, useThree } from '@react-three/fiber'

import { Vector3 } from 'three'


// a make a canvas thst shows MainWorldDisplay, Just like the other one.
// orbit around the box.

import { OrbitControls } from '@react-three/drei';
import { Stats } from '@react-three/drei'
import { Perf } from 'r3f-perf'
import { useTexture } from '@react-three/drei'


import * as bvts from '../knotfree-ts-lib/3d/BuildVisibleTreeStatus';
// import { WorldDisplayState } from './WorldDisplayState';
import { Background, Backdrop, Backcube } from './AppCanvas';

// const appVisibleTree = new bvts.BuildVisibleTreeStatus(myMapCacheIntf);

export type OrbitalProps = {
  // spaces: string // comma delimited. UrlCubes to load and display in the scene, for demo purposes. This would be set by the dialog input and saved to local storage when the user clicks OK.
  // color?: string // optional color for the boxes, default to green. get rid of this.
  // worldDisplayState: WorldDisplayState

  // these are better when they are FLAT

  worldName: string

  // previousCameraPosition: THREE.Vector3 // = new THREE.Vector3(1e999, 0, 0)
  // timeSinceLastCameraMovement: number // = 0
  currentCameraPosition: THREE.Vector3 // = new THREE.Vector3(1e999, 0, 0)
  // and velocity! and size ! 

  // what does it mean to have two copies of THIS gadget? It starts clean every time so what's the point in saving it?
  // every instance of MainWorldDisplay should have it's own copy of the BuildVisibleTreeStatus, but they should share the same cache.
  // theGlobalTree: bvts.BuildVisibleTreeStatus // = new bvts.BuildVisibleTreeStatus(myMapCacheIntf)

  uniqueId: string // this is a unique identifier for the component instance, so we can use it to subscribe to pubsub messages and avoid conflicts between multiple instances.
  showOriginAxis: boolean // = true should we pass these around as props or just have them in local storage? 
  // CP: I think we should have them in local storage, so they can be shared between different instances of the component.
  // Well, copilot has no class so we're keepkng them here. 

  onlyShowOutlineBoxes: boolean // = false, don't save this in storage.
  toggleOnlyShowOutlineBoxes: () => void


  showingLeaves: oct.TreeStatus[] // the leaves to show in the scene, for demo purposes. This would be set by the dialog input and saved to local storage when the user clicks OK.

  shouldShowOrbitalCanvasDisplay: boolean // turn the whole thing off when it's hidden.

}

export default function OrbitCanvas(orbitalProps: OrbitalProps) {

  console.log("OrbitCanvas starting with props: ", orbitalProps)
  //console.log("OrbitCanvas starting with leaves: ", orbitalProps.showingLeaves.length)
  console.log("OrbitCanvas shouldShowOrbitalCanvasDisplay: ", orbitalProps.shouldShowOrbitalCanvasDisplay)

  // default to looking at the origin, but ideally would look at the center of the loaded property or properties. 
  // For now we can just look at the origin and make sure the demo properties are located there.
  // target position should be where you were standing when you clicked the button to open the orbit canvas. 

  const targetPosition: [number, number, number] = [0, 1.75, -40];
  const size = 2 ** 6;


  // TODO: fix the target position to something ...

  // do they parse? lol
  // const [spacesArray, error] = oct.ParseCubeList(orbitalProps.spaces)
  // let showTheSpaces = true
  // console.log("OrbitCanvas spacesArray ", spacesArray)
  // if (error && orbitalProps.spaces !== "") {
  //   // and empty list is not really an error 
  //   console.error("Error parsing spaces: ", error)
  //   showTheSpaces = false
  // } else {
  //   // if they do parse then center on the first one.
  //   if (spacesArray.length > 0) {
  //     const firstCube = spacesArray[0]
  //     const cubeSize = 2 ** firstCube.p
  //     targetPosition[0] = firstCube.x + cubeSize / 2
  //     targetPosition[1] = firstCube.y + cubeSize / 2
  //     targetPosition[2] = firstCube.z + cubeSize / 2
  //   }
  // }

  // function MakeBoxesForSpaces() {
  //   if (!showTheSpaces) return null
  //   return (
  //     <>
  //       {spacesArray.map((cube, index) => (
  //         <OutlineBoxComponent key={index} cube={cube} errorMsg={undefined} color={"green"} />
  //       ))}
  //     </>
  //   )   sky blue: \(\text{\#87CEFA}\)  #cfecf7 
  // }

  if (!orbitalProps.shouldShowOrbitalCanvasDisplay) {
    return (
      <div>
        canvas turned off.
      </div>
    )
  }

  console.log("OrbitCanvas we don't see this if it's OFF: ", orbitalProps.shouldShowOrbitalCanvasDisplay)

  return (
    <>

      <Canvas id="canvas"
        style={{ backgroundColor: '#cfecf7 ' }}
      >

        <OrbitCanvasInTheCanvas

          //  worldDisplayState={orbitalProps.worldDisplayState}
          showingLeaves={orbitalProps.showingLeaves}
          shouldShowOrbitalCanvasDisplay={orbitalProps.shouldShowOrbitalCanvasDisplay} 
          worldName={''} 
          currentCameraPosition={new Vector3} 
          uniqueId={''} showOriginAxis={false} 
          onlyShowOutlineBoxes={false} toggleOnlyShowOutlineBoxes={function (): void {
            throw new Error('Function not implemented.')
          } }

        />

      </Canvas >
    </>
  )

}

// only the 3d part
export function OrbitCanvasInTheCanvas(orbitalProps: OrbitalProps) {

  let theCameraPosition: [number, number, number] = [0, 1.75, 0]
  let farClip = 9999

  const size = 2 ** 6;


  useFrame((state: RootState, delta: number) => {

    const camera = state.camera

    camera.far = 5000; // Set your desired distance
    camera.updateProjectionMatrix(); // Critical: Update Three.js matrix


    theCameraPosition = [camera.position.x, camera.position.y, camera.position.z]
    farClip = camera.far

  })

  //const targetPosition: [number, number, number] = [0, 0, 0];
  // const targetPosition: [number, number, number] = [orbitalProps.worldDisplayState.currentCameraPosition.x, orbitalProps.worldDisplayState.currentCameraPosition.y, orbitalProps.worldDisplayState.currentCameraPosition.z];

  console.log("OrbitCanvasInTheCanvas starting with position: ", orbitalProps.currentCameraPosition)

  return (
    <>

      {/* <Stats /> */}
      <Perf position="bottom-right" minimal />

      <ambientLight intensity={0.25} />

      {/* Positioned light that can cast shadows */}
      <directionalLight
        position={[-10, 10, 5]}
        intensity={1.5}
      />

      <OrbitControls
        target={orbitalProps.currentCameraPosition.toArray() as [number, number, number]} // Set the target to the current camera position
        enableDamping={true} // Smooth stopping momentum
        dampingFactor={0.05}
        maxDistance={10 * size}     // Limit how far user can zoom out
        minDistance={0.5 * size}      // Limit how far user can zoom in
        maxPolarAngle={Math.PI / 2} // Prevent looking underneath the ground
      />

      {/* <Background /> */}
      {/* <Backdrop /> */}
      {/* <Backcube position={theCameraPosition} farClip={farClip} /> */}

      <MainWorldDisplay

        // demoSpaces={orbitalProps.spaces}
      //  state={orbitalProps.worldDisplayState}
        showingLeaves={orbitalProps.showingLeaves}
        
  //      indexBase={1000}
        worldName={orbitalProps.worldName}
        onlyShowOutlineBoxes={orbitalProps.onlyShowOutlineBoxes}  
        showOriginAxis={orbitalProps.showOriginAxis}
      //  uniqueId='929877' 


      // {...orbitalProps.worldDisplayState} // this is a bit of a mess. maybe we should just pass the whole state object as a prop, instead of trying to spread it out into individual props. but this is fine for now, not ideal. 
      />
    </>
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


