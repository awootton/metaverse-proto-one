

import * as THREE from 'three'
import * as React from 'react'
import { useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { MainWorldDisplay, MainWorldDisplayProps } from './MainWorldDisplay'
import * as nav1 from './NavigatorTest1'
import * as bvts from '../knotfree-ts-lib/3d/BuildVisibleTreeStatus'
import * as oct from '../knotfree-ts-lib/3d/Dns8Tree'
import * as utils from '../knotfree-ts-lib/3d/utils'
import { RootState, useFrame, useThree } from '@react-three/fiber'

import * as sub from '../knotfree-ts-lib/avatars/PubSubSimple'
import { useTexture } from '@react-three/drei'
import { AsyncChannel } from './AsyncChannel'

import * as dnstypes from '../knotfree-ts-lib/3d/DnsTypes';
import axios from 'axios';
import { OrbitControls } from '@react-three/drei';
import { mainpubsub } from '../App';
import { CubeWithEdges } from './MiscCubeRenderElements'

// 10 meters east and a little south, and 1.75 meters up, which is about eye level for an average person standing on the ground. 

export const DefaultCameraPosition = new THREE.Vector3(-2, 1.75, 10);

const cube0: oct.Cube = {
    world: "testmain",
    x: 0,
    y: 0,
    z: 0,
    p: 0
}

export type AppCanvasProps = {
    // What do you REALLY need? 

    worldName: string

    // let's add a camera position here.
    initialCameraPosition: THREE.Vector3

    onlyShowOutlineBoxes: boolean // x-ray 
    UseOrbitalControls: boolean

    showOriginAxis: boolean

    showingLeaves: string[] // alwauys pass this in. 
}

// we have 3d we can have know the camera. We can trigger tree build and
// publish.

export default function AppCanvas(props: AppCanvasProps) {

    // console.log("AppCanvas starting with props: ", props)

    // these are never used. 
    // const fov = 75
    // const aspect = window.innerWidth / window.innerHeight
    // const near = 0.25
    // const far = 4000 // why? see camera.far = 5000 below

    // let initialcamera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    // initialcamera.position.copy(props.previousCameraPosition)
    // initialcamera.lookAt(0, props.previousCameraPosition.y, 0)

    const cameraControlRef = useRef<nav1.ControlCameraRef>(null);

    const currentCameraPosition = new THREE.Vector3(-2, 1.75, 12);

    function showNavInCanvas() {
        if (!props.UseOrbitalControls) {
            return (
                <nav1.NavigationCamera cameraRef={cameraControlRef} />
            )
        }
    }
    function showNavOutsizeCanvas() {
        if (!props.UseOrbitalControls) {
            return (
                <nav1.NavigationControls1 cameraRef={cameraControlRef} />
            )
        }
    }

    function showShowOrbitalControlInCanvas() {
        // where is the camera? 

        const currentCameraPosition = new THREE.Vector3(-2, 1.75, 12);

        const cam: [number, number, number] = [currentCameraPosition.x, currentCameraPosition.y, currentCameraPosition.z]

        const size = 16

        if (props.UseOrbitalControls) {
            return (
                <OrbitControls
                    target={cam} // Set the target to the current camera position
                    enableDamping={true} // Smooth stopping momentum
                    dampingFactor={0.05}
                    maxDistance={10 * size}     // Limit how far user can zoom out
                    minDistance={0.5 * size}      // Limit how far user can zoom in
                    maxPolarAngle={Math.PI / 2} // Prevent looking underneath the ground
                />
            )
        } else {
            return null
        }
    }

    return (
        <>
            <Canvas id="canvas"
                camera={{ position: currentCameraPosition }}
                style={{ backgroundColor: '#cfecf7' }}
            >
                <>
                    <CubeWithEdges cube={cube0} />

                    <AppCanvasInTheCanvas {...props} />

                    {showNavInCanvas()}

                    {showShowOrbitalControlInCanvas()}
                </>

            </Canvas >

            {showNavOutsizeCanvas()}
        </>
    )
}

let starttime = Date.now() - 8 * 1000 // start in 2 sec

function AppCanvasInTheCanvas(props: AppCanvasProps) {

    // const ourState = useRef<WorldDisplayState>(props.state)
    // what do we really need? We need the world name, and the unique id, and the onlyShowOutlineBoxes, and the showOriginAxis. That's it. The rest is local state.
    // it's in the props though. 

    let theCameraPosition: [number, number, number] = [0, 1.75, 0]
    let farClip = 4000

    // let previousCameraPosition = new THREE.Vector3(1e999, 0, 0)
    //let timeWhenWeWillRecalc = Date.now()
    // let [previousCameraPosition, setPreviousCameraPosition] = useState<THREE.Vector3>(new THREE.Vector3(1e999, 0, 0));

    function calculateCompassAngle(state: RootState): number {

        const camera = state.camera;

        const v = new THREE.Vector3();
        const camDir = camera.getWorldDirection(v);

        // Calculate the horizontal angle (azimuth) relative to the Z-axis
        const angle = Math.atan2(camDir.z, camDir.x);

        const compassAngle = angle;
        return compassAngle;
    }


    // I presume this state is the one from the current canvas.
    // tris is triggering all the damn time. 
    useFrame((state: RootState, delta: number) => {

        let doTheRecalc = false
        const endTime = Date.now()
        const passed_time = endTime - starttime
        if (passed_time > 10 * 1000) {
            starttime = Date.now()
            doTheRecalc = true
        } else {
            return
        }

        if (doTheRecalc) {

            const compassAngle = calculateCompassAngle(state)
            // console.log("calculateCompassAngle got Compass angle: ", compassAngle)
            sub.publish("CompassHeading", compassAngle)

            // console.log("TIME to recalc!!!: ")

            // should we force a draw another way?
            // let's setup the camera far clip to be 5000.
            const camera = state.camera
            camera.far = 5000; // Set your desired distance
            camera.updateProjectionMatrix(); // Critical: Update Three.js matrix
            doTheRecalc = true

            // more logic in here...

            if (doTheRecalc) {
                const camera = state.camera

                // theCameraPosition = [camera.position.x, camera.position.y, camera.position.z]
                //  farClip = camera.far

                let ourCameraPosition: THREE.Vector3 = camera.position.clone()

                // j/k console.log("It's been more than 250 epoc since the last tree traversal. Triggering new tree traversal.")
                // this is too complicated. What's happeneing?
                //         type neededstate = {
                //             worldName: string
                //             //  uniqueId: string
                //             onlyShowOutlineBoxes: boolean
                //             showOriginAxis: boolean // why????
                //         }
                //         const somestate: neededstate = {
                //             worldName: props.worldName,
                //             //    uniqueId: props.uniqueId,
                //             onlyShowOutlineBoxes: props.onlyShowOutlineBoxes,
                //             showOriginAxis: props.showOriginAxis why??
                //         }

                const args: ReqularTraversalSetupProps = {
                    worldName: props.worldName,
                    currentCameraPosition: camera.position.clone(),
                    // state: somestate,
                    worker: () => { }
                }

                ReqularTraversalSetup(args)

                // TraverseTheTree(props.worldName, camera.position, ourState.current);


                //         timeSinceLastCameraMovement = timestamp
                //         // trigger tree traversal and update cubes to render here.
                //         // and, here we go.
                //     // console.log("MainWorldDisplay" + ourState.current. uniqueId + ". Triggering new tree traversal.")

                //    TraverseTheTree(props.worldName, camera.position, ourState.current);

                //         const cameraPosition = new THREE.Vector3(camera.position.x, camera.position.y, camera.position.z)

                //         // const somestate: WorldDisplayState = ourState.current
                //         type neededstate = {
                //             worldName: string
                //             //  uniqueId: string
                //             onlyShowOutlineBoxes: boolean
                //             showOriginAxis: boolean
                //         }
                //         const somestate: neededstate = {
                //             worldName: props.worldName,
                //             //    uniqueId: props.uniqueId,
                //             onlyShowOutlineBoxes: props.onlyShowOutlineBoxes,
                //             showOriginAxis: props.showOriginAxis
                //         }

                //         const args: ReqularTraversalSetupProps = {
                //             worldName: somestate.worldName,
                //             currentCameraPosition: camera.position.clone(),
                //             // state: somestate,
                //             worker: () => { }
                //         }

                //         ReqularTraversalSetup(args)

                return
            }

            // let timeSinceLastCameraMovement = now

            // // This is the logic on when to trigger a tree traversal. 
            // // I'm not sure I like it. 
            // const camera = state.camera
            // camera.far = 5000; // Set your desired distance
            // camera.updateProjectionMatrix(); // Critical: Update Three.js matrix

            // theCameraPosition = [camera.position.x, camera.position.y, camera.position.z]
            // farClip = camera.far

            // props.initialCameraPosition.copy(camera.position)

            // const distanceMoved = camera.position.distanceTo(previousCameraPosition)
            // if (distanceMoved > 1) {

            //     // console.log("previousCameraPosition : ", ourState.current.previousCameraPosition, "Camera position: ", camera.position, "Distance moved: ", distanceMoved)
            //     // console.log("Camera moved more than 1 meter. Distance moved: ", distanceMoved)
            //     previousCameraPosition.copy(camera.position)
            //     // trigger tree traversal and update cubes to render here.
            //     const timestamp: number = Date.now();
            //     const deltaTime = timestamp - timeSinceLastCameraMovement
            //     if (deltaTime > 250) {
            //         // console.log("It's been more than 250 ms since the last tree traversal. Triggering new tree traversal.")
            //         timeSinceLastCameraMovement = timestamp
            //         // trigger tree traversal and update cubes to render here.
            //         // and, here we go.
            //         // console.log("MainWorldDisplay" + ourState.current. uniqueId + ". Triggering new tree traversal.")

            // no           TraverseTheTree(ourState.current.worldName, camera.position, ourState.current);
            //         const cameraPosition = new THREE.Vector3(camera.position.x, camera.position.y, camera.position.z)

            //         // const somestate: WorldDisplayState = ourState.current
            //         type neededstate = {
            //             worldName: string
            //             //  uniqueId: string
            //             onlyShowOutlineBoxes: boolean
            //             showOriginAxis: boolean
            //         }
            //         const somestate: neededstate = {
            //             worldName: props.worldName,
            //             //    uniqueId: props.uniqueId,
            //             onlyShowOutlineBoxes: props.onlyShowOutlineBoxes,
            //             showOriginAxis: props.showOriginAxis
            //         }

            //         const args: ReqularTraversalSetupProps = {
            //             worldName: somestate.worldName,
            //             currentCameraPosition: camera.position.clone(),
            //             // state: somestate,
            //             worker: () => { }
            //         }

            //         ReqularTraversalSetup(args)

            //     } else {
            //     }
            // } else {
            //     // reset the timer? no, then it would never trigger if the camera is moving slowly. 
            //     // timeSinceLastCameraMovement = Date.now()
            // }

            // console.log("delta: ", delta, "Camera position: ", camera.position)
            // Called every frame
            // const camera = state.camera
            // console.log("Camera position: ", camera.position)
        }
    })

    {/* <Stats /> */ }

    // perf was minimal
    // calls troika the font problem:   <Perf position="bottom-right" />
    // and there's nothing to see but speed anyway.

    return (
        <>

            <ambientLight intensity={0.65} />

            <directionalLight // make these the same everywhere we use light.
                position={[-10, 10, 5]}
                intensity={1.5}
            />

            {/* <Background /> */}
            {/* <Backdrop /> */}
            {/* <Backcube position={theCameraPosition} farClip={farClip} /> */}

            <MainWorldDisplay

                // add demo spaces here too.? No we get them from storage.
                // what do we really NEED here?
                worldName={props.worldName}
                //   uniqueId={props.uniqueId}
                onlyShowOutlineBoxes={props.onlyShowOutlineBoxes}
                showOriginAxis={props.showOriginAxis}
                showingLeaves={props.showingLeaves}
            //  indexBase={1000}

            />
        </>
    )
}

export function Background() {

    const texture = useTexture('/starmaps/stars.jpeg')
    // 1. Load your texture image (must be in your public folder or a valid URL)
    // const texture = useLoader(THREE.TextureLoader, '/your-texture.jpg')

    // 2. Fix potential washed-out colors by setting the proper color space
    texture.colorSpace = THREE.SRGBColorSpace

    return (
        // 3. Attach the texture directly to the parent scene background
        <primitive attach="background" object={texture} />
    )
}


export function Backdrop() {
    // Easily load your background texture using Drei's hook
    const texture = useTexture('/starmaps/stars.jpeg')

    return (
        <mesh position={[0, 0, -5]}> {/* Keep it safely behind other meshes */}
            {/* A plane that spans a large size to cover the camera frustum */}
            <planeGeometry args={[50, 50]} />
            <meshBasicMaterial map={texture} depthTest={false} />
        </mesh>
    )
}

type BackcubeProps = {
    position: [number, number, number]
    farClip: number
}

export function Backcube(props: BackcubeProps) {
    // Easily load your background texture using Drei's hook
    const texture = useTexture('/starmaps/stars.jpeg')
    // const distance = side/2 * Math.sqrt(3) // distance from center to corner of cube
    // and distance is farClip
    // so side must be distance / (sqrt(3)/2) = distance * 2/sqrt(3)
    let side = props.farClip * 2 / Math.sqrt(3)
    side = side * .25

    return (
        <mesh position={props.position}> {/* Keep it safely behind other meshes */}
            {/* A box that spans a large size to cover the camera frustum */}
            <boxGeometry args={[side, side, side]} />
            {/* <meshBasicMaterial map={texture} depthTest={false} /> */}
            <meshStandardMaterial map={texture} side={THREE.BackSide} />

        </mesh>
    )
}

async function getChildBitsCachedAllFromServer(worldName: string): Promise<string> {
    let rawLargeString = ""
    try {

        let server = dnstypes.knotfreeServer; // default to local server for testing.

        const response = await axios.get(server + "/api1/getAllChildBitCache?world=" + worldName, {
            // Allow unlimited content sizes (default is ~10MB)
            maxContentLength: Infinity,
            maxBodyLength: Infinity,

            // Tell Axios to leave the response as a raw string instead of trying to parse it
            transformResponse: [(data) => data],
        });

        rawLargeString = response.data;
        console.log(`Fetched string length: ${rawLargeString.length}`);

    } catch (error) {
        console.error('getChildBitsCachedAllFromServer Error fetching data:', error);
    }
    return rawLargeString;
}

type TraversalRunnerStateArg = {
    worldName: string
    currentCameraPosition: THREE.Vector3
    // state: WorldDisplayState,
    // worker: () => any
}

export type TraversalRunnerStruct = {
    runner_state: TraversalRunnerStateArg,
    worker: () => any
};

const traverseTreeChannel = new AsyncChannel<TraversalRunnerStruct>();

// Will these just run or do I have to pull them?
// what do they REALLY need

type ReqularTraversalSetupProps = {
    worldName: string
    currentCameraPosition: THREE.Vector3
    // state: WorldDisplayState,
    worker: () => any
};

export function ReqularTraversalSetup(args: ReqularTraversalSetupProps) {
    const task: TraversalRunnerStruct = {
        runner_state: args,
        worker: async () => {

            // console.log("ReqularTraversalSetup called. ")

            await localTraverseTheTree(task.runner_state.worldName, task.runner_state.currentCameraPosition)
        }
    };
    traverseTreeChannel.send(task);
}

// What do we really need? 
// this is how App boots up the tree traversal. It will fetch the child bits from the server, fill the cache, and then trigger a tree traversal.

type StartLoadFromDbAndRunStruct = {
    worldName: string
    currentCameraPosition: THREE.Vector3
    worker: () => any
};

export function StartLoadFromDbAndRun(props: StartLoadFromDbAndRunStruct) {

    // console.log("StartLoadFromDbAndRun called. StartLoadFromDbAndRun called. StartLoadFromDbAndRun called. ")

    const task: TraversalRunnerStruct = {
        runner_state: props,
        worker: async () => {

            const rawLargeString = await getChildBitsCachedAllFromServer(task.runner_state.worldName);
            // now we have the string. Let's fill the cache and then traverse the tree.

            if (!rawLargeString || rawLargeString.length === 0) {
                console.error("StartLoadFromDbAndRun: No data received from server for world: ", task.runner_state.worldName);
                return;
            }
            // console.log("StartLoadFromDbAndRun called. We have the cache. ", rawLargeString.length)

            const parsed = JSON.parse(rawLargeString);
            if (!(parsed instanceof Array)) {
                console.error("StartLoadFromDbAndRun: Expected an array of entries but got something else. rawLargeString: ", rawLargeString);
                return;
            }

            const cacheEntries2 = new Map<string, string>(JSON.parse(rawLargeString));

            oct.SetTheWholeChildBitsLocalCache(cacheEntries2);
            // console.log("child bits entries count: ", cacheEntries2.size)
            // why wait ? await 
            localTraverseTheTree(task.runner_state.worldName, task.runner_state.currentCameraPosition)
        }
    };
    traverseTreeChannel.send(task);
}

// Have to pull them!  Yes, this is how we must pull them.
async function runTraversalTasks() {
    for await (const task of traverseTreeChannel) {

        // if there's many I'd like to know, or skip some maybe. 
        // console.error("runTraversalTasks: has a task to run.");
        // they take like a ms and happen every couple of seconds. no big deal.
        // it does force a refresh.

        await task.worker();
    }
    console.log("runTraversalTasks: Yikes! is this ever supposed to quit? no.");
}
runTraversalTasks(); // Start the async loop to process tasks


// How do I trigger the tree traversal and render those cubes in here? Solved by caller.
// Maybe every time the camera moves more than a meter and it's been 250 ms since the last traversal, 
// and, also if it's never been done yet. 
// we would also need to report the cubes whatever loads the iFrames.

// this state has to live in the parent component. 
// var previousCameraPosition: THREE.Vector3 = new THREE.Vector3(1e999, 0, 0)
// var timeSinceLastCameraMovement: number = 0
// // what does it mean to have two copies of THIS gadget? 
// var theGlobalTree = new bvts.BuildVisibleTreeStatus(myMapCacheIntf) // nothing? does it matter?

// TraverseTheTree will build the tree and update the cubes to render based on the camera position.
// it needs a callback for when it's done so it can trigger something. no - it will publish a "ShowingLeavesChanges" event with the new cubes to render.

// note that TraverseTheTree orders up a traversal but doesn't wait. 
// When it's done it will publish a "ShowingLeavesChanges" event with the new cubes to render.

async function localTraverseTheTree(worldName: string, position: THREE.Vector3) {

    // console.log("TraverseTheTree called. TraverseTheTree called. TraverseTheTree called. Traversing the tree and updating cubes to render. position: ", position, "worldName: ", worldName)


    // is it worth detecting that the leaf list is the same?
    // let's try it. 
    // const setOfLeavesBefore = new Set(state.theGlobalTree.showingLeaves.keys())

    // await treeGenerator.BuildVisibleTree(worldName, position)
    // const showingLeaves = treeGenerator.showingLeaves.values()
    // I was always curious if the keys match the names in the values. ?
    // for (const [key, value] of showingLeaves.entries()) {
    //     if (key !== value.name) {   
    //         console.info("TraverseTheTree: Did not expect that. key and value.name do not match. key: ", key, " value.name: ", value.name)
    //     }
    // }

    const treeGenerator = new bvts.BuildVisibleTreeStatus()

    var err: Error | null = null
    const startTime = Date.now()
    const errPromise = treeGenerator.BuildVisibleTree(worldName, position)
    err = await errPromise
    const endTime = Date.now()

    console.log("Time taken for TraverseTheTree: ", endTime - startTime, "ms. Leaves found=", treeGenerator.showingLeaves.size)
    // after the first one it's saying 0 ms. Which is correct. It's actually about 0.1

    if (err != null) {
        console.error("Error in TraverseTheTree: FOUND NO WORLD TO RENDER!", err)
        //  when this happens we should set an error message somewhere TODO:
        // and then we pubish that there are no leaves to render.
        mainpubsub.publish("ShowingLeavesChanges", [])
        mainpubsub.publish("LoadingMessage", "World load failed.")

    } else {
        // update cubes to render based on the visible tree. 
        // this is where we would trigger a re-render in React with the new cubes to render. 
        // null is correct. Means no error. 

        // this is the result: 
        // console.log("TraverseTheTree Visible cubes: ", state.theGlobalTree.showingLeaves)
        // const keyList = Array.from(state.theGlobalTree.showingLeaves.keys())
        // keyList.sort()
        // too long to log: console.log("TraverseTheTree publishing ShowingLeavesChanges ", keyList.join(","))

        // This little fucker will let you publish the wrong type! 
        //const leavesToPublish: string[] = Array.from(treeGenerator.showingLeaves.values())
        const leafNamesToPublish: string[] = Array.from(treeGenerator.showingLeaves.keys())

        // console.log("TraverseTheTree publishing ShowingLeavesChanges ", leafNamesToPublish.join(","))

        mainpubsub.publish("ShowingLeavesChanges", leafNamesToPublish)
        mainpubsub.publish("LoadingMessage", "We good.")
        // we must also inform the keeper of the Iframes. - he's subscribing.
    }
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

