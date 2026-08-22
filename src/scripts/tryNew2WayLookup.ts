
import * as oct from '../knotfree-ts-lib/3d/Dns8Tree'

// We're not using this. It's too slow.

//import {BatchFetchAndMergeControllerSlowest}  from '../knotfree-ts-lib/3d/BatchFetchAndMergeController';
import * as fetchAndMerge from '../knotfree-ts-lib/3d/BatchFetchAndMergeController'


// if you include this it starts running !!! 
//import { Expected_names , Expected_output}   from './testFailedTwoWay'


// npx ts-node src/scripts/tryNew2WayLookup.ts

// What we want: function TwoWayLookupAndMerge(cubes: oct.Cube[]): Promise<oct.TreeStatus[] | Error>
// or, maybe function TwoWayLookupAndMerge(cubes: oct.Cube[]):  [oct.TreeStatus[] | Error]
// we're just going to wait for it anyway. 

// just read these from testFailedTwoWay.ts instead of hardcoding them here. duh. we dpn't have all day.

// const inputCommaList = `testmain-0n0u0e16p-0,testmain-1s0u0e16p-1,testmain-0n1d0e16p-2,testmain-1s1d0e16p-3,
//                         testmain-0n0u1w16p-4,testmain-1s0u1w16p-5,testmain-0n1d1w16p-6,testmain-1s1d1w16p-7,
//                         testmain-0n0u0e12p-0,testmain-1n0u1w13p,testmain-0n1u0e12p,testmain-0n0u0e5p,testmain-0n0u1w12p-2`

export const Expected_names = [ // for testFailedTwoWay.ts (which doesn't actually fail anymore, but this is the list of names we want to look up in our test)
    'testmain-0n0u0e16p-0',
    'testmain-1s0u0e16p-1',
    'testmain-0n1d0e16p-2',
    'testmain-1s1d0e16p-3',
    'testmain-0n0u1w16p-4',
    'testmain-1s0u1w16p-5',
    'testmain-0n1d1w16p-6',
    'testmain-1s1d1w16p-7',
    "testmain-0n0u0e12p-0",
    'testmain-1n0u1w13p',
    'testmain-0n1u0e12p',
    'testmain-0n0u0e5p',
    'testmain-0n0u1w12p-2'
]


const exampleInput = Expected_names.map(name => oct.StringToCube(name)[0])
// console.log("Example input cubes: ", exampleInput) // why is the formatting so haphazad?


const Expected_output = [
    {
        name: 'testmain-0n0u0e16p-0',
        found: true,
        isParent: false,
        wasXYZ: false,
        addresses: ['216.128.128.195']
    },
    {
        name: 'testmain-1s0u0e16p-1',
        found: false,
        isParent: false,
        wasXYZ: false,
        addresses: undefined
    },
    {
        name: 'testmain-0n1d0e16p-2',
        found: false,
        isParent: false,
        wasXYZ: false,
        addresses: undefined
    },
    {
        name: 'testmain-1s1d0e16p-3',
        found: false,
        isParent: false,
        wasXYZ: false,
        addresses: undefined
    },
    {
        name: 'testmain-0n0u1w16p-4',
        found: true,
        isParent: false,
        wasXYZ: false,
        addresses: ['216.128.128.195']
    },
    {
        name: 'testmain-1s0u1w16p-5',
        found: false,
        isParent: false,
        wasXYZ: false,
        addresses: undefined
    },
    {
        name: 'testmain-0n1d1w16p-6',
        found: false,
        isParent: false,
        wasXYZ: false,
        addresses: undefined
    },
    {
        name: 'testmain-1s1d1w16p-7',
        found: false,
        isParent: false,
        wasXYZ: false,
        addresses: undefined
    },
    {
        name: 'testmain-0n0u0e12p-0',
        found: true,
        isParent: false,
        wasXYZ: true,
        addresses: ['status: topic not found errid=bvBbhJawYXIMWsxJOWHt']
    },
    {
        name: 'testmain-1n0u1w13p',
        found: false,
        isParent: false,
        wasXYZ: false,
        addresses: undefined
    },
    {
        name: 'testmain-0n1u0e12p',
        found: false,
        isParent: false,
        wasXYZ: false,
        addresses: undefined
    },
    {
        name: 'testmain-0n0u0e5p',
        found: true,
        isParent: false,
        wasXYZ: false,
        addresses: ['216.128.128.195']
    },
    {
        name: 'testmain-0n0u1w12p-2',
        found: false,
        isParent: false,
        wasXYZ: false,
        addresses: undefined
    }
]

const Our_Expected_Output = Expected_output // not a known type

// get this from testFailedTwoWay.ts instead of hardcoding it here. duh. we dpn't have all day.



async function doOnePass() {

    const frame = new fetchAndMerge.BatchFetchAndMergeControllerSlowest(exampleInput, "A", "")
    const [result, err] = await frame.TwoWayLookupAndMerge()

    // console.log("We're back, but are we done ? TwoWayLookupAndMerge result: ", result, " error: ", err)
    // console.log("We're back, but are we done ? TwoWayLookupAndMerge length: ", result?.length, " error: ", err)

    // check result against Expected_output, assert the results are the same.
    if (err) {
        console.error("Error occurred:", err)
        return
    }

    if (!result || result.length !== Our_Expected_Output.length) {
        console.error("Result length mismatch. Expected:", Our_Expected_Output.length, "Got:", result?.length)
        return
    }

    for (let i = 0; i < result.length; i++) {
        const actual = result[i]
        const expected = Our_Expected_Output[i] // an ad-hock object. Not a TreeStatus. We

        if (actual.name !== expected.name) {
            console.error(`A Mismatch at index ${i}: name. Expected ${expected.name}, got ${actual.name}`)
        }
        if (actual.found !== expected.found) {
            console.error(`A Mismatch at index ${i}: found. Expected ${expected.found}, got ${actual.found}`)
        }
        if (actual.isParent !== expected.isParent) {
            console.error(`A Mismatch at index ${i}: isParent. Expected ${expected.isParent}, got ${actual.isParent}`)
        }
        if (actual.wasXYZ !== expected.wasXYZ) {
            console.error(`A Mismatch at index ${i}: wasXYZ. Expected ${expected.wasXYZ}, got ${actual.wasXYZ}`)
        }
        if (JSON.stringify(actual.addresses) !== JSON.stringify(expected.addresses)) {
            console.error(`A Mismatch at index ${i}: addresses. Expected ${JSON.stringify(expected.addresses)}, got ${JSON.stringify(actual.addresses)}`)
        }
    }
    // console.log("Assertion check complete.")
    {
        // let's try the text one
        const frame = new fetchAndMerge.BatchFetchAndMergeControllerSlowest(exampleInput, "TXT", "meta_group_id")
        const [result, err] = await frame.TwoWayLookupAndMerge()

        if (!result || result.length !== Our_Expected_Output.length) {
            console.error("Result length mismatch. Expected:", Our_Expected_Output.length, "Got:", result?.length)
            return
        }

        for (let i = 0; i < result.length; i++) {
            const actual = result[i]

            if (i === 11) { // several have some text

                const want = {
                    grp: 'j9xK3mP8wL2z',
                    dbg: 'localhost:3010',
                    type: 'floor',
                    asset: 'cobblestonesgrok512.jpg:repeat:20'
                }
                // console.log("Actual groupId for index 11: ", actual.groupId)
                const actualText = JSON.stringify(actual.groupId)
                const wantText = JSON.stringify(want)
                if (actualText !== wantText) { // we don't know what the groupId will be, so just set it to the expected value for comparison.
                    console.error(`Mismatch at index ${i}: groupId. Expected ${wantText}, got ${actualText}`)
                }

                continue // the one with the group. 
            }
        }
    }

}

async function doSomething() {

    // we should totally be able to reboot knotfree in the middle of this bitch and it still works.
    // and by reboot, I mean the local server. The k8s servers only miss for seconds.
    // And, it works. 

    doOnePass()

    for (var pass = 0; pass < 60; pass++) {

        const startTime = Date.now()

        doOnePass()

        const endTime = Date.now()
        const duration = (endTime - startTime) / 1000

        console.log(`Pass ${pass} completed. Completed in ${duration} seconds.`)
        await new Promise(resolve => setTimeout(resolve, 10000)) // 10 sec.   
    }

    finished = true
}



let finished = false
setTimer()

doSomething().catch(err => {
    console.error("Error in doSomething: ", err)
})

// sleep Little darling, don't you cry, and I will sing a lullaby.
function setTimer() {
    setTimeout(() => {
        if (!finished) {
            setTimer()
        } else {
            console.log("Finished the script")
        }
    }, 100)
}


// beware of garbage on the shop floor. Wear shoes.


// we need a new one of these      result = await octload.TwoWayLookupAndMerge(needToLookUp)

// args like this:
// bvts merged list of children we need to look up for tree  :  [
//   'testmain-0n0u0e15p-0',
//   'testmain-0n0u0e15p-1',
//   'testmain-0n0u0e15p-2',
//   'testmain-0n0u0e15p-3',
//   'testmain-0n0u0e15p-4',
//   'testmain-0n0u0e15p-5',
//   'testmain-0n0u0e15p-6',
//   'testmain-0n0u0e15p-7',
//   'testmain-0n0u0e14p',
//   'testmain-1n0u0e14p',
//   'testmain-0n1u0e14p',
//   'testmain-1n1u0e14p',
//   'testmain-0n0u1e14p',
//   'testmain-1n0u1e14p',
//   'testmain-0n1u1e14p',
//   'testmain-1n1u1e14p'
// ]

// we get back 16 of these: oct.TreeStatus

// is 16 
// testmain-0n0u1w15p-0.xyz,testmain-0n0u1w15p-1.xyz,testmain-0n0u1w15p-2.xyz,testmain-0n0u1w15p-3.xyz,
// testmain-0n0u1w15p-4.xyz,testmain-0n0u1w15p-5.xyz,testmain-0n0u1w15p-6.xyz,testmain-0n0u1w15p-7.xyz,

// testmain-0n0u2w14p.xyz,testmain-1n0u2w14p.xyz,testmain-0n1u2w14p.xyz,testmain-1n1u2w14p.xyz,
// testmain-0n0u1w14p.xyz,testmain-1n0u1w14p.xyz,testmain-0n1u1w14p.xyz,testmain-1n1u1w14p.xyz

// // is 16
// testmain-0n0u1w15p-0.vr,testmain-0n0u1w15p-1.vr,testmain-0n0u1w15p-2.vr,testmain-0n0u1w15p-3.vr,
// testmain-0n0u1w15p-4.vr,testmain-0n0u1w15p-5.vr,testmain-0n0u1w15p-6.vr,testmain-0n0u1w15p-7.vr,

// testmain-0n0u2w14p.vr,testmain-1n0u2w14p.vr,testmain-0n1u2w14p.vr,testmain-1n1u2w14p.vr,
// testmain-0n0u1w14p.vr,testmain-1n0u1w14p.vr,testmain-0n1u1w14p.vr,testmain-1n1u1w14p.vr

// The problem is that when any name returns a 2 we have to do the whole batch again.
//  I'm having trouble reproducing this. Maybe it's better to do them separately and then merge them together.
// also batch mode is non-standard dns over https.


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
