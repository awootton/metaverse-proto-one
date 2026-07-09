
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
