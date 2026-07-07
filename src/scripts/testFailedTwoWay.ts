
import * as oct from '../knotfree-ts-lib/3d/UrlOctTree'

import * as dnstypes from '../knotfree-ts-lib/3d/DnsTypes'
import * as loaders from '../knotfree-ts-lib/3d/OctTreeLoaders'
// import * as fetchAndMerge from '../knotfree-ts-lib/3d/BatchFetchAndMergeController'


// path: 
// npx ts-node src/scripts/testFailedTwoWay.ts


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

var getMeCommaStr = Expected_names.map(name => {
  const [cube, err] = oct.StringToCube(name)
  if (err) {
    console.error(`Error converting string to cube for ${name}: ${err}`)
    throw new Error(`Error converting string to cube for ${name}: ${err}`)
  }
  return oct.CubeToString(cube)[0]
}).join(",")

// this was produced by the script below. 
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
    found: true,
    isParent: false,
    wasXYZ: false,
    addresses: ['216.128.128.195']
  },
  {
    name: 'testmain-1s1d0e16p-3',
    found: true,
    isParent: false,
    wasXYZ: false,
    addresses: ['216.128.128.195']
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
    found: true,
    isParent: false,
    wasXYZ: false,
    addresses: ['216.128.128.195']
  },
  {
    name: 'testmain-1s1d1w16p-7',
    found: true,
    isParent: false,
    wasXYZ: false,
    addresses: ['216.128.128.195']
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

// Dude, this works against prod in Go tests. What am I doing wrong? 
async function test() {

  // dnstypes.SetKnotfreeServer("https://knotfree.net") // test in prod.

  // const getMe = JSON.parse(getMeStr) as oct.Cube[]
  console.log("getMeCommaStr: ", getMeCommaStr)

  const [getMeCubeList, err] = oct.ParseCubeList(getMeCommaStr)
  if (err) {
    console.error("Error parsing getMeCommaStr: ", err)
    return
  }

  for (var pass = 0; pass < 1; pass++) {

    const startTime = Date.now()
    const cl: oct.Cube[] = getMeCubeList
    const prom = loaders.TwoWayLookupAndMerge(cl)
    const [result, err] = await prom
    // console.log("result: ", result)
    if (err) {
      console.error(`FAIL Error in TwoWayLookupAndMerge: ${err}`)
      continue
    }
    if (pass === 0) {
      const expectedResult = result.map(treeStatus => {
        // console.log(`cube name: ${treeStatus.name} found: ${treeStatus.found} wasXYZ: ${treeStatus.wasXYZ} isParent: ${treeStatus.isParent}`)
        return {
          name: treeStatus.name,
          found: treeStatus.found,
          isParent: treeStatus.isParent,
          wasXYZ: treeStatus.wasXYZ,
          addresses: treeStatus.addresses
        }
      })
      // console.log("const Expected_output = ", expectedResult)
    }
    const endTime = Date.now()
    const duration = (endTime - startTime) / 1000
    let i = 0
    for (const ts of result) {
      if (i === 0 || i === 4 || i === 8 || i === 11) {
        if (!ts.found) {
          console.error(`Test failed. Expected cube ${ts.name} to be found. ${ts.name} was not found.`, i)
        }
      } else {
        if (ts.found) {
          console.error(`Test failed. Expected cube ${ts.name} to NOT be found. But it was found.`, i)
        }
      }
      // console.log(`Tree status for ${ts.name}: found=${ts.found}, isParent=${ts.isParent}, wasXYZ=${ts.wasXYZ}`)
      i++
    }
    console.log(`Pass ${pass} completed. Completed in ${duration} seconds.`)
    await new Promise(resolve => setTimeout(resolve, 10000)) // faster !!!   
  }
}

test()

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
