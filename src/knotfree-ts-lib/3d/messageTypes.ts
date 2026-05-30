

export type Error = {
    message: string
}



// string format of a cube
// "testmain"-number['n'|'s']number['u'|'d']number['e'|'w']['-'|'']number'p'
// where world is the name of world in lowercase letters, 
// n/s is north/south, 
// u/d is up/down, 
// e/w is east/west, 
// and 2^p is the size of the cube and also all coordinates are multiplied by p.
// For example: "testmain-10n5u3e2p" represents a cube in the world named "testmain"
// that where x = 10*4 meters north, y = 5*4 meters up, z = 3*4 meters east of the origin, and has a size of 2^2=4 meters.

// if there is a '-' and then a number between 0 and 7 at the end of the string then it's a parent cube. 
// the number represents which child cube the original cube is in, with the following mapping:
// 0: n u e
// 1: n u w
// 2: n d e
// 3: n d w ?? is this right ?
// 4: s u e
// 5: s u w
// 6: s d e
// 7: s d w
// eg. "testmain-10n5u3e2p-1" represents a parent cube.

export interface Cube {
    world: string, // name of the world
    x: number, // in meters, where positive x is north and negative x is south
    y: number, // in meters, where positive y is up and negative y is down
    z: number, // in meters, where positive z is east and negative z is west
    p: number, // a power of 2, representing the size of the cube. For example, if p = 2, then the cube is 2^2=4 units wide in each dimension.
}

export type CubeString = string

export function getParentCube(cube: Cube): Cube {
    return {
        world: cube.world,
        x: cube.x - (cube.x % (2 ** cube.p)),
        y: cube.y - (cube.y % (2 ** cube.p)),
        z: cube.z - (cube.z % (2 ** cube.p)),
        p: cube.p + 1
    }
}

export function getChildCube(cube: Cube, which: number): Cube {
    let tmp = {
        world: cube.world,
        x: cube.x,
        y: cube.y,
        z: cube.z,
        p: cube.p - 1
    }
    if (which & 1) {
        tmp.x += 2 ** tmp.p
    }
    if (which & 2) {
        tmp.y += 2 ** tmp.p
    }
    if (which & 4) {
        tmp.z += 2 ** tmp.p
    }
    return tmp
}


// Convert a cube to a string
export function cubeToString(cube: Cube): [CubeString, Error] {
    const xDir = cube.x >= 0 ? 'n' : 's'
    const yDir = cube.y >= 0 ? 'u' : 'd'
    const zDir = cube.z >= 0 ? 'e' : 'w'
    const power = 2 ** cube.p
    const scaledx = cube.x / power
    const scaledy = cube.y / power
    const scaledz = cube.z / power
    if (!Number.isInteger(scaledx) || !Number.isInteger(scaledy) || !Number.isInteger(scaledz)) {
        return ["", { message: `Cube coordinates must be multiples of p. Got x: ${cube.x}, y: ${cube.y}, z: ${cube.z}, p: ${cube.p}` }]
    }
    return [`${cube.world}-${Math.abs(scaledx)}${xDir}${Math.abs(scaledy)}${yDir}${Math.abs(scaledz)}${zDir}${cube.p}p`, { message: "" }]
}

// Convert a string to a cube
export function stringToCube(str: CubeString): [Cube, Error] {
    const regex = /^([a-z]+)-(\d+)([ns])(\d+)([ud])(\d+)([ew])(-?\d+)p$/
    const match = str.match(regex)
    if (!match) {
        return [{
            world: "",
            x: 0,
            y: 0,
            z: 0,
            p: 0
        }, { message: `Invalid cube string: ${str}` }]
    }
    const world = match[1]
    const xnum = parseInt(match[2]) * (match[3] === 'n' ? 1 : -1)
    const ynum = parseInt(match[4]) * (match[5] === 'u' ? 1 : -1)
    const znum = parseInt(match[6]) * (match[7] === 'e' ? 1 : -1)
    const p = parseInt(match[8])
    const size = Math.pow(2, p)
    return [{ world, x: xnum * size, y: ynum * size, z: znum * size, p }, { message: "" }]
}










export interface MessageBaseClass {
    type: string,       // for routing by type
    sessionId: string   //  for routing reply messages
}

export interface InitMessage extends MessageBaseClass {

    payload: {
        props: any,
        drawingSurface: any,    // offscreencanvas,
        width: number,          //canvas.clientWidth,
        height: number,         //canvas.clientHeight,
        pixelRatio: number,     //window.devicePixelRatio,
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
