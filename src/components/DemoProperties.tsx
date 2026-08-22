import React, { useMemo, useRef } from 'react';

import { Text } from '@react-three/drei';

import { RootState, useFrame } from '@react-three/fiber';

import * as THREE from 'three';

import * as oct from '../knotfree-ts-lib/3d/Dns8Tree';
// import { WorldDisplayState } from './WorldDisplayState';


// I don't know where to put this stuff.
// or even how to properly share it between components.
// I'm just a cave man React developer. urg blf nrt

// returns a comma delimited list of cube names. Presumably accurate,
// export function Re Calc TheDemoProperties(worldDisplayState: WorldDisplayState): string {
//     console.log("Re Calc TheDemoProperties called")
//     // do something.
//     // we want to do this once every hardly ever but always just enough. lol.
//     let str = localStorage.getItem("DemoProperties")
//     if (str === null) {
//         console.log("ReCalcTheDemoProperties no DemoProperties in localStorage")
//         str = ""
//     }
//     console.log("ReCalcTheDemoProperties got DemoProperties from localStorage: ", str)
//     let [theList, err] = oct.FromXToY(str)
//     if (err == null) {
//         // console.log("ReCalcTheDemoProperties parsed the DemoProperties string into cubes: ", theList)
//         return theList
//     }
//     const [spacesArray, error] = oct.ParseCubeList(str)
//     if (error == null) {
//         // console.error("ReCalcTheDemoProperties error parsing DemoProperties string: ", error)
//         return spacesArray.map(cube => oct.CubeToString(cube)[0]).join(",")
//     }
//     return ""
// }

// RetreiveTheDemoCubes returns an array of cubes, from a text description.
// It's supposed to from be a comma delimited list or else a from x to y expression.
// It will parse the string and return an array of cubes. If it can't parse the string, it will return an empty array.
export function RetreiveTheDemoCubes(): oct.Cube[] {
    // console.log("RetreiveTheDemoCubes called")

    // we want to do this once every hardly ever but always just enough. lol.
    let str = localStorage.getItem("DemoProperties")
    if (str === null) {
        // console.log("RetreiveTheDemoCubes no DemoProperties in localStorage")
        str = ""
    }
    // console.log("RetreiveTheDemoCubes got DemoProperties from localStorage: ", str)
    let [theList, err] = oct.FromXToY(str)
    if (err == null) {
        // console.log("RetreiveTheDemoCubes parsed the DemoProperties string into cubes: ", theList)
        str = theList
        // keep going.
    }
    const [spacesArray, error] = oct.ParseCubeList(str)
    if (error == null) {
        // console.error("RetreiveTheDemoCubes      error parsing DemoProperties string: ", error)
        return spacesArray
    }
    return []
}

// MakeBoxesForDemoSpaces will draw green boxes for the cubes in the demoSpaces prop, which is a comma delimited list of UrlCubes. 
// first we would want to cull the ones that are intersecting existing properties. TODO:
// Then we just accuculate the edges and draw those as a batch.
// Then we draw the ones in the frustum and close enough where the user could read the address on the floor of the box.
// we could also draw the ones that are further away but maybe just as a dot or something, to show where they are. ?? maybe

// the key is the name of the cube
type MakeBoxesForDemoSpacesProps = {
    worldName: string
    demoCubeList: oct.Cube[] // this is the list of cubes to draw. We will get this from the DemoProperties string in localStorage and parse it. We could also pass the cubes directly as a prop if we wanted to, but this way we can keep the parsing logic in one place and also easily trigger a re-render when the DemoProperties string changes.
    color?: string // optional color for the boxes. If not provided, will default to green.

    // indexBase: number // since they share these with leaves they need different numbers.
    // always just get this from localStorage when we need it
    // demoSpaces: string // comma delimited list of UrlCubes to draw as green boxes. This is for demo purposes, to show how we can draw boxes for specific spaces. In a real application, we would want to draw boxes for all the spaces that are for sale, or that are owned by the user, or something like that. We could also include other information in the props, such as the color of the boxes, or the message to display when hovering over the boxes, etc.
}

// The main entry point from MainWorldDisplay.
export function MakeBoxesForDemoSpaces(props: MakeBoxesForDemoSpacesProps) {

    const cubeList = props.demoCubeList// CalcTheDemoCubes(props) // this will get the cubes from the DemoProperties string in localStorage and parse them. We could also pass the cubes directly as a prop if we wanted to, but this way we can keep the parsing logic in one place and also easily trigger a re-render when the DemoProperties string changes.
    // also return a version of the old slow way.
    const color = props.color || "#39FF14"
    // console.log("MakeBoxesForDemoSpaces with color: ", color, " and cubeList length: ", cubeList.length)

    // MakeBoxesForDemoSpacesLines is just the lines - LINES I tell you.
    // OutlineBoxComponentTextOnly has the text - it calls OutlineBoxComponentTextOnly 

    // MakeOutlineBoxesForDemoSpaces calls OutlineBoxComponentTextOnly 

    return (
        <>
            <MakeOutlineBoxesForDemoSpaces
                {...props}
            />

            <MakeBoxesForDemoSpacesLines {...props}
            />
        </>
    )
}

// MakeBoxesForDemoSpaces will draw green boxes for the cubes in the demoSpaces prop, which is a comma delimited list of UrlCubes.
// does is re calc often or just once. This is REAL fast.
// I would like to skip the ones behind me but hen I would have to recalc every camera move.

export function MakeBoxesForDemoSpacesLines(props: MakeBoxesForDemoSpacesProps) {

    const cubeList = props.demoCubeList // this will get the cubes from the DemoProperties string in localStorage and parse them. We could also pass the cubes directly as a prop if we wanted to, but this way we can keep the parsing logic in one place and also easily trigger a re-render when the DemoProperties string changes.

    let color = props.color || "#39FF14"

    // console.log("MakeBoxesForDemoSpaces with color: ", color, " and cubeList length: ", cubeList.length)

    if (!cubeList)
        return null
    if (cubeList.length === 0)
        return null
    // assuming there's a cube list
    const [aname, err] = oct.CubeToString(cubeList[0])
    if (err) { // thinks than can never happen
        console.error("MakeBoxesForDemoSpacesLines error converting cube to string: ", err)
        return null
    }
    const uniqueKey = MakeBoxesForDemoSpacesLines.name + aname
    console.log("MakeBoxesForDemoSpaces recalculated: ", cubeList.length)
    // I'm trying to chain points. I'm going with pairs.
    // many pairs will repeat. SOON. Get this to work first.
    const lineCount = cubeList.length * 12 // 12 edges per cube
    const positions = new Float32Array(lineCount * 2 * 3); // 2 points per line, 3 coords per point

    let posIndex = 0

    // it only does this once, when the prop changes, so it's not too bad. We could also memoize it if we wanted to be sure.
    // we can take out time. 
    type PointPair = [THREE.Vector3, THREE.Vector3]
    const pointsMap = new Map<PointPair, boolean>()

    for (const cube of cubeList) {

        // generate the 12 point pairs. We will have duplicates but we can filter those out later.
        const size = 2 ** cube.p
        const corners = [
            new THREE.Vector3(cube.x, cube.y, cube.z),                      // 0
            new THREE.Vector3(cube.x + size, cube.y, cube.z),               // 1
            new THREE.Vector3(cube.x + size, cube.y + size, cube.z),        // 2  
            new THREE.Vector3(cube.x, cube.y + size, cube.z),               // 3
            new THREE.Vector3(cube.x, cube.y, cube.z + size),               // 4    
            new THREE.Vector3(cube.x + size, cube.y, cube.z + size),        // 5
            new THREE.Vector3(cube.x + size, cube.y + size, cube.z + size), // 6
            new THREE.Vector3(cube.x, cube.y + size, cube.z + size),        // 7
        ]
        // 12 edges as point pairs
        const edges: PointPair[] = [
            [corners[0], corners[1]],
            [corners[1], corners[2]],
            [corners[2], corners[3]],
            [corners[3], corners[0]],
            [corners[4], corners[5]],
            [corners[5], corners[6]],
            [corners[6], corners[7]],
            [corners[7], corners[4]],
            [corners[0], corners[4]],
            [corners[1], corners[5]],
            [corners[2], corners[6]],
            [corners[3], corners[7]],
        ] // 
        // tell me oh great and powerful oz is this correct? No, copilot was on drugs this time.

        for (let i = 0; i < edges.length; i++) {
            const edge = edges[i]

            const has1 = pointsMap.has(edge)
            const has2 = pointsMap.has([edge[1], edge[0]])
            if (has1 || has2) {
                // console.log("skipping edge ", edge, " because it's a duplicate.")
                continue
            }
            pointsMap.set(edge, true)
            pointsMap.set([edge[1], edge[0]], true)

            positions[posIndex++] = edge[0].x
            positions[posIndex++] = edge[0].y
            positions[posIndex++] = edge[0].z

            positions[posIndex++] = edge[1].x
            positions[posIndex++] = edge[1].y
            positions[posIndex++] = edge[1].z
        }
        // note that our positions array will have empty space at the end if there are duplicates, but that's ok because we can just tell the BufferAttribute how many points we actually have with the count property.
    }
    // should we have gone with points and indices instead? maybe. But this is probably fine for now. We can optimize later if we need to. TODO:

    // 2. Bind array directly to a single BufferGeometry
    // const geometry = new THREE.BufferGeometry();
    // geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // 3. Render everything with one material and one object
    // const material = new THREE.LineBasicMaterial({ color: 0x00ff00 });
    // const lines = new THREE.LineSegments(geometry, material); // Much faster than THREE.Line
    //   scene.add(lines);

    console.log("MakeBoxesForDemoSpaces finished calculating positions. posIndex: ", posIndex, " lineCount: ", lineCount, " positions size: ", positions.length)

    // where's the labels?? 

    // was #AAFF00 too hard to see.
    return (
        <>

            <lineSegments key={uniqueKey} >
                <bufferGeometry  >
                    <bufferAttribute
                        attach="attributes-position"
                        count={posIndex / 3}
                        array={positions}
                        itemSize={3}
                    />
                </bufferGeometry>
                <lineBasicMaterial attach="material" color={color} />
            </lineSegments>



            {/* {spacesArray.map((cubeStr, index) => {
                const [cube, error] = oct.StringToCube(cubeStr)
                if (error) {
                    console.error("Error parsing cube string: ", cubeStr, error)
                    const errStr = error.message
                    return <div>Error parsing cube string: {cubeStr}. {errStr}</div>
                }
                return <OutlineBoxComponent key={index} cube={cube} errorMsg={undefined} color={"#39FF14"}
                    propsMessage={"this space 4 sale"} />
            })} */}
        </>
    )
}


// MakeBoxesForDemoSpaces will draw green boxes for the cubes in the demoSpaces prop, which is a comma delimited list of UrlCubes. 
// first we would want to cull the ones that are intersecting existing properties. TODO:
// Then we just accuculate the edges and draw those as a batch.
// Then we draw the ones in the frustum and close enough where the user could read the address on the floor of the box.
// we could also draw the ones that are further away but maybe just as a dot or something, to show where they are. ?? maybe
// this is old and slow busted way. Mod later for something elsw.
function MakeOutlineBoxesForDemoSpaces(props: MakeBoxesForDemoSpacesProps) {
    // if (!props.demoSpaces)
    //   return null
    //   const tmp = ""//props.demoSpaces.trim()
    //   const spacesArray = tmp.split(",").map(s => s.trim())
    const cameraPosition = new THREE.Vector3(0, 0, 0)

    let color = props.color || "#39FF14"

    useFrame((state: RootState, delta: number) => {
        cameraPosition.copy(state.camera.position)
    })

    const cubeList = props.demoCubeList
    // console.log("MakeOutlineBoxesForDemoSpaces will draw with index base: ", props.indexBase)
    // key={oct.CubeToString(cube)[0]}
    return (
        <>
            {cubeList.map((cube, index) => {
                return <OutlineBoxComponentTextOnly  cube={cube} color={color}
                    propsMessage={"this space 4 sale"}
                />
            })}
        </>
    )
}

// OutlineBoxComponentTextOnly just draw one stupid cube at a time and only does the text.

export function OutlineBoxComponentTextOnly(props: {
    cube: oct.Cube,
  //   errorMsg: string | undefined,
    color?: string,
    propsMessage: string,
    // cameraPosition: THREE.Vector3
}) {

    // do it the hard way?
    // can we default on the font? const FONT_URL = '/fonts/Inter_18pt-Bold.ttf'
    // yes, that's much better.

    const cube = props.cube
    const color = props.color || "royalblue"

    const halfWidth = (2 ** cube.p - 1) / 2
    const center: [number, number, number] = [cube.x + halfWidth, cube.y + halfWidth, cube.z + halfWidth]

    const width = (2 ** cube.p)

    const markerSize = 1 / 16 * (2 ** cube.p)

    let label = oct.CubeToString(cube)[0].split('-')[1] // just the part after the world name, which is the part that encodes the position and size of the cube.
    // if (props.errorMsg) {
    //     label += "\n" + props.errorMsg
    // }
    // const textColor = props.errorMsg ? "red" : color
    const textColor = color

    let distance = 0
    let ratio = 0
    //  calc some LOD

    // the problem here is that all these would redraw when the cameraPosition
    distance = 100// props.cameraPosition.distanceTo(new THREE.Vector3(center[0], center[1], center[2]))
    // console.log("distance to cube ", cube, " is ", distance)
    // const width = (2 ** cube.p)  // make the text bigger as we get further away, so it remains legible. This is a hacky way to do LOD for text.
    ratio = width / distance

    // console.log("ratio ", ratio)
    // was .2 it's not following the camera.

    // if (ratio < .1) {
    //     return (
    //         <></>
    //     )
    // }

    // console.log("OutlineBoxComponentTextOnly with label ", label )

//                {/* key={props.indexBase + 1} NEVER ADD A KEY TO A TEXT It will end up IN the text.*/}
//    font={FONT_URL}


    return (
        <>

            <Text color={textColor} anchorX="center" anchorY="middle"
                position={[center[0], cube.y, center[2]]}
                rotation={[-Math.PI / 2, -Math.PI / 2, 0, 'ZYX']}
                fontSize={markerSize * 2}>
             
                {label}
            </Text>            

        </>
    )
}

            {/* <IfFarAway /> */}

            // <Text color={textColor} anchorX="center" anchorY="middle"
            //     position={[center[0], cube.y, center[2]]}
            //     rotation={[-Math.PI / 2, -Math.PI / 2, 0, 'ZYX']}
            //     fontSize={markerSize * 2}>
            //     font={FONT_URL}

            //     {/* key={props.indexBase + 1} NEVER ADD A KEY TO A TEXT It wyll end up IN the text.*/}
            //     {label}
            // </Text>



// This was wacky. Makes a big tangle of lines.
export function MakeBoxesForDemoSpacesRandom() {

    // 1. Create a massive flat array of coordinates [x1,y1,z1, x2,y2,z2, ...]
    const lineCount = 10000;
    const positions = new Float32Array(lineCount * 2 * 3); // 2 points per line, 3 coords per point

    for (let i = 0; i < lineCount; i++) {
        const index = i * 6;
        // Line Start (A)
        positions[index] = Math.random() * 10;
        positions[index + 1] = Math.random() * 10;
        positions[index + 2] = Math.random() * 10;
        // Line End (B)
        positions[index + 3] = Math.random() * 10;
        positions[index + 4] = Math.random() * 10;
        positions[index + 5] = Math.random() * 10;
    }

    // 2. Bind array directly to a single BufferGeometry
    // const geometry = new THREE.BufferGeometry();
    // geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // // 3. Render everything with one material and one object
    // const material = new THREE.LineBasicMaterial({ color: 0x00ff00 });
    // const lines = new THREE.LineSegments(geometry, material); // Much faster than THREE.Line
    // scene.add(lines);

    return (
        <>
            <line>
                <bufferGeometry  >
                    <bufferAttribute
                        attach="attributes-position"
                        count={positions.length / 3}
                        array={positions}
                        itemSize={3}
                    />
                </bufferGeometry>
                <lineBasicMaterial attach="material" color="blue" />
            </line>
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



