
import * as dd from '../knotfree-ts-lib/3d/messageTypes';

// command to execute: npx ts-node src/scripts/testStringToCube.ts


const parent1: dd.Cube = {
    world: "testmain",
    x: 0,
    y: 0,
    z: 0,
    p: 4
}

console.log(`parent1`, parent1)

for (let i = 0; i < 8; i++) {
    const child = dd.getChildCube(parent1, i)
    console.log(`child ${i}`, child)
}

console.log()

const child: dd.Cube = {
    world: "testmain",
    x: 32,
    y: 0,
    z: 64,
    p: 5
}

let parent = dd.getParentCube(child)
console.log("parent", parent)
parent = dd.getParentCube(parent)
console.log("parent", parent)
parent = dd.getParentCube(parent)
console.log("parent", parent)



console.log()

{ // half a meter
    const cubeStr = "main-1n0u0e-1p"
    const [parsedCube, error] = dd.stringToCube(cubeStr)
    if (error.message) {
        console.error(`Error parsing cube string: ${error.message}`)
    } else {
        // console.log(`Parsed cube : ${JSON.stringify(parsedCube)} `)  
        if (parsedCube.x === 0.5 && parsedCube.y === 0 && parsedCube.z === 0 && parsedCube.p === -1) {
            console.log("Parsed cube matches expected values")
        }
        const [cubeStr, e] = dd.cubeToString(parsedCube)
        if (cubeStr === "testmain-1n0u0e-1p") {
            console.log("Parsed cube string matches expected string")
        } else {
            console.error(`Parsed cube string does not match expected string. Got: ${cubeStr}, expected: testmain-1n0u0e-1p`)
        }
    }
}



// Test cubeToString and stringToCube
const cube: dd.Cube = {
    world: "testmain",
    x: 16,
    y: 8,
    z: 4,
    p: 2
}

const [cubeStr, e] = dd.cubeToString(cube)
if (e.message) {
    console.error(`Error converting cube to string: ${e.message}`)
} else {
    console.log(`Cube string: ${cubeStr}`)
}

// should be main-4n2u1e2p

const [parsedCube, error] = dd.stringToCube(cubeStr)
if (error.message) {
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
    const [parsedCube, error] = dd.stringToCube(cubeStr)
    if (error.message) {
        console.error(`Error parsing cube string: ${error.message}`)
    } else {
        // console.log(`Parsed cube err : ${JSON.stringify(parsedCube)} `)  
        const [cubeStr, e] = dd.cubeToString(parsedCube)
        // note that 0s means the same as 0n
        const expecting = "testmain-0n2u1e2p"
        if (cubeStr === expecting) {
            console.log("Parsed cube string matches expected string")
        } else {
            console.error(`Parsed cube string does not match expected string. Got: ${cubeStr}, expected: ${expecting}`)
        }
    }
}

