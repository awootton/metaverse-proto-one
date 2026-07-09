

import * as THREE from 'three';

// what does useMemo do?
import React from 'react';
import { Text } from '@react-three/drei';
import * as oct from '../knotfree-ts-lib/3d/UrlOctTree';
import { Edges } from '@react-three/drei';
import { useTexture } from '@react-three/drei';
import { Line } from '@react-three/drei';
import { RootState, useFrame } from '@react-three/fiber';
import StandingPerson from './StandingPerson';
import { useRef } from 'react';
import { Group } from 'three';
import * as utils from '../knotfree-ts-lib/3d/utils';
import * as leaves from './LeafRenderingComponent';

export type OutlineBoxComponentProps = {
    // cube: oct.Cube, do we have the whole TreeStatus? Just pass that in.
    // cube: oct.Cube,
    treeStatus: oct.TreeStatus,
    errorMsg?: string,
    color?: string,
    propsMessage: string,
    forceChainLink?: boolean
    indexBase : number
}

// just draw the outline and the label. Delete the crap in the messy one below. It's a mess.
// if it's far we skip the text. Chain link is turned off.
export function OutlineBoxComponentPlain(props: OutlineBoxComponentProps) {
    const cube = props.treeStatus.cube
    const plainColorHere = props.color || "royalblue"

    const center: [number, number, number] = [cube.x + (2 ** cube.p) / 2, cube.y + (2 ** cube.p) / 2, cube.z + (2 ** cube.p) / 2]

    const width = (2 ** cube.p)

    const markerSize = 1 / 16 * (2 ** cube.p)

    // needs no testure const texture = useTexture('/images/chainlink-w-alpha.png');

    // console.log(`OutlineBoxComponentPlain cube`, cube, `size`, markerSize)
    // const halfSize = size / 2
    const corners: [number, number, number][] = [
        [cube.x + 0, cube.y + 0, cube.z + 0],
        [cube.x + width, cube.y + 0, cube.z + 0],
        [cube.x + 0, cube.y + 0, cube.z + width],
        [cube.x + width, cube.y + 0, cube.z + width],
    ]
    // these corners are the corners of the cube, but we want to draw small boxes at these corners, so we need to adjust the positions of the small boxes to be centered on the corners.
    // to do this, we need to subtract half the size of the small box from each corner position.
    for (let i = 0; i < corners.length; i++) {
        corners[i][0] += corners[i][0] - center[0] > 0 ? -markerSize / 2 : markerSize / 2
        corners[i][1] += corners[i][1] - center[1] > 0 ? -markerSize / 2 : markerSize / 2
        corners[i][2] += corners[i][2] - center[2] > 0 ? -markerSize / 2 : markerSize / 2
    }
    let label = oct.CubeToString(cube)[0].split('-')[1] // just the part after the world name, which is the part that encodes the position and size of the cube.
    // if (props.errorMsg) {
    //     label += "\n" + props.errorMsg
    // }
    // const textColor = plainColorHere
    // const errorColor = props.errorMsg ? "red" : color

    let distance = 0
    //  calc some LOD

    // can't see the mesh after about  83 meters
    useFrame((state: RootState, delta: number) => {
        distance = state.camera.position.distanceTo(new THREE.Vector3(center[0], center[1], center[2]))
    })

    // if (distance > 100) {  TODO: fix this.
    //     return (<>
    //         <leaves.CubeWithEdges cube={props.treeStatus.cube} index={30000} />
    //     </>)
    // }

    // console.log(`OutlineBoxComponentPlain cube label is `, label)
    // having weird bug with this. Turned text off. Going to reboot
    // NEVER ADD A KEY TO A TEXT. IT WILL BE IN THE TEXT.

    const adjustment = 0.25 // lift the text above the floor. 10 cm is a lot but still not working
    // what the hell. May pull in that far clip plane.
    return (
        <>
            <leaves.CubeWithEdges cube={props.treeStatus.cube} index={props.indexBase}
             key={props.indexBase} />

            <Text color={plainColorHere} anchorX="center" anchorY="middle"
                position={[center[0], center[1] - width / 2 + adjustment, center[2]]}
                rotation={[-Math.PI / 2, -Math.PI / 2, 0, 'ZYX']}
                fontSize={markerSize * 2}>
                {label}
            </Text>
        </>
    )
}

// end of OutlineBoxComponentPlain 
// end of OutlineBoxComponentPlain 
// end of OutlineBoxComponentPlain 
// end of OutlineBoxComponentPlain 
// end of OutlineBoxComponentPlain 
// end of OutlineBoxComponentPlain 


// Draw  ..., to make it easier to see the outline of the cube.
// what a mess. You should see my room. I'm getting rid of cameraPosition at this low level
export function OutlineBoxComponent(props: OutlineBoxComponentProps) {
    const cube = props.treeStatus.cube
    const color = props.color || "royalblue"

    const center: [number, number, number] = [cube.x + (2 ** cube.p) / 2, cube.y + (2 ** cube.p) / 2, cube.z + (2 ** cube.p) / 2]

    const width = (2 ** cube.p)

    const markerSize = 1 / 16 * (2 ** cube.p)

    const texture = useTexture('/images/chainlink-w-alpha.png');

    console.log(`OutlineBoxComponent cube`, cube, `size`, markerSize)
    // const halfSize = size / 2
    const corners: [number, number, number][] = [
        [cube.x + 0, cube.y + 0, cube.z + 0],
        [cube.x + width, cube.y + 0, cube.z + 0],
        [cube.x + 0, cube.y + 0, cube.z + width],
        [cube.x + width, cube.y + 0, cube.z + width],
    ]
    // these corners are the corners of the cube, but we want to draw small boxes at these corners, so we need to adjust the positions of the small boxes to be centered on the corners.
    // to do this, we need to subtract half the size of the small box from each corner position.
    for (let i = 0; i < corners.length; i++) {
        corners[i][0] += corners[i][0] - center[0] > 0 ? -markerSize / 2 : markerSize / 2
        corners[i][1] += corners[i][1] - center[1] > 0 ? -markerSize / 2 : markerSize / 2
        corners[i][2] += corners[i][2] - center[2] > 0 ? -markerSize / 2 : markerSize / 2
    }
    let label = oct.CubeToString(cube)[0].split('-')[1] // just the part after the world name, which is the part that encodes the position and size of the cube.
    // we don't show error messages yet. Stay tuned. Maybe we never will.
    // if (props.errorMsg) {
    //     label += "\n" + props.errorMsg
    // }
    const textColor = props.errorMsg ? "red" : color

    let distance = 0
    //  calc some LOD

    // can't see the mesh after about  83 meters
    useFrame((state: RootState, delta: number) => {
        distance = state.camera.position.distanceTo(new THREE.Vector3(center[0], center[1], center[2]))
    })

    const ChainLinkCube = () => {
        // Load texture (e.g., a transparent PNG)
        const texture = useTexture('/images/chainlink-w-alpha.png');

        // let's say 2" is the mesh. 
        // and our image has 2 cells across the image. 
        // so, for a meter, say 40" we would want to repeat the texture 20 times across the face.
        // seems wrong.

        // let's say that the spacing is 5 cm, or about 2 inches. 1.9685
        // so a meter has 100 / 5 = 20 repeats across the face.
        // and the twcture has 2 cells so we want to repeat it 20/2 = 10 times across the face.

        // Configure repeating settings
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        var repeats = 10 * width // for one meter cube 
        repeats = repeats / 4 // exaggerate like hell.
        texture.repeat.set(repeats, repeats); // Adjust numbers to repeat texture across the faces

        const size = width * 0.98 // if the cube

        return (
            <mesh position={center}>
                <boxGeometry args={[size, size, size]} />
                <meshStandardMaterial
                    map={texture}
                    transparent={true}      // Required for opacity/alpha channels
                    opacity={1.0}           // Adjust overall opacity if needed
                    side={THREE.DoubleSide} // Optional: renders inside/both sides
                />
            </mesh>
        );
    };

    function myMeshMaterial() {
        return (
            <meshStandardMaterial
                map={texture}
                transparent={true}      // Required for opacity/alpha channels
                opacity={1.0}           // Adjust overall opacity if needed
                side={THREE.DoubleSide} // Optional: renders inside/both sides
            />
        )
    }


    const OpenBottomBox = () => {

        const size = width * 0.98 // if the cube

        // Configure repeating settings
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        var repeats = 10 * width // for one meter cube 
        repeats = repeats / 4 // exaggerate like hell.
        texture.repeat.set(repeats, repeats); // Adjust numbers to repeat texture across the faces

        return (
            <group position={center}>
                {/* Front */}
                <mesh position={[0, 0, size / 2]}>
                    <planeGeometry args={[size, size]} />
                    {myMeshMaterial()}
                </mesh>

                {/* Back */}
                <mesh position={[0, 0, -size / 2]} rotation={[0, Math.PI, 0]}>
                    <planeGeometry args={[size, size]} />
                    {myMeshMaterial()}
                </mesh>

                {/* Left */}
                <mesh position={[-size / 2, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
                    <planeGeometry args={[size, size]} />
                    {myMeshMaterial()}
                </mesh>

                {/* Right */}
                <mesh position={[size / 2, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
                    <planeGeometry args={[size, size]} />
                    {myMeshMaterial()}
                </mesh>

                {/* Top */}
                <mesh position={[0, size / 2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[size, size]} />
                    {myMeshMaterial()}
                </mesh>

                {/* Bottom is purposefully omitted here */}
            </group>
        );
    };


    // function TwoInchBox() { // for reference.  
    //     //  and a 2 meter person.  
    //     const size = 2.54 * 2 / 100 // 2 inches in meters so we can see our chain link is wrong.
    //     const somez = -5 * 2 ** 4 + 16 + .25
    //     return (
    //         <>
    //             <mesh key={9999} position={[-1 * 2 ** 4, 1, somez]}>
    //                 <boxGeometry args={[0.5, 2, 0.5]} />
    //                 <meshStandardMaterial color="peachpuff" />
    //             </mesh>
    //             <mesh key={99992} position={[-1 * 2 ** 4 + .5, 1, somez]}>
    //                 <boxGeometry args={[size, size, size]} />
    //                 <meshStandardMaterial color="yellow" />
    //             </mesh>
    //         </>
    //     )
    // }

    // only atw liked this one. He's a dork.
    // function cornersAndRisers() {
    //     return (
    //         <>
    //             {corners.map((corner, index) => (
    //                 <mesh key={index} position={corner}>
    //                     <boxGeometry args={[markerSize * .8, markerSize * .8, markerSize * .8]} />
    //                     <meshStandardMaterial color={color} />
    //                 </mesh>
    //             ))}

    //             {/* //risers */}
    //             {corners.map((corner, index) => (
    //                 <mesh key={index} position={[corner[0], corner[1] + width / 2 - markerSize * .5, corner[2]]}>
    //                     <boxGeometry args={[markerSize * .1, width * .8, markerSize * .1]} />
    //                     <meshStandardMaterial color={color} />
    //                 </mesh>
    //             ))}

    //         </>
    //     )
    // }

    // The <Line> component uses custom shaders to fake geometry. You can pass the following properties to fine-tune its look:lineWidth: Sets the thickness. A value of 5 or 10 creates highly visible, bold lines.worldUnits: Change this boolean to true if you want line thickness to scale realistically with camera distance (measured in 3D scene units instead of screen pixels).

    // should we add this one to the unknown leafes that are close? 
    function ThickCubeEdges() {

        let thickness = 2

        // Define the 8 corner vertices of a standard 1x1x1 cube
        const v: [number, number, number][] = [
            [-0.5, -0.5, -0.5], [0.5, -0.5, -0.5], [0.5, 0.5, -0.5], [-0.5, 0.5, -0.5], // Back face
            [-0.5, -0.5, 0.5], [0.5, -0.5, 0.5], [0.5, 0.5, 0.5], [-0.5, 0.5, 0.5]  // Front face
        ];

        // Connect vertices in a single continuous path to draw all 12 edges
        const points: [number, number, number][] = [
            v[0], v[1], v[2], v[3], v[0], // Back loop
            v[4], v[5], v[6], v[7], v[4], // Move to front, front loop
            v[5], v[1], v[2], v[6], v[7], v[3] // Connect remaining ribs
        ];

        return (
            <>
                <mesh
                    // Move: Set X, Y, Z positions
                    position={center}
                    // Scale: Uniform or non-uniform scaling [X, Y, Z]
                    scale={[width * .98, width * 1.0, width * .99]}
                >
                    {/* Renders thick, screen-facing ribbon lines */}
                    <Line
                        points={points}
                        color={color} // Line color
                        lineWidth={thickness} // Thickness in pixels
                        dashed={false}
                    />
                </mesh>
            </>
        );
    }

    function CubeWithEdges() {
        const size = width
        return (
            <mesh
                position={center}
            >
                <boxGeometry
                    args={[size * 0.98, size * 1.0, size * 0.98]}
                />
                <meshBasicMaterial color="lightblue" opacity={0.1} transparent />
                <Edges color={color} />

            </mesh>
        );
    }

    function IfFarAway() {

        if (props.forceChainLink) {
            return (
                <>
                    <ChainLinkCube />
                    <ThickCubeEdges />
                    <TextOnFaces />
                </>
            )
        }

        return (
            // thin cube edged? no text, no chain link texture, just a simple cube with edges.
            <CubeWithEdges />
        )
        // fixme: 

        const somez = -5 * 2 ** 4 + 16 + .25

        console.log("distance to cube", distance)
        if (distance < 30) {
            return (
                <>

                    <OpenBottomBox />

                    {/* <ChainLinkCube /> */}


                    {myMeshMaterial()}
                    <ThickCubeEdges />
                    <TextOnFaces />
                    <StandingPerson position={[-1 * 2 ** 4 + 2, 1, somez]} />
                </>
            )
        }
        if (distance < 100) {
            return (
                <>
                    <ThickCubeEdges />

                    <TextOnFaces />
                    <StandingPerson position={[-1 * 2 ** 4 + 2, 1, somez]} />
                </>
            )
        }
        // further away. 
        return (
            // thin cube edged? no text, no chain link texture, just a simple cube with edges.
            <CubeWithEdges />
        )
    }

    function makesign(position: [number, number, number], rotation: [number, number, number], message: string, adjustment: [number, number, number], index: number) {

        const ypos = center[1] - width / 2 + 1.75
        let adjustedPosition: [number, number, number] = [
            position[0] + adjustment[0],
            ypos,
            position[2] + adjustment[2]
        ];
        let adjustedPosition2: [number, number, number] = [
            adjustedPosition[0] + adjustment[0],
            ypos, //adjustedPosition[1] + adjustment[1], eye height.
            adjustedPosition[2] + adjustment[2]
        ];

        let aHash = utils.djb2Hash("" + index + oct.CubeToString(props.treeStatus.cube)[0]) // an pseudo random 32 bit int. just for fun.
        if ((aHash & (1 << 16)) === 0) {
            aHash = -aHash
        }// now signed.
        aHash = aHash / (2 ** 31) // now just a fract.
        const rotationZ = aHash * Math.PI / 16; // 
        // console.log("textRotation ", rotationZ)


        //     console.log(`OutlineBoxComponent not pppp Plain cube MESSAGE is `, label)
        // NEVER ADD A KEY TO A TEXT. IT WILL BE IN THE TEXT

        return (
            <React.Fragment key={index}>
                <mesh key={index} position={adjustedPosition} rotation={rotation}>

                    {/* The White Square */}
                    <mesh
                        // position={adjustedPosition}
                        rotation-z={rotationZ}
                        key={index + 10000}
                    >
                        <planeGeometry args={[3, 0.25]} />
                        <meshStandardMaterial
                            color="#CCFF00"      // Core fluorescent yellow color
                            emissive="#CCFF00"   // Emissive color for glowing effect
                            emissiveIntensity={4} // Boost the brightness
                        />
                    </mesh>

                    <Text  color={"black"} anchorX="center" anchorY="middle"
                        position={[0, 0.0, 0.02]} // Slightly in front of the plane to avoid z-fighting}
                        // rotation={textRotation}
                        rotation-z={rotationZ}
                        fontSize={.15}>
                        {message}
                    </Text>
                </mesh>
            </React.Fragment>
        )
    }




    function TextOnFaces() { // this is crap
        const offset = width / 2 * 0.98
        const tweak = 0.01 // we have to be slightly outside the cube to avoid z-fighting, but we don't want to be too far outside the cube or the text will look like it's floating.
        const faceTexts = [
            { pos: [center[0] + offset + tweak, center[1], center[2]] as [number, number, number], rot: [0, Math.PI / 2, 0] as [number, number, number], message: props.propsMessage },
            { pos: [center[0] - offset - tweak, center[1], center[2]] as [number, number, number], rot: [0, -Math.PI / 2, 0] as [number, number, number], message: props.propsMessage },
            { pos: [center[0], center[1], center[2] + offset + tweak] as [number, number, number], rot: [0, 0, 0] as [number, number, number], message: props.propsMessage },
            { pos: [center[0], center[1], center[2] - offset - tweak] as [number, number, number], rot: [0, Math.PI, 0] as [number, number, number], message: props.propsMessage },
        ]
        const faceAdjustments: [number, number, number][] = [
            [+ tweak, 0, 0],
            [- tweak, 0, 0],
            [0, 0, tweak * 2],
            [0, 0, - tweak * 2],
        ]

        const elements = []
        for (let index = 0; index < faceTexts.length; index++) {
            const face = faceTexts[index]
            const adj = faceAdjustments[index]
            elements.push(makesign(face.pos, face.rot, face.message, adj, index))
        }

        return (
            <>
                {elements}
            </>
        )
    }

    // console.log(`OutlineBoxComponent not plain something is `, label)

    return (
        <>

            {/* <TwoInchBox /> */}

            {/* we should billboard this. That would be funny. */}
            <Text color={textColor} anchorX="center" anchorY="middle"
                position={[center[0], 0, center[2]]}
                rotation={[-Math.PI / 2, -Math.PI / 2, 0, 'ZYX']}
                fontSize={markerSize * 2}>
                {label}
            </Text>

            <IfFarAway />
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



