
import * as oct from '../knotfree-ts-lib/3d/UrlOctTree'

import * as atwdns from '../knotfree-ts-lib/3d/DnsTypes'
import * as octload from '../knotfree-ts-lib/3d/OctTreeLoaders'


// path: 
// npx ts-node src/scripts/testFailedTwoWay.ts


// these are the 16th level octants.
// we get them first to know to not recurse into the empty ones
const getMeStr = `[
  {
    "world": "testmain",
    "x": 0,
    "y": 0,
    "z": 0,
    "p": 16,
    "whichParent": 0
  },
  {
    "world": "testmain",
    "x": -65536,
    "y": 0,
    "z": 0,
    "p": 16,
    "whichParent": 1
  },
  {
    "world": "testmain",
    "x": 0,
    "y": -65536,
    "z": 0,
    "p": 16,
    "whichParent": 2
  },
  {
    "world": "testmain",
    "x": -65536,
    "y": -65536,
    "z": 0,
    "p": 16,
    "whichParent": 3
  },
  {
    "world": "testmain",
    "x": 0,
    "y": 0,
    "z": -65536,
    "p": 16,
    "whichParent": 4
  },
  {
    "world": "testmain",
    "x": -65536,
    "y": 0,
    "z": -65536,
    "p": 16,
    "whichParent": 5
  },
  {
    "world": "testmain",
    "x": 0,
    "y": -65536,
    "z": -65536,
    "p": 16,
    "whichParent": 6
  },
  {
    "world": "testmain",
    "x": -65536,
    "y": -65536,
    "z": -65536,
    "p": 16,
    "whichParent": 7
  }
]`

// The FAIL here is when it's retrying over and over and then finally gives up and returns an error. 
// It's not that it gets a wrong answer, it's that it never gets an answer.

async function test() {

  const getMe = JSON.parse(getMeStr)
  // console.log("getMe: ", getMe)
  const result = await octload.TwoWayLookupAndMerge(getMe)
  console.log("result: ", result)
  // only the first one should be 'found', the rest should be empty.
  // todo: make test.

  // const rawChain = getMe
  // const prefix = ""

  // const vrNames: string[] = []
  // const zyzNames: string[] = []
  // for (const cubeParent of rawChain) {
  //     const [name, err] = oct.cubeToUrlString(cubeParent)
  //     if (err) {
  //         //  console.log(`Error converting cube to URL string: ${err}`)
  //         continue
  //     }
  //     let vrName = `${name}.vr`
  //     let xyzName = `${name}.xyz`
  //     if (prefix) {
  //         vrName = `${prefix}.${vrName}`
  //         xyzName = `${prefix}.${xyzName}`
  //     }
  //     vrNames.push(vrName)
  //     zyzNames.push(xyzName)
  // }
  // const vrCommaNames = vrNames.join(",")


  // const result = await atwdns.FetchDnsResponseTryHard(vrCommaNames, "A", "none-no-dns-server", true, getMe.length)
  // console.log("result: ", result)
}

test()