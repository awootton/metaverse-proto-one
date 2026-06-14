

export { };

import * as oct from '../knotfree-ts-lib/3d/UrlOctTree'

// command to execute: npx ts-node src/scripts/testStringToCube.ts

// you SUCK import { expect, test } from 'vitest' one more node link error and I'll scream

import assert from 'node:assert/strict';


// note that since p is 1 that means the cube size is 2 so all the coordinates must be even numbers
// or else it's an error. When we make it into a string it should round down to the nearest even number and then when we parse it back it should be the same as the original cube but with the coordinates rounded down to the nearest even number. 

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

var [str, eee] = oct.cubeToUrlString(testCube)
assert.equal(eee, null)
console.log(`testCube`, str, testCube)
assert.deepStrictEqual(str, "testmain-3n2u5w1p")
assert.deepStrictEqual(oct.stringToCube(str)[0], testCube)

const testCubeParent = oct.getParentCube(testCube)
const [parent3a, index] = oct.getParentCubeWithOcttreeIndex(testCube)
assert.deepStrictEqual(testCubeParent, parent3a) // silly
assert.equal(index, 5) // the 5th subcube of the parent.
var [str, eee] = oct.cubeToUrlString(testCubeParent)
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
    isParent: 5
} as oct.Cube);

console.log(`cube3 parent with octree index`, oct.getParentCubeWithOcttreeIndex(testCube))
// now, if we get the child cube of parent3 with index 5 we should get back cube3
{
    const achild = oct.getChildCube(testCubeParent, index)
    assert.deepStrictEqual(achild, testCube)
    console.log(`child`, achild)
}

{ // up 4 times
    var prevParent = testCubeParent

    for (let i = 0; i < 4; i++) {
        // getParentCubeWithOcttreeIndex returns a parent.
        // but stringToCube doesn't know
        const [newParent, aindex] = oct.getParentCubeWithOcttreeIndex(prevParent)
        {
            const tmp = oct.cubeToUrlString(newParent)[0]
            const reversed = oct.stringToCube(tmp)[0]
            assert.deepStrictEqual(newParent, reversed)
        }
        console.log(`aparent`, newParent)
        const achild = oct.getChildCube(newParent, aindex)
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
    const [acube, e] = oct.stringToCube(name)
    assert.equal(e, null)
    console.log(`cube with negative coordinates`, acube)
    assert.deepStrictEqual(acube, {
        world: "testmain",
        x: -16,
        y: -16,
        z: -16,
        p: 4
    } as oct.Cube)
    assert.deepStrictEqual(acube, oct.stringToCube(oct.cubeToUrlString(acube)[0])[0])
    for (let i = 0; i < 8; i++) {
        const child = oct.getChildCube(acube, i)
        assert.deepStrictEqual(child, oct.stringToCube(oct.cubeToUrlString(child)[0])[0])

        const parentAgain = oct.getParentCube(child)

        console.log(`child ${i}`, child)
        console.log(`parentAgain ${i}`, parentAgain)
        const toStrAndBack = oct.stringToCube(oct.cubeToUrlString(parentAgain)[0])[0]
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
        const child = oct.getChildCube(parent1, i)
        console.log(`child ${i}`, child)
        assert.deepStrictEqual(child, oct.stringToCube(oct.cubeToUrlString(child)[0])[0])
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

let parent = oct.getParentCube(child)
console.log("parent", parent)
parent = oct.getParentCube(parent)
console.log("parent", parent)
parent = oct.getParentCube(parent)
console.log("parent", parent)

console.log()

{ // half a meter
    const cubeStr = "testmain-1n0u0e-1p"
    const [parsedCube, error] = oct.stringToCube(cubeStr)
    if (error) {
        console.error(`Error parsing cube string: ${error.message}`)
    } else {

        assert.deepStrictEqual(parsedCube, oct.stringToCube(oct.cubeToUrlString(parsedCube)[0])[0])

        // console.log(`Parsed cube : ${JSON.stringify(parsedCube)} `)  
        if (parsedCube.x === 0.5 && parsedCube.y === 0 && parsedCube.z === 0 && parsedCube.p === -1) {
            console.log("Parsed cube matches expected values")
        }

        const [cubeStr2, e] = oct.cubeToUrlString(parsedCube)
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

const [cubeStr, e] = oct.cubeToUrlString(cube)
if (e) {
    console.error(`Error converting cube to string: ${e.message}`)
} else {
    console.log(`Cube string: ${cubeStr}`)
}

// should be main-4n2u1e2p

const [parsedCube, error] = oct.stringToCube(cubeStr)
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
    const [parsedCube, error] = oct.stringToCube(cubeStr)
    if (error) {
        console.error(`Error parsing cube string: ${error.message}`)
    } else {
        // console.log(`Parsed cube err : ${JSON.stringify(parsedCube)} `)  
        const [cubeStr, e] = oct.cubeToUrlString(parsedCube)
        // note that 0s means the same as 0n
        const expecting = "testmain-0n2u1e2p"
        if (cubeStr === expecting) {
            console.log("Parsed cube string matches expected string")
        } else {
            console.error(`Parsed cube string does not match expected string. Got: ${cubeStr}, expected: ${expecting}`)
        }
    }
}

