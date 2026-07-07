import * as oct from '../knotfree-ts-lib/3d/UrlOctTree'


// also test FromXToY

// npx ts-node src/scripts/showMeTheParents.ts


{
    let [result, err] = oct.FromXToY("from testmain-3n0u3e3p to testmain-3n0u3w3p")
    if (err) {
        console.error("Error: ", err)
    } else {
        console.log("Result: ", result)
    }
    let wantedResult = "testmain-3n0u3e3p,testmain-3n0u2e3p,testmain-3n0u1e3p,testmain-3n0u0e3p,testmain-3n0u1w3p,testmain-3n0u2w3p,testmain-3n0u3w3p"
    if (result !== wantedResult) {
        console.error(`Test failed. Expected: ${wantedResult}, got: ${result}`)
    } else {
        console.log("Test passed.")
    }
}
{
    // try the reverse direction too.
    let [result, err] = oct.FromXToY("from testmain-3n0u3w3p to testmain-3n0u3e3p")
    if (err) {
        console.error("Error: ", err)
    } else {
        console.log("Result: ", result)
    }
    // it's the same result but reversed, because we are going from the same cube to the same cube, just in reverse order. So we should get the same cubes but in reverse order.
    let wantedResult = "testmain-3n0u3w3p,testmain-3n0u2w3p,testmain-3n0u1w3p,testmain-3n0u0e3p,testmain-3n0u1e3p,testmain-3n0u2e3p,testmain-3n0u3e3p"
    if (result !== wantedResult) {
        console.error(`Test failed. Expected: ${wantedResult}, got: ${result}`)
    } else {
        console.log("Test passed.")
    }
}

{
    // generate a 4x4 square.
    let [result, err] = oct.FromXToY("from testmain-2s0u2w3p to testmain-1n0u1e3p")
    if (err) {
        console.error("Error: ", err)
    } else {
        console.log("Result: ", result)
    }
    // is it 16? 
    if (result.split(",").length !== 16) {
        console.error(`Test failed. Expected 16 cubes, got: ${result.split(",").length}`)
    }
    let wantedResult =    "testmain-2s0u2w3p,testmain-1s0u2w3p,testmain-0n0u2w3p,testmain-1n0u2w3p,testmain-2s0u1w3p,testmain-1s0u1w3p,testmain-0n0u1w3p,testmain-1n0u1w3p,testmain-2s0u0e3p,testmain-1s0u0e3p,testmain-0n0u0e3p,testmain-1n0u0e3p,testmain-2s0u1e3p,testmain-1s0u1e3p,testmain-0n0u1e3p,testmain-1n0u1e3p"
    let oldwantedResult = "testmain-2s0u2w3p,testmain-2s0u1w3p,testmain-2s0u0e3p,testmain-2s0u1e3p,testmain-1s0u2w3p,testmain-1s0u1w3p,testmain-1s0u0e3p,testmain-1s0u1e3p,testmain-0n0u2w3p,testmain-0n0u1w3p,testmain-0n0u0e3p,testmain-0n0u1e3p,testmain-1n0u2w3p,testmain-1n0u1w3p,testmain-1n0u0e3p,testmain-1n0u1e3p"
    // it's the same but the order changed.
    if (result !== wantedResult) {
        console.error(`Test failed. Expected: ${wantedResult}, got: ${result}`)
    } else {
        console.log("Test passed.")
    }
}


function showMeTheParents(cube: oct.Cube) {
    while (true) {
        const [parent, octtreeIndex] = oct.GetParentCubeWithOcttreeIndex(cube)
        parent.whichParent = octtreeIndex
        // console.log("parents: ", parent, "octtreeIndex: ", octtreeIndex, "name: ", oct.cubeToUrlString(parent)[0])
        console.log("parents: ", "octtreeIndex: ", octtreeIndex, "name: ", oct.CubeToString(parent)[0])

        if (parent.p == 16) {
            break
        }
        cube = parent
    }
}

let property = "testmain-0n0u0e5p"
let cube: oct.Cube = oct.StringToCube(property)[0]
console.log("cube: ", cube)
showMeTheParents(cube)

// These are the 8 32 meter cubes around the origin.
// who are their top level parents? I want to show the whole path up to the top.
const names = [
    'testmain-0n0u0e5p',
    'testmain-1s0u0e5p',
    'testmain-0n1d0e5p',
    'testmain-1s1d0e5p',
    'testmain-0n0u1w5p',
    'testmain-1s0u1w5p',
    'testmain-0n1d1w5p',
    'testmain-1s1d1w5p'
]

for (const name of names) {
    let cube: oct.Cube = oct.StringToCube(name)[0]
    console.log("cube: ", cube)
    showMeTheParents(cube)
}

/*
cube:  { world: 'testmain', x: 0, y: 0, z: 0, p: 5 }
parents:  octtreeIndex:  0 name:  testmain-0n0u0e6p-0
parents:  octtreeIndex:  0 name:  testmain-0n0u0e7p-0
parents:  octtreeIndex:  0 name:  testmain-0n0u0e8p-0
parents:  octtreeIndex:  0 name:  testmain-0n0u0e9p-0
parents:  octtreeIndex:  0 name:  testmain-0n0u0e10p-0
parents:  octtreeIndex:  0 name:  testmain-0n0u0e11p-0
parents:  octtreeIndex:  0 name:  testmain-0n0u0e12p-0
parents:  octtreeIndex:  0 name:  testmain-0n0u0e13p-0
parents:  octtreeIndex:  0 name:  testmain-0n0u0e14p-0
parents:  octtreeIndex:  0 name:  testmain-0n0u0e15p-0
parents:  octtreeIndex:  0 name:  testmain-0n0u0e16p-0
cube:  { world: 'testmain', x: -32, y: 0, z: 0, p: 5 }
parents:  octtreeIndex:  1 name:  testmain-1s0u0e6p-1
parents:  octtreeIndex:  1 name:  testmain-1s0u0e7p-1
parents:  octtreeIndex:  1 name:  testmain-1s0u0e8p-1
parents:  octtreeIndex:  1 name:  testmain-1s0u0e9p-1
parents:  octtreeIndex:  1 name:  testmain-1s0u0e10p-1
parents:  octtreeIndex:  1 name:  testmain-1s0u0e11p-1
parents:  octtreeIndex:  1 name:  testmain-1s0u0e12p-1
parents:  octtreeIndex:  1 name:  testmain-1s0u0e13p-1
parents:  octtreeIndex:  1 name:  testmain-1s0u0e14p-1
parents:  octtreeIndex:  1 name:  testmain-1s0u0e15p-1
parents:  octtreeIndex:  1 name:  testmain-1s0u0e16p-1
cube:  { world: 'testmain', x: 0, y: -32, z: 0, p: 5 }
parents:  octtreeIndex:  2 name:  testmain-0n1d0e6p-2
parents:  octtreeIndex:  2 name:  testmain-0n1d0e7p-2
parents:  octtreeIndex:  2 name:  testmain-0n1d0e8p-2
parents:  octtreeIndex:  2 name:  testmain-0n1d0e9p-2
parents:  octtreeIndex:  2 name:  testmain-0n1d0e10p-2
parents:  octtreeIndex:  2 name:  testmain-0n1d0e11p-2
parents:  octtreeIndex:  2 name:  testmain-0n1d0e12p-2
parents:  octtreeIndex:  2 name:  testmain-0n1d0e13p-2
parents:  octtreeIndex:  2 name:  testmain-0n1d0e14p-2
parents:  octtreeIndex:  2 name:  testmain-0n1d0e15p-2
parents:  octtreeIndex:  2 name:  testmain-0n1d0e16p-2
cube:  { world: 'testmain', x: -32, y: -32, z: 0, p: 5 }
parents:  octtreeIndex:  3 name:  testmain-1s1d0e6p-3
parents:  octtreeIndex:  3 name:  testmain-1s1d0e7p-3
parents:  octtreeIndex:  3 name:  testmain-1s1d0e8p-3
parents:  octtreeIndex:  3 name:  testmain-1s1d0e9p-3
parents:  octtreeIndex:  3 name:  testmain-1s1d0e10p-3
parents:  octtreeIndex:  3 name:  testmain-1s1d0e11p-3
parents:  octtreeIndex:  3 name:  testmain-1s1d0e12p-3
parents:  octtreeIndex:  3 name:  testmain-1s1d0e13p-3
parents:  octtreeIndex:  3 name:  testmain-1s1d0e14p-3
parents:  octtreeIndex:  3 name:  testmain-1s1d0e15p-3
parents:  octtreeIndex:  3 name:  testmain-1s1d0e16p-3
cube:  { world: 'testmain', x: 0, y: 0, z: -32, p: 5 }
parents:  octtreeIndex:  4 name:  testmain-0n0u1w6p-4
parents:  octtreeIndex:  4 name:  testmain-0n0u1w7p-4
parents:  octtreeIndex:  4 name:  testmain-0n0u1w8p-4
parents:  octtreeIndex:  4 name:  testmain-0n0u1w9p-4
parents:  octtreeIndex:  4 name:  testmain-0n0u1w10p-4
parents:  octtreeIndex:  4 name:  testmain-0n0u1w11p-4
parents:  octtreeIndex:  4 name:  testmain-0n0u1w12p-4
parents:  octtreeIndex:  4 name:  testmain-0n0u1w13p-4
parents:  octtreeIndex:  4 name:  testmain-0n0u1w14p-4
parents:  octtreeIndex:  4 name:  testmain-0n0u1w15p-4
parents:  octtreeIndex:  4 name:  testmain-0n0u1w16p-4
cube:  { world: 'testmain', x: -32, y: 0, z: -32, p: 5 }
parents:  octtreeIndex:  5 name:  testmain-1s0u1w6p-5
parents:  octtreeIndex:  5 name:  testmain-1s0u1w7p-5
parents:  octtreeIndex:  5 name:  testmain-1s0u1w8p-5
parents:  octtreeIndex:  5 name:  testmain-1s0u1w9p-5
parents:  octtreeIndex:  5 name:  testmain-1s0u1w10p-5
parents:  octtreeIndex:  5 name:  testmain-1s0u1w11p-5
parents:  octtreeIndex:  5 name:  testmain-1s0u1w12p-5
parents:  octtreeIndex:  5 name:  testmain-1s0u1w13p-5
parents:  octtreeIndex:  5 name:  testmain-1s0u1w14p-5
parents:  octtreeIndex:  5 name:  testmain-1s0u1w15p-5
parents:  octtreeIndex:  5 name:  testmain-1s0u1w16p-5
cube:  { world: 'testmain', x: 0, y: -32, z: -32, p: 5 }
parents:  octtreeIndex:  6 name:  testmain-0n1d1w6p-6
parents:  octtreeIndex:  6 name:  testmain-0n1d1w7p-6
parents:  octtreeIndex:  6 name:  testmain-0n1d1w8p-6
parents:  octtreeIndex:  6 name:  testmain-0n1d1w9p-6
parents:  octtreeIndex:  6 name:  testmain-0n1d1w10p-6
parents:  octtreeIndex:  6 name:  testmain-0n1d1w11p-6
parents:  octtreeIndex:  6 name:  testmain-0n1d1w12p-6
parents:  octtreeIndex:  6 name:  testmain-0n1d1w13p-6
parents:  octtreeIndex:  6 name:  testmain-0n1d1w14p-6
parents:  octtreeIndex:  6 name:  testmain-0n1d1w15p-6
parents:  octtreeIndex:  6 name:  testmain-0n1d1w16p-6
cube:  { world: 'testmain', x: -32, y: -32, z: -32, p: 5 }
parents:  octtreeIndex:  7 name:  testmain-1s1d1w6p-7
parents:  octtreeIndex:  7 name:  testmain-1s1d1w7p-7
parents:  octtreeIndex:  7 name:  testmain-1s1d1w8p-7
parents:  octtreeIndex:  7 name:  testmain-1s1d1w9p-7
parents:  octtreeIndex:  7 name:  testmain-1s1d1w10p-7
parents:  octtreeIndex:  7 name:  testmain-1s1d1w11p-7
parents:  octtreeIndex:  7 name:  testmain-1s1d1w12p-7
parents:  octtreeIndex:  7 name:  testmain-1s1d1w13p-7
parents:  octtreeIndex:  7 name:  testmain-1s1d1w14p-7
parents:  octtreeIndex:  7 name:  testmain-1s1d1w15p-7
parents:  octtreeIndex:  7 name:  testmain-1s1d1w16p-7
*/

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
