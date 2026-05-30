
import React from 'react';
import { Text } from '@react-three/drei';
import * as dd from '../knotfree-ts-lib/3d/messageTypes';


// Draw small boxes in the 4 lower corners of a cube, to make it easier to see the outline of the cube.
export function OutlineBoxComponent(props: { cube: dd.Cube , errorMsg: string|undefined}) {
    const { cube } = props

    const center = [cube.x + (2 ** cube.p) / 2, cube.y + (2 ** cube.p) / 2, cube.z + (2 ** cube.p) / 2]

    const width = (2 ** cube.p)

    const markerSize = 1 / 16 * (2 ** cube.p)
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
    let label = dd.cubeToString(cube)[0].split('-')[1] // just the part after the world name, which is the part that encodes the position and size of the cube.
    if (props.errorMsg) {
        label += "\n" + props.errorMsg
    }
    const textColor = props.errorMsg ? "red" : "blue"
    return (
        <>

            {/* // the origin
            // the origin of the cube in in the center of this cube
            <mesh position={[cube.x, cube.y, cube.z]}>

                <boxGeometry args={[1, 1, 1]} />
                <meshBasicMaterial color="green" />
            </mesh>

            // the middle of the cube is in the center of this blue box
            <mesh position={[center[0], center[1], center[2]]}>
                <boxGeometry args={[0.5, 0.5, 0.5]} />
                <meshBasicMaterial color="blue" />
            </mesh> */}

            {/* <mesh position={[center[0], 0, center[2]]} rotation={[-Math.PI / 2, 0, 0]} >
                <planeGeometry args={[width / 2, width / 2]} />
                <meshBasicMaterial color="white" />
            </mesh> */}

            <Text color={textColor} anchorX="center" anchorY="middle" 
                position={[center[0], 0, center[2]]}
                rotation={[-Math.PI / 2 , -Math.PI/2, 0,'ZYX']}
                fontSize={markerSize * 2}>
                {label}
            </Text>


            {corners.map((corner, index) => (
                <mesh key={index} position={corner}>
                    <boxGeometry args={[markerSize * .8, markerSize * .8, markerSize * .8]} />
                    <meshStandardMaterial color="royalblue" />
                </mesh>
            ))}
        </>
    )
}