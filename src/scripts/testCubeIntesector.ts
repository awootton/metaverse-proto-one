
import * as oct from '../knotfree-ts-lib/3d/UrlOctTree'
import * as octload from '../knotfree-ts-lib/3d/OctTreeLoaders'
import * as atwdns from '../knotfree-ts-lib/3d/DnsTypes'
import * as namesapi from '../knotfree-ts-lib/3d/NamesApi'

import assert from 'node:assert/strict';

// the idea is that we have a list of known properties, as cubes, 
// and we also have huge list of 'samples' that are available.
// we want to toss the owned cubes into AN octtree and then use that to cull the list of samples.

// command me, master: npx ts-node src/scripts/testCubeIntesector.ts


const knownCubes = "testmain-0n0u0e5p,testmain-2n0u5w2p,testmain-2n0u4w2p"
const knownCubesList = knownCubes.split(",").map(c => {
    const [cube, err] = oct.StringToCube(c)
    if (err) {
        console.error(`Error converting string to cube for ${c}: ${err}`)
        return null
    }
    return cube
}).filter(cube => cube !== null) as oct.Cube[]

console.log("Known cubes: ", knownCubesList)

const intersector = new oct.OctTreeIntersector("testmain")

// show me the root:
// console.log("Octree root: ", intersector.root)

intersector.AddKnownCube(oct.StringToCube("testmain-2n0u5w2p")[0]!)

// how does it feel about doing it twice? It should be idempotent.
intersector.AddKnownCube(oct.StringToCube("testmain-2n0u5w2p")[0]!)

for (const cube of knownCubesList) {
    const err = intersector.AddKnownCube(cube)
    if (err) {
        console.error(`Error adding cube ${cube.world}-${cube.x}n${cube.y}u${cube.z}e${cube.p}p to octree: ${err}`)
    }
}

{ // the testmain-2n0u4w2p is under this 4p so it should intersect.
    let found = intersector.CheckForIntersection(oct.StringToCube("testmain-0n0u1w4p")[0]!)
    console.log("CheckForIntersection for testmain-0n0u1w4p: ", found[0], "Error: ", found[1])
    assert(found[0] === true, "Expected intersection for testmain-0n0u1w4p")
    assert(found[1] === null, "Expected no error for testmain-0n0u1w4p")
}

// the courtyard, testmain-0n0u0e5p , is in the tree.
{
    let found = intersector.CheckForIntersection(oct.StringToCube("testmain-0n0u0e5p")[0]!)
    console.log("CheckForIntersection for testmain-0n0u0e5p: ", found[0], "Error: ", found[1])
    assert(found[0] === true, "Expected intersection for testmain-0n0u0e5p")
    assert(found[1] === null, "Expected no error for testmain-0n0u0e5p")
}
{ // check the 6p
    let found = intersector.CheckForIntersection(oct.StringToCube("testmain-0n0u0e6p")[0]!)
    console.log("CheckForIntersection for testmain-0n0u0e6p: ", found[0], "Error: ", found[1])
    assert(found[0] === true, "Expected intersection for testmain-0n0u0e6p")
    assert(found[1] === null, "Expected no error for testmain-0n0u0e6p")

}
{ // check the 4p
    let found = intersector.CheckForIntersection(oct.StringToCube("testmain-0n0u0e4p")[0]!)
    console.log("CheckForIntersection for testmain-0n0u0e4p: ", found[0], "Error: ", found[1])
    assert(found[0] === true, "Expected intersection for testmain-0n0u0e4p")
    assert(found[1] === null, "Expected no error for testmain-0n0u0e5p")

}
{ // check the 4p but different x,y,z
    let found = intersector.CheckForIntersection(oct.StringToCube("testmain-1n0u0e4p")[0]!)
    console.log("CheckForIntersection for testmain-1n0u0e4p: ", found[0], "Error: ", found[1])
    assert(found[0] === true, "Expected intersection for testmain-1n0u0e4p")
    assert(found[1] === null, "Expected no error for testmain-0n0u0e5p")
}
{ // check the 4p but different just to the east so it should not intersect.
    let found = intersector.CheckForIntersection(oct.StringToCube("testmain-1n0u2e4p")[0]!)
    console.log("CheckForIntersection for testmain-1n0u2e4p: ", found[0], "Error: ", found[1])
    assert(found[0] === false, "Expected no intersection for testmain-1n0u2e4p")
    assert(found[1] === null, "Expected no error for testmain-1n0u2e4p")
}


// intersector.PrintTheTree()

// You probably wonder if I leave scrap material lying around in my shop. Why, yes Virginia I do. 
// I clean it up later.
// type octTreeNodeChildType = octTreeNode | null

// type octTreeNode = {
//     cube: oct.Cube;
//     occupied: boolean;
//     children: (octTreeNodeChildType)[];
// }

// export const specialCheckingModeError: Error = new Error(`Este espacio ya está ocupado`)

// export class OctTreeIntersector {

//     root: octTreeNode[] = new Array(8).fill(null)
//     inCheckingMode: boolean = false

//     constructor() {
//         // we should fill the root.
//         // it SPANS THE ORIGIN at level 16.
//         // my little friend helping types fast but is not clever.
//         const from = "testmain-1s1d1w16p" // this is way more fun.
//         const to = "testmain-0n0u0e16p"
//         const [rootCubeStrings, err] = oct.FromXToYString(from, to)
//         const [rootCubeArray, err2] = oct.ParseCubeList(rootCubeStrings)
//         // console.log("OctTreeIntersector rootCubeStrings: ", rootCubeStrings)
//         this.root = rootCubeArray.map(cube => {
//             return {
//                 occupied: false,
//                 cube: cube,
//                 children: new Array(8).fill(null)
//             }
//         })
//         // note that it starts with cube: { world: 'testmain', x: -65536, y: -65536, z: -65536, p: 16 }
//         // and 0,0,0 is at index 7.
//         // console.log("OctTreeIntersector initialized with root: ", this.root)
//     }

//     // The three checking mode conditions are:
//     // 1. We just find a cube that is already occupied. We don't care about the rest of the tree. theNotNullNode.occupied && this.inCheckingMode
//     // 2. We try to leave the known tree. Never make new children in checking mode. If we are checking, then we are just looking for intersections. If there is no child node, then there is no intersection.
//     // 3. We get to a node, with children, that matches. The existance of the children means there's an intersection. 

//     recurse(node: octTreeNodeChildType, cube: oct.Cube, depth: number): (Error | null) {

//         if (depth > 64) {
//             // Loath a throw. Loath All Throws. throw new Error(`Depth exceeded while trying to add cube ${cube.world}-${cube.x}n${cube.y}u${cube.z}e${cube.p}p to octree. This should never happen.`) 
//             // ask Robert Griesemer to explain. 
//             console.error(`Depth exceeded while trying to add cube ${cube.world}-${cube.x}n${cube.y}u${cube.z}e${cube.p}p to octree. This should never happen.`)
//             // ironically, in isCheckingMode ...
//             if (this.inCheckingMode) {
//                 return specialCheckingModeError
//             }
//             return new Error(`Depth exceeded while trying to add cube ${cube.world}-${cube.x}n${cube.y}u${cube.z}e${cube.p}p to octree. This should never happen.`)
//         }
//         const theNotNullNode = node as octTreeNode
//         if (theNotNullNode.occupied && this.inCheckingMode) {
//             return specialCheckingModeError // obviously
//         }
//         const isSameCube = oct.IsSameCube(theNotNullNode.cube, cube)
//         if (isSameCube) {
//             if (this.inCheckingMode) {
//                 // what if it matches but is not occupied?
//                 // Then there would be a child in it's slot. 
//                 // if (theNotNullNode.occupied) {
//                 //     return specialCheckingModeError
//                 // }
//                 // return specialCheckingModeError
//                 // more checking coming up.
//             } else {
//                 theNotNullNode.occupied = true
//                 return null// and, we're done.
//             }
//         }
//         // well, ok, which child is it?
//         const halfSize = 2 ** (theNotNullNode.cube.p - 1)
//         const nodePower = 2 ** (theNotNullNode.cube.p)
//         const cubePower = 2 ** (cube.p)

//         let index = 0
//         if (cube.x >= theNotNullNode.cube.x + halfSize) {
//             index += 1
//         }
//         if (cube.y >= theNotNullNode.cube.y + halfSize) {
//             index += 2
//         }
//         if (cube.z >= theNotNullNode.cube.z + halfSize) {
//             index += 4
//         }
//         let childNode = theNotNullNode.children[index]
//         if (childNode === null) { // make a new one. A smaller one. 
//             // never make new children in checking mode. If we are checking, then we are just looking for intersections. If there is no child node, then there is no intersection.
//             if (this.inCheckingMode) {
//                 return null // no intersection, because there is no child node. we're done.
//             }
//             const subCube = oct.GetChildCube(theNotNullNode.cube, index)
//             childNode = {
//                 cube: subCube,
//                 occupied: false,
//                 children: new Array(8).fill(null)
//             }
//             theNotNullNode.children[index] = childNode
//         }
//         if (this.inCheckingMode && isSameCube) {
//             if (childNode !== null) {
//                 return specialCheckingModeError
//             }
//         }
//         // console.log("is", (childNode as octTreeNode).cube, "closer to", cube, "?")
//         // and, you know, recurse.
//         return this.recurse(childNode, cube, depth + 1)
//     }

//     AddKnownCube(cube: oct.Cube): (Error | null) {
//         // we assume that the coordintes are += 64k. Check that?
//         // we want to add this cube to the octree. We need to find the correct place for it in the tree and then add it there. 
//         // we can do this by starting at the root and then going down the tree until we find the correct place for it. duh, thanks copilot.
//         let index = 0
//         if (cube.x >= 0) {
//             index += 1
//         }
//         if (cube.y >= 0) {
//             index += 2
//         }
//         if (cube.z >= 0) {
//             index += 4
//         }
//         // console.log("Adding cube: ", cube, " to octree at index: ", index)
//         const node = this.root[index]
//         if (node === null) {
//             // this can never happen. the root is always filled with nodes that span the origin.
//             return new Error(`No node at root for index ${index} for cube ${cube.world}-${cube.x}n${cube.y}u${cube.z}e${cube.p}p`)
//         }
//         // if there is no node at this index, then we can just add the cube here.
//         const err = this.recurse(node, cube, 0)
//         return err
//     }

//     CheckForIntersection(cube: oct.Cube): [boolean, Error | null] {
//         // I don't want to write another traversal. Just hack the one we have.
//         this.inCheckingMode = true
//         const err = this.AddKnownCube(cube)
//         this.inCheckingMode = false
//         const wasIntersecting = err === specialCheckingModeError
//         if (wasIntersecting === false) {
//             // did something weird happen? 
//             return [wasIntersecting, err]
//         }
//         return [wasIntersecting, null]
//     }

//     PrintTheTree() { // my angel wrote this for me. I am a monster. I am a genius. I am a monster genius.
//         // I have a dream and in the morning there's code. 
//         const printNode = (node: octTreeNodeChildType, index: number, depth: number) => {
//             if (node === null) {
//                 return
//             }
//             const theNotNullNode = node as octTreeNode
//             const cube = oct.CubeToUrlString(theNotNullNode.cube)[0]
//             console.log(`${' '.repeat(depth * 2)}- ${index}- ${cube} ${theNotNullNode.occupied ? '(occupied)' : ''}`)
//             let i = 0
//             for (const child of theNotNullNode.children) {
//                 printNode(child, i, depth + 1)
//                 i++
//             }
//         }
//         console.log("Loaded intersector dump:")
//         let index = 0
//         for (const node of this.root) {
//             printNode(node, index, 0)
//             index++
//         }
//     }
// }
