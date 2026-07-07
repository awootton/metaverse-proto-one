

export { };

import * as oct from '../knotfree-ts-lib/3d/UrlOctTree'

// command to execute: npx ts-node src/scripts/testStringToCube.ts

// you SUCK import { expect, test } from 'vitest' one more node link error and I'll scream

import assert from 'node:assert/strict';

{
    const cubeStr = "testmain-3n2u5w1p"
    const [cube, error] = oct.StringToCube(cubeStr)
    assert.equal(error, null)
    // note that since p is 1 that means the cube size is 2 so all the coordinates must be even numbers
    // or else it's an error.
}
{
    const cubeStr = "testmain-3n999u5w1p"
    const [cube, error] = oct.StringToCube(cubeStr)
    assert.equal(error, null)
    // note that since p is 1 that means the cube size is 2 so all the coordinates must be even numbers
    // or else it's an error. 
}
{
    const cubeStr = "testmain-3n999u5w-8p"
    const [cube, error] = oct.StringToCube(cubeStr)
    assert.equal(error, null)
    // note that since p is -8 that means the cube size is very small.
}

{
    const cubeStr = "testmain-3n999u5w2p-1"
    const [cube, error] = oct.StringToCube(cubeStr)
    assert.equal(error, null)
    // a parent.
}

{
    const cubeStr = "testmain-3n999u5w2p-8"
    const [cube, error] = oct.StringToCube(cubeStr)
    //assert.notEqual(error, null)
    // parent 8 is incorrect.
    if (error == null) {
        console.error("Expected an error for invalid cube string, but got none.")
    } else {
        // console.log("Received expected error for invalid cube string:", error.message)
    }

}
{
    const cubeStr = "testmain-3n999u5w2p-88"
    const [cube, error] = oct.StringToCube(cubeStr)
    // assert.notEqual(error, null)
    // parent 88 is very incorrect.
    if (error == null) {
        console.error("Expected an error for invalid cube string, but got none.")
    } else {
        // console.log("Received expected error for invalid cube string:", error.message)
    }

}




const power = 1
const cubeSize = 2 ** power // is 2
const testCube: oct.Cube = {
    world: "testmain",
    x: 3 * cubeSize, // 6
    y: 2 * cubeSize, // 4
    z: -5 * cubeSize, // -10
    p: power
}
// so this is the 3rd 2x2 cube north 
// and the 2nd 2x2 cube up
// and the 5th 2x2 cube west. So the string should be testmain-3n2u5w1p

var [str, eee] = oct.CubeToString(testCube)
assert.equal(eee, null)
console.log(`testCube`, str, testCube)
assert.deepStrictEqual(str, "testmain-3n2u5w1p")
assert.deepStrictEqual(oct.StringToCube(str)[0], testCube)

const testCubeParent = oct.GetParentCube(testCube)
const [parent3a, index] = oct.GetParentCubeWithOcttreeIndex(testCube)
assert.deepStrictEqual(testCubeParent, parent3a) // silly
assert.equal(index, 5) // the 5th subcube of the parent.
var [str, eee] = oct.CubeToString(testCubeParent)
assert.equal(eee, null)
// the 1 4x4 cube north, the 1 4x4 cube up, and the 3 4x4 cube west. So the string should be testmain-1n1u3w2p
assert.equal(str, "testmain-1n1u3w2p-5")
console.log(`testCubeParent`, str, testCubeParent)
assert.deepStrictEqual(testCubeParent, {
    world: "testmain",
    x: 4,
    y: 4,
    z: -12,
    p: 2,
    whichParent: 5
} as oct.Cube);

console.log(`cube3 parent with octree index`, oct.GetParentCubeWithOcttreeIndex(testCube))
// now, if we get the child cube of parent3 with index 5 we should get back cube3
{
    const achild = oct.GetChildCube(testCubeParent, index)
    assert.deepStrictEqual(achild, testCube)
    console.log(`child`, achild)
}

{ // up 4 times
    var prevParent = testCubeParent

    for (let i = 0; i < 4; i++) {
        // getParentCubeWithOcttreeIndex returns a parent.
        // but stringToCube doesn't know
        const [newParent, aindex] = oct.GetParentCubeWithOcttreeIndex(prevParent)
        {
            const tmp = oct.CubeToString(newParent)[0]
            const reversed = oct.StringToCube(tmp)[0]
            assert.deepStrictEqual(newParent, reversed)
        }
        console.log(`aparent`, newParent)
        const achild = oct.GetChildCube(newParent, aindex)
        // a child is not a parent, so we can't expect the isParent property to be the same.
        assert.equal(achild.world, prevParent.world)
        assert.equal(achild.x, prevParent.x)
        assert.equal(achild.y, prevParent.y)
        assert.equal(achild.z, prevParent.z)
        assert.equal(achild.p, prevParent.p)
        prevParent = newParent
    }
}


{ // all negative coordinates
    const name = "testmain-1s1d1w4p" // the first 4x4 cube south, the first 4x4 cube down, and the first 4x4 cube west. 
    const [acube, e] = oct.StringToCube(name)
    assert.equal(e, null)
    console.log(`cube with negative coordinates`, acube)
    assert.deepStrictEqual(acube, {
        world: "testmain",
        x: -16,
        y: -16,
        z: -16,
        p: 4
    } as oct.Cube)
    assert.deepStrictEqual(acube, oct.StringToCube(oct.CubeToString(acube)[0])[0])
    for (let i = 0; i < 8; i++) {
        const child = oct.GetChildCube(acube, i)
        assert.deepStrictEqual(child, oct.StringToCube(oct.CubeToString(child)[0])[0])

        const parentAgain = oct.GetParentCube(child)

        console.log(`child ${i}`, child)
        console.log(`parentAgain ${i}`, parentAgain)
        const toStrAndBack = oct.StringToCube(oct.CubeToString(parentAgain)[0])[0]
        console.log(`toStrAndBack ${i}`, toStrAndBack)
        assert.equal(parentAgain.world, acube.world)
        assert.equal(parentAgain.x, acube.x)
        assert.equal(parentAgain.y, acube.y)
        assert.equal(parentAgain.z, acube.z)
        assert.equal(parentAgain.p, acube.p)
    }
}

{   // demo the subcube index mapping
    // the 8 subcubes of a cube are indexed from 0 to 7 based on their position relative to the parent cube. 
    console.log()

    const parent1: oct.Cube = {
        world: "testmain",
        x: 0,
        y: 0,
        z: 0,
        p: 4
    }
    console.log(`parent1`, parent1)
    for (let i = 0; i < 8; i++) {
        const child = oct.GetChildCube(parent1, i)
        console.log(`child ${i}`, child)
        assert.deepStrictEqual(child, oct.StringToCube(oct.CubeToString(child)[0])[0])
    }
}
console.log()

const child: oct.Cube = {
    world: "testmain",
    x: 32,
    y: 0,
    z: 64,
    p: 5
}

let parent = oct.GetParentCube(child)
console.log("parent", parent)
parent = oct.GetParentCube(parent)
console.log("parent", parent)
parent = oct.GetParentCube(parent)
console.log("parent", parent)

console.log()

{ // half a meter
    const cubeStr = "testmain-1n0u0e-1p"
    const [parsedCube, error] = oct.StringToCube(cubeStr)
    if (error) {
        console.error(`Error parsing cube string: ${error.message}`)
    } else {

        assert.deepStrictEqual(parsedCube, oct.StringToCube(oct.CubeToString(parsedCube)[0])[0])

        // console.log(`Parsed cube : ${JSON.stringify(parsedCube)} `)  
        if (parsedCube.x === 0.5 && parsedCube.y === 0 && parsedCube.z === 0 && parsedCube.p === -1) {
            console.log("Parsed cube matches expected values")
        }

        const [cubeStr2, e] = oct.CubeToString(parsedCube)
        assert.equal(e, null)
        assert.equal(cubeStr2, "testmain-1n0u0e-1p")
    }
}



// Test cubeToString and stringToCube
const cube: oct.Cube = {
    world: "testmain",
    x: 16,
    y: 8,
    z: 4,
    p: 2
}

const [cubeStr, e] = oct.CubeToString(cube)
if (e) {
    console.error(`Error converting cube to string: ${e.message}`)
} else {
    console.log(`Cube string: ${cubeStr}`)
}

// should be main-4n2u1e2p

const [parsedCube, error] = oct.StringToCube(cubeStr)
if (error) {
    console.error(`Error parsing cube string: ${error.message}`)
} else {
    console.log(`Parsed cube: ${JSON.stringify(parsedCube)}`)
    // should be the same as the original cube
    if (JSON.stringify(parsedCube) === JSON.stringify(cube)) {
        console.log("Parsed cube matches original cube")
    } else {
        console.error("Parsed cube does not match original cube")
    }
}
{
    const cubeStr = "testmain-0s2u1e2p"
    const [parsedCube, error] = oct.StringToCube(cubeStr)
    if (error) {
        console.error(`Error parsing cube string: ${error.message}`)
    } else {
        // console.log(`Parsed cube err : ${JSON.stringify(parsedCube)} `)  
        const [cubeStr, e] = oct.CubeToString(parsedCube)
        // note that 0s means the same as 0n
        const expecting = "testmain-0n2u1e2p"
        if (cubeStr === expecting) {
            console.log("Parsed cube string matches expected string")
        } else {
            console.error(`Parsed cube string does not match expected string. Got: ${cubeStr}, expected: ${expecting}`)
        }
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
