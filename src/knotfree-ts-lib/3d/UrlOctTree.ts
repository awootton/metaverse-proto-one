
import * as atwdns from './DnsTypes'

// and TreesApi stuff.

// string format of a cube
// "testmain"-number['n'|'s']number['u'|'d']number['e'|'w']['-'|'']number'p'
// where world is the name of world in lowercase letters, 
// n/s is north/south, 
// u/d is up/down, 
// e/w is east/west, 
// and 2^p is the size of the cube and also all coordinates must be multiplied by 2^p to get real value.
// For example: "testmain-10n5u3e2p" represents a cube in the world named "testmain"
// the size of the cube is 2^2=4 meters, and the coordinates are x = 10*4 meters north, y = 5*4 meters up, z = 3*4 meters east of the origin.

export type Cube = {
    world: string,      // name of the world
    x: number,          // in meters, where positive x is north and negative x is south
    y: number,          // in meters, where positive y is up and negative y is down
    z: number,          // in meters, where positive z is east and negative z is west
    p: number,          // a power of 2, representing the size of the cube. For example, if p = 2, then the cube is 2^2=4 units wide in each dimension.
    whichParent?: number,  // When we know it's a parent. whichParent=0 is not a child. It's the north, east, up parent.
    // it's confusoing because a leaf is also a member of some quadrant of it's parent.
    // Can we just not have it? 
}

export type CubeString = string

export function getParentCube(cube: Cube): Cube {
    return getParentCubeWithOcttreeIndex(cube)[0]
}

export function getParentCubeWithOcttreeIndex(cube: Cube): [Cube, number] {
    const newpower = 2 ** (cube.p + 1)
    const remainderx = Math.abs(cube.x % newpower)
    const remaindery = Math.abs(cube.y % newpower)
    const remainderz = Math.abs(cube.z % newpower)
    const index = (remainderx != 0 ? 1 : 0) | (remaindery != 0 ? 2 : 0) | (remainderz != 0 ? 4 : 0)

    const temp = {
        world: cube.world,
        // round down to the nearest multiple of power
        x: cube.x - remainderx,
        y: cube.y - remaindery,
        z: cube.z - remainderz,
        p: cube.p + 1,
        isParent: index
    }
    return [temp, index]
}

// getChildCube makes the cube object, depending upon the index of the child cube. The index is a number from 0 to 7 that represents which child cube it is.
// we don't know if there's a parent at the location or if it's a leaf.
export function getChildCube(cube: Cube, which: number): Cube {
    // is will have the same coordinates as the parent cube except that the p value will be 1 less 
    // and then depending on which child cube it is it will add the appropriate amount to the x, y, and z coordinates.
    let childCube = {
        world: cube.world,
        x: cube.x,
        y: cube.y,
        z: cube.z,
        p: cube.p - 1,
    }
    const halfSize = 2 ** (cube.p - 1)
    if (which & 1) {
        childCube.x += halfSize
    }
    if (which & 2) {
        childCube.y += halfSize
    }
    if (which & 4) {
        childCube.z += halfSize
    }
    return childCube
}


// cubeToString will Convert a cube to a string
// note that the coordinates must be multiples of 2^p, so if they are not then it's an error. 
// For example, if p is 1 then the cube size is 2, so all the coordinates must be even numbers or else it's an error. 
// When we make it into a string it should round down to the nearest even number and then when we parse it back it should be the same as the original cube but with the coordinates rounded down to the nearest even number. So we expect x to become 2, y to become 4, and z to become -4 when we parse it back from the string.
export function cubeToUrlString(cube: Cube): [CubeString, Error | null] {

    // we don't add the '-n' even if it's a parent because we don't know it.
    const xDir = cube.x >= 0 ? 'n' : 's'
    const yDir = cube.y >= 0 ? 'u' : 'd'
    const zDir = cube.z >= 0 ? 'e' : 'w'
    const power = 2 ** cube.p
    const scaledx = cube.x / power
    const scaledy = cube.y / power
    const scaledz = cube.z / power
    if (!Number.isInteger(scaledx) || !Number.isInteger(scaledy) || !Number.isInteger(scaledz)) {
        let errorMessage = `Cube coordinates must be multiples of p. Got x: ${cube.x}, y: ${cube.y}, z: ${cube.z}, p: ${cube.p}`
        return ["", new Error(errorMessage)]
    }
    let str = `${cube.world}-${Math.abs(scaledx)}${xDir}${Math.abs(scaledy)}${yDir}${Math.abs(scaledz)}${zDir}${cube.p}p`
    if (cube.whichParent !== undefined) {
        str += `-${cube.whichParent}`
    }
    return [str, null]
}

// Convert a string to a cube
export function stringToCube(str: CubeString): [Cube, Error | null] {
    const regex = /^([a-z]+)-(\d+)([ns])(\d+)([ud])(\d+)([ew])(-?\d+)p(?:-(\d+))?$/
    const match = str.match(regex)
    if (!match) {
        return [{
            world: "",
            x: 0,
            y: 0,
            z: 0,
            p: 0
        }, new Error(`Invalid cube string: ${str}`)]
    }
    const world = match[1]
    const xnum = parseInt(match[2]) * (match[3] === 'n' ? 1 : -1)
    const ynum = parseInt(match[4]) * (match[5] === 'u' ? 1 : -1)
    const znum = parseInt(match[6]) * (match[7] === 'e' ? 1 : -1)
    const p = parseInt(match[8])
    const size = Math.pow(2, p)
    let w: Cube = { world, x: xnum * size, y: ynum * size, z: znum * size, p }
    if (match[9]) {
        w.whichParent = parseInt(match[9])
    }
    return [w, null]
}

// ParseCubeList will take a comma delimited list of cube strings and return an array of cubes and an error 
// if any of the cube strings were invalid. For example, if the input is "testmain-10n5u3e2p, testmain-20n10u6e4p" 
// then it will return an array with two cubes and no error. 
// If the input is "testmain-10n5u3e2p, invalidcube" then it will return an array with one cube and an error for the second cube string.
export function ParseCubeList(cubeList: string): [Cube[], Error | null] {
    // split by comma and trim whitespace
    const trimmed = cubeList.trim()
    if (trimmed === "") {
        return [[], new Error("Input is empty or just whitespace")]
    }
    const cubeStrings = trimmed.split(",").map(s => s.trim())
    const cubes: Cube[] = []
    for (const cubeString of cubeStrings) {
        const [cube, error] = stringToCube(cubeString)
        if (error) {
            console.error(`Error parsing cube string "${cubeString}":`, error)
            return [cubes, error]
        } else {
            cubes.push(cube)
        }
    }
    return [cubes, null]
}


// GroupTextParamaters to add additional params to a cube url. We'll add these to the TXT record. For weird reasons there should be no spaces in the TXT record.
// be careful if you do these by hand.
// key is meta_group_id. Should we just put them in @ ?
// observe 255 characters limit !!
export type GroupTextParameters = {
    grp: string,      //  the group that this tree belongs to, which is the same for all leaf nodes rendered by the same iFrame or server.
    ali?: string      // alias use this for the iFrame src instead.
    p?: number       // optional port for the iFrame to connect to. If not specified, use default port 80.
    // we want stuff like localhost:3010 for local debugging of spaces and avatars.
    ex?: Record<string, unknown> // for extensibility. 
}

// TreeStatus is a record of cubes that exist and also ones that don't exist.
// We have records of ones are empty space and ones that are parents. 
// For instance. if we have testmain-10n5u3e2p-0 'found' but not testmain-10n5u3e2p-1, 
// we know that the cube in space "10n5u3e2p" has a subtree in the 0th octant but is empty in the 1st octant.
// We will cache all of this so let's not be too fluffy.

export type TreeStatus = {

    name: string,       // without the .vr or .xyz TLD. For example, "testmain-10n5u3e2p" and not "testmain-10n5u3e2p.vr"
    found: boolean,     // aka exists. 

    // do we need both the cube AND the name?
    // for fast culling we want the cube 
    // but for caching and looking up the dns we want the name.

    cube: Cube //       ,  // the cube represented by this name if it was found and could be parsed as a cube, otherwise null
    level: number,      // the p value of the cube named by name

    // isn't this the same as cube.IsParent? I'll add tests to check and we'll come back.
    // index: number,      // if this is a parent node, which child index is the cube that we are looking for. This is the number at the end of the name. For example, if the name is testmain-0n0u0e16p-3 then the index would be 3. If this is not a parent node or if the name was not found or could not be parsed as a cube, then this will be null.
    isParent: boolean,  // and not a leaf
    wasXYZ: boolean,    // found as a an .xyz domain name and not a .vr domain name

    // is TXT meta_group_id
    // only happens to the leaf nodes.
    // false means we looked them up and got "" else there would be an object here
    groupId?: GroupTextParameters | boolean, // the group that this tree belongs to, which is the same for all leaf nodes rendered by the same iFrame or server. 

    // do we need this? Maybe it's just a maintance problem waiting to happen.
    // it will always be 8 when known and [] when needs to be checked.
    // but also is the child a leaf or a parent? 
    // children: {exists: boolean, isParent: boolean}[],    // for the 8 subcubes true if a subtree exists and false if empty space.
    // see the utility routines below.
    childrenBits: number,    // for the 8 subcubes true if a subtree exists and false if empty space.

    // we should only fill this out for the leaf nodes that we actually want to render
    addresses?: string[],   // the result of the dns lookup for this name, which should be an array of ip addresses if found and null if not found or if there was an error during the lookup.
    error: Error | null     // nullable Error type

    // some iFrameStuff?
    //        let fr = document.getElementById(params.name) as HTMLIFrameElement
    // <iframe src={params.target} id={params.name} width={100} height={100}
    // onLoad={loaded} sandbox="allow-scripts allow-popups" ></iframe>
}

// HaveChildBits is a record of if each child cube exists and if, when we go there, it's a parent or a leaf. 
// We encode this in a single number for space and speed.
// we init with -1 for unknown, 0 for no children, and then we set the bits for the children that exist. 
// So if it's 5 then we know that child 0 and child 2 exist but child 1 does not exist.
// bit 16 is for isParent of subcube 0 etc
// best displayed in hex. 
// I hate this for being anti agile but love it for space and speed.
// but I love it because copilot typed it. lol.
export function HaveChildBits(childrenBits: number): boolean {
    return childrenBits !== -1
}
// ChildExists means there's a leaf node to be found at that child index. 
export function ChildExists(childrenBits: number, index: number): boolean {
    if (childrenBits === -1) return false
    return (childrenBits & (1 << index)) !== 0
}
// IsParent we can expect to recurse into this node.
export function IsParent(childrenBits: number, index: number): boolean {
    if (childrenBits === -1) return false
    return (childrenBits & (1 << (index + 16))) !== 0
}
export function SetChildExists(childrenBits: number, index: number, does: boolean): number {
    const abit = 1 << index
    if (does) {
        return childrenBits | abit
    } else {
        return childrenBits & ~abit
    }
}
export function SetIsParent(childrenBits: number, index: number, does: boolean): number {
    const abit = 1 << (index + 16)
    if (does) {
        return childrenBits | abit
    } else {
        return childrenBits & ~abit
    }
}

// The two big operations we need to do are:
// starting from a list of property names, get the octree nodes that correspond to those properties.
//    Then we can prune that list to the ones missing and then actually reserver them.
//    I'm doing the knotfree version first and then the cloudflare version after that.

// The second thing is to start at the top of a tree and then traverse down to the leaf codes while I was serving some kind of filter like distance.
//    then we can make a list of the ones that still need to be loaded or something. And then we can prepare them for display.

// it's pretty clear I'm going to need a cache of the ones we've already looked for. ?? or is it?

// a cache of name to cube of that cube testmain-0n0u0e5p and testmain-0n0u0e5p-0 are different entries.
export const gCubeCache: Map<string, TreeStatus> = new Map()

// interface CubeParent {
//     parent: Cube,
//     index?: number // no index for the starting cube, but for the parents we can have an index that tells us which child it is of its parent. This is useful for visualization and debugging.
// }

// ReserveResult is the accumulation of results during the process of reserving a property. 
// It includes the original list of properties we wanted to reserve, the raw chains of cubes that we would need to reserve, 
// the list of cubes that we already had in the cache, the list of cubes that we actually need to reserve, 
// a reference to the cube cache, and any error that occurred during the process.
export type ReserveResult = {
    startingProperties: string[],
    rawChains: Cube[][], // the raw chain of cubes that we would need to reserve, including the ones that are already in the cache. This is for debugging and visualization purposes.

    // thingsWeWillNeed: Cube[][], // same as rawChain. will have duplicates in the parents.
    thingsThatAlreadyExist: { cube: Cube, from: string }[],  // of all the chains, from vr or xyz
    thingsToActuallyReserve: Cube[],  // of all the chains

    cubeCache: Map<string, TreeStatus>, // a reference to the cache
    error: Error | null
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

