
import React from 'react';
import { Text } from '@react-three/drei';
import * as oct from '../knotfree-ts-lib/3d/UrlOctTree';


// Draw small boxes in the 4 lower corners of a cube, to make it easier to see the outline of the cube.
export function OutlineBoxComponent(props: { cube: oct.Cube, errorMsg: string | undefined, color?: string }) {
    const cube = props.cube
    const color = props.color || "royalblue"

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
    let label = oct.cubeToUrlString(cube)[0].split('-')[1] // just the part after the world name, which is the part that encodes the position and size of the cube.
    if (props.errorMsg) {
        label += "\n" + props.errorMsg
    }
    const textColor = props.errorMsg ? "red" : color
   
    return (
        <>

            {/* wee should billboard this. That would be funny. */}
            <Text color={textColor} anchorX="center" anchorY="middle"
                position={[center[0], 0, center[2]]}
                rotation={[-Math.PI / 2, -Math.PI / 2, 0, 'ZYX']}
                fontSize={markerSize * 2}>
                {label}
            </Text>


            {corners.map((corner, index) => (
                <mesh key={index} position={corner}>
                    <boxGeometry args={[markerSize * .8, markerSize * .8, markerSize * .8]} />
                    <meshStandardMaterial color={color} />
                </mesh>
            ))}

            {/* //risers */}
            {corners.map((corner, index) => (
                <mesh key={index} position={[corner[0], corner[1] + width / 2 - markerSize * .5, corner[2]]}>
                    <boxGeometry args={[markerSize * .1, width * .8, markerSize * .1]} />
                    <meshStandardMaterial color={color} />
                </mesh>
            ))}

        </>
    )
}