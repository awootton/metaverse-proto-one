import { assert } from 'console';


import * as oct from '../knotfree-ts-lib/3d/UrlOctTree'
import * as atwdns from '../knotfree-ts-lib/3d/DnsTypes'

import * as utils from '../knotfree-ts-lib/3d/utils';

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


// type fetchTracker = {
//     name: string,
//     cube: oct.Cube,
//     index: number,
//     isXYZ: boolean,
//     hadProblem: boolean
// }

// // I just need something that always works so I can get other things done. I don't care if it's slow. 
// // I just need to get the right answer. Agile rules. I can use it to compare with the fancy version later.
// // BatchFetchAndMergeController is a wrapper for all the other fetches we'll be running.
// // The main thing is we want to re-run some of them, however that works. 
// // we're checking the cache before we get here.
// // We compare the .vr and .xyz results. And pick the best one. If either one is a 2, we have to do it again.
// // The results will be made into a TreeStatus.
// export class BatchFetchAndMergeControllerSlowest {

//     cubes: oct.Cube[]
//     fetchTrackers: fetchTracker[]    // we do one .vr and one .xyz for each cube.
//     promises: Promise<Response>[]   // we do one .vr and one .xyz for each cube.
//     type: "TXT" | "A"
//     prefix: string
//     // I heard this is how the cool kids do it. 
//     signal: AbortSignal
//     controller: AbortController

//     dnsResponses: atwdns.DnsResponse[]   // we do one .vr and one .xyz for each cube.
//     theDamnAnswers: oct.TreeStatus[]   // we do one .vr and one .xyz for each cube.

//     problemChildren = new Map<fetchTracker, number>() // this is the set of cube names that had problems. We want to retry these.

//     constructor(cubes: oct.Cube[], type: "TXT" | "A", prefix: string) {
//         this.cubes = cubes
//         this.type = type
//         this.prefix = prefix
//         this.fetchTrackers = new Array(this.cubes.length * 2) // we do one .vr and one .xyz for each cube.
//         this.promises = new Array(this.cubes.length * 2) // we do one .vr and one .xyz for each cube.
//         this.dnsResponses = new Array(this.cubes.length * 2) // we do one .vr and one .xyz for each cube.

//         this.controller = new AbortController();
//         this.signal = this.controller.signal;

//         this.theDamnAnswers = new Array(this.cubes.length) // we do one .vr and one .xyz for each cube.
//     }

//     // let's stick them all into little objects.
//     // save them up

//     // The goal is to NEVER return an error unless we have tried, relentlessly, for at least 30 seconds.
//     // I hate it but I've seen horrors. People return a 2 when really mean to say 0 or 3
//     async TwoWayLookupAndMerge(): Promise<[oct.TreeStatus[], Error | null]> {

//         // console.log("TwoWayLookupAndMerge: Starting with cubes: ", this.cubes.map(c => oct.CubeToString(c)[0]).join(","))

//         // let's try them one at a time, the slowest possible way. We can do them in parallel later.  
//         // every other one is an .xyz. We don't need the trackers.
//         // We DO care about the order. Later we process them in pairs to form the result TreeStatus.
//         for (let i = 0; i < this.cubes.length * 2; i++) {

//             const cube = this.cubes[Math.floor(i / 2)]
//             const [name, err] = oct.CubeToString(cube)
//             if (err) {
//                 console.error("TwoWayLookupAndMerge: Error converting cube to string: ", err)
//                 return [[], err]
//             }
//             let fetchTracker1: fetchTracker = {
//                 name: name,
//                 cube: cube,
//                 index: i,
//                 isXYZ: false, // (i && 1 !== 0 ) lol.
//                 hadProblem: false
//             }
//             if ((i & 1) !== 0) {
//                 fetchTracker1.isXYZ = true
//             }
//             this.fetchTrackers[i] = fetchTracker1 // why?
//             const aPromise = this.FetchOneDnsResponse(name, fetchTracker1.isXYZ === false) // is knotfree 
//             const result = await this.fetchThisBadBoy(aPromise, fetchTracker1)
//             // console.log("TwoWayLookupAndMerge: fetchThisBadBoy result: ", result)
//             // what we want is a atwdns.DnsResponse
//             const resp: atwdns.DnsResponse = result // {} as atwdns.DnsResponse
//             // ok? 
//             this.dnsResponses[i] = resp
//         }

//         // console.log("TwoWayLookupAndMerge: Finished fetching all cubes. Now handling the results.", this.dnsResponses)
//         // all the async stuff is done. Isn't it? 

//         // handlePairOfResponses
//         for (let i = 0; i < this.cubes.length; i++) {
//             const cube = this.cubes[i]
//             const dnsResponseVr = this.dnsResponses[i * 2]
//             const dnsResponseXyz = this.dnsResponses[i * 2 + 1]
//             this.theDamnAnswers[i] = this.handlePairOfResponses(dnsResponseVr, dnsResponseXyz, cube)
//         }

//         return [this.theDamnAnswers, null]
//     }

//     // the odd ones:
//     //             const fetchTracker2: fetchTracker = {
//     //                 cube: cube,
//     //                 index: i,
//     //                 isXYZ: true,
//     //                 hadProblem: false
//     //             }
//     //             this.fetchTrackers[i * 2 + 1] = fetchTracker2
//     //             this.promises[i * 2 + 1] = this.FetchOneDnsResponse(name, false) // is xyz


//     // recurse up to N times.

//     reallyBAdREsult: atwdns.DnsResponse = {
//         Status: atwdns.DnsStatusCode.SERVFAIL,
//         TC: false,
//         RD: false,
//         RA: false,
//         AD: false,
//         CD: false,
//         Answer: [],
//         Authority: [],
//         Question: []
//     }


//     async fetchThisBadBoy(p: Promise<Response>, fetchTracker: fetchTracker, depth: number = 0): Promise<atwdns.DnsResponse> {

//         if (depth > 5) {
//             console.error("fetchThisBadBoy: Too many retries for cube: ", fetchTracker.name, " isXYZ: ", fetchTracker.isXYZ)
//             return this.reallyBAdREsult // give up.
//         }
//         let areWeOk = true
//         let status = 0
//         let statusText = ""
//         try {
//             // did it screw up? 
//             const q = await p
//             status = q.status
//             statusText = q.statusText
//             if (q.ok && q.status === 200) {
//                 const jsonPromise = q.json()
//                 const json = await jsonPromise
//                 const dnsResponse: atwdns.DnsResponse = json as atwdns.DnsResponse
//                 // ok? 
//                 if (dnsResponse === undefined || dnsResponse === null) {
//                     console.error("fetchThisBadBoy: dnsResponse is null or undefined for cube: ", fetchTracker.name, " isXYZ: ", fetchTracker.isXYZ)
//                     areWeOk = false // recurse
//                 } else {
//                     if (dnsResponse.Status !== atwdns.DnsStatusCode.NOERROR && dnsResponse.Status !== atwdns.DnsStatusCode.NXDOMAIN) {
//                         console.error("fetchThisBadBoy: dnsResponse has unexpected status for cube: ", fetchTracker.name, " isXYZ: ", fetchTracker.isXYZ, " status: ", dnsResponse.Status)
//                     } else {
//                         return json
//                     }
//                 }
//             } else {
//                 console.error("fetchThisBadBoy failed with status: ", q.status, q.statusText)
//                 const json = await q.json()
//                 console.log("fetchThisBadBoy fail result json: ", json)
//                 areWeOk = false
//             }
//         } catch (error) {
//             // do we HAVE to see this?
//             // console.error("fetchThisBadBoy: Exception caught for cube: ", fetchTracker.name, " isXYZ: ", fetchTracker.isXYZ, " error: ", error)
//             areWeOk = false
//         }

//         if (!areWeOk) {
//             // it's not failed YET
//             // fetchTracker.hadProblem = true
//             // recurse up to N times.
//             await new Promise(resolve => setTimeout(resolve, 1000)); // wait 1 whole second before retrying
//             // interesting but is ugly in long running tests.
//             // console.error("fetchThisBadBoy Recursing: ", fetchTracker.name, " isXYZ: ", fetchTracker.isXYZ, " status: ", status, " statusText: ", statusText)
//             const aPromise = this.FetchOneDnsResponse(fetchTracker.name, fetchTracker.isXYZ === false) // is knotfree 
//             return this.fetchThisBadBoy(aPromise, fetchTracker)
//         }
//         // what do we return here? we have to return a Response.
//         return this.reallyBAdREsult
//     }


//     // FetchOneDnsResponse set up the promise. Just one.  We work from the botom up.
//     // this used to work. See examples below.
//     async FetchOneDnsResponse(name: string, knotfreeNative: boolean): Promise<Response> {

//         const server = atwdns.knotfreeServer // localhost:8085 or knotfree.dog:8085 or knotfree.net (secure) or knotfree.io (http)

//         // eg  url = "https://knotfree.net/api1/dns-query?name=meta_group_id.testmain-0n0u0e16p-0.vr&type=TXT&knotfree=1"&dnsServer="1.1.1.1"
//         if (this.prefix) {
//             name = `${this.prefix}.${name}`
//         }
//         if (knotfreeNative) {
//             name = `${name}.vr`
//         } else {
//             name = `${name}.xyz`
//         }
//         let url = `${server}/api1/dns-query?name=${name}&type=${this.type}&dnsServer=${atwdns.currentDnsServer}`
//         if (knotfreeNative) {
//             url += `&knotfree=1`
//         }
//         // console.log("FetchOneDnsResponse url is", url)
//         const responsePromise = fetch(url, { signal: this.signal });
//         // should we just wait for the text now?
//         // no, catch problems here and then we can do the parsing in the caller and catch problems there too.
//         return responsePromise
//     }

//     // you're good too.
//     handlePairOfResponses(dnsResponseVr: atwdns.DnsResponse, dnsResponseXyz: atwdns.DnsResponse, cube: oct.Cube): oct.TreeStatus {
//         // this is where we compare the .vr and .xyz responses and decide what the TreeStatus is. 
//         // This is a simplification for this example. In reality, you would need to parse the responses according to your specific format and logic.
//         // const cubeName = oct.CubeToString(cube)[0]
//         // if ( cubeName.includes("0n0u1w16p") ) {
//         //      // 0n0u1w16p debug me.
//         //     console.log("handlePairOfResponses: Found cube 0n0u1w16p. dnsResponseVr: ", dnsResponseVr, " dnsResponseXyz: ", dnsResponseXyz)
//         // }
//         if (!dnsResponseVr || !dnsResponseXyz) {
//             console.error("handlePairOfResponses: One of the DNS responses is null or undefined.")
//             // we should not be getting ANY undefined in here.
//             // FIXME: can't return this.
//             return {
//                 name: oct.CubeToString(cube)[0],
//                 found: false,
//                 cube: cube,
//                 level: cube.p,
//                 isParent: false,
//                 wasXYZ: false,
//                 childrenBits: -1,
//                 error: new Error("One of the DNS responses is null or undefined.")
//             }
//         }

//         let whichResponse = dnsResponseVr
//         const treeStatus: oct.TreeStatus = {
//             name: oct.CubeToString(cube)[0],
//             found: false,
//             cube: cube,
//             level: cube.p,
//             isParent: false,
//             wasXYZ: false,
//             childrenBits: -1,
//             error: null
//         }
//         if (dnsResponseXyz.Status === atwdns.DnsStatusCode.NOERROR && dnsResponseVr.Status === atwdns.DnsStatusCode.NOERROR) {
//             // got both. This is weird but let's go with the .vr for now. We can merge them later if needed.
//             whichResponse = dnsResponseXyz
//             treeStatus.wasXYZ = true
//             treeStatus.found = true
//         } else if (dnsResponseXyz.Status === atwdns.DnsStatusCode.NOERROR) {
//             treeStatus.found = true
//             treeStatus.wasXYZ = true
//             whichResponse = dnsResponseVr
//         } else if (dnsResponseVr.Status === atwdns.DnsStatusCode.NOERROR) {
//             treeStatus.found = true
//         } else {
//             treeStatus.found = false
//         }
//         if (treeStatus.found) {
//             const theanswer = atwdns.GetAnswer(whichResponse)
//             const theanswertext = theanswer[1]
//             // was it an A request? 
//             // there's a version of this at the end of BuildVisibleTree
//             // where the answer is parsed as a oct.GroupTextParameters
//             // should we do that HERE? it's a terrible hack 
//             // that will hurt someone someday but where to put the Answer?

//             if (this.type == "A") {
//                 // do we need the array of address that they supply?
//                 // I don't know that we EVER use it.
//                 treeStatus.addresses = [theanswertext]
//             } else { // the type MUST BE TXT. There's only two types now.
//                 // what if we want to do CNAMES someday?? Death and destruction.

//                 // groupId?: GroupTextParameters | boolean, 
//                 // the group that this tree belongs to, which is the same for all leaf nodes rendered by the same iFrame or server. 
//                 let somegrp: oct.GroupTextParameters = {
//                     grp: utils.randomString(24)
//                 }
//                 try {
//                     somegrp = JSON.parse(theanswertext) as oct.GroupTextParameters
//                 } catch {
//                     somegrp = { grp: utils.randomString(24) }
//                     somegrp.ex = { "actually-got": theanswertext }
//                 }
//                 if (somegrp) {
//                     if (somegrp.grp === undefined || somegrp.grp === "") {
//                         somegrp.grp = utils.randomString(24)
//                     }
//                 } else {
//                     // didn't parse.
//                     somegrp = { grp: utils.randomString(24) }
//                 }
//                 treeStatus.groupId = somegrp
//             }
//         }
//         return treeStatus
//     }
// }

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

// if (false) { // just testing the fetch.

//     const p = frame.FetchOneDnsResponse("testmain-0n0u0e5p", true) // works
//     // const p = frame.FetchOneDnsResponse("testmain-0n0u0e5p", "A", true) // works
//     console.log("FetchOneDnsResponse result promise: ", p)
//     const q = await p
//     console.log("FetchOneDnsResponse result: ", q)
//     if (q.ok && q.status === 200) {
//         console.log("FetchOneDnsResponse status text: ", q.statusText)
//         const jsonPromise = q.json()
//         console.log("FetchOneDnsResponse result json promise: ", jsonPromise)
//         const json = await jsonPromise
//         console.log("FetchOneDnsResponse result json: ", json)
//     } else {
//         console.error("FetchOneDnsResponse failed with status: ", q.status, q.statusText)
//         const json = await q.json()
//         console.log("FetchOneDnsResponse fail result json: ", json)
//     }
//     console.log("FetchOneDnsResponse result: ", q)
//     console.log("FetchOneDnsResponse result: ", q)
//     console.log("FetchOneDnsResponse result: ", q)
//     console.log("FetchOneDnsResponse result: ", q)

//     //     dig @149.28.250.163 meta_group_id.testmain-0n0u0e16p-0.vr TXT
//     //        meta_group_id-no-leading-underscore
// }

// class onceCubeLookupPromise {
//     name: string
//     promise: Promise<oct.TreeStatus>
//     index: number = 0
//     isXYZ: boolean = false
//     hadProblem = false
//     constructor(name: string, index: number, isXYZ: boolean, type: "A" | "TXT" = "A",) {
//         this.name = name
//         this.index = index
//         this.isXYZ = isXYZ
//         // set up the promise now. 
//         if (isXYZ) {
//         } else {
//         }
//         this.promise = new Promise(async (resolve, reject) => {
//             const typeStr = type === "A" ? "A" : "TXT"
//             const dnsType = isXYZ ? "xyz" : "vr"
//             const prefix = `meta_group_id`
//             const response = await FetchOneDnsResponse(name, typeStr, true, prefix)
//             if (!response.ok) {
//                 this.hadProblem = true
//                 reject(new Error(`Failed to fetch ${dnsType} record for ${name}: ${response.status} ${response.statusText}`))
//                 return
//             }
//             try {
//                 const json = await response.json()
//                 // we expect the json to have a field called "data" which is the value of the TXT record.
//                 if (!json.data) {
//                     this.hadProblem = true
//                     reject(new Error(`Invalid response format for ${dnsType} record for ${name}: missing data field`))
//                     return
//                 }
//                 const data = json.data
//                 // we expect the data to be a string that can be parsed as a TreeStatus. 
//                 // This is a simplification for this example. In reality, you would need to parse the data according to your specific format.
//                 const treeStatus: oct.TreeStatus = {
//                     name: name,
//                     found: true,
//                     cube: { x: 0, y: 0, z: 0, p: 1 } as oct.Cube, // this is just a placeholder. You would parse the actual cube from the data.
//                     level: 0,
//                     isParent: false,
//                     wasXYZ: isXYZ,
//                     childrenBits: 0,
//                     error: null
//                 }
//                 resolve(treeStatus)
//             } catch (err) {
//                 this.hadProblem = true
//                 reject(new Error(`Failed to parse response for ${dnsType} record for ${name}: ${err}`))
//             }
//         })
//     }
// }


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

// const dummyRespose: Response = {
//     ok: false,
//     status: 500,
//     statusText: "Dummy response",
//     headers: new Headers(),
//     url: "",
//     type: "basic",
//     redirected: false,
//     body: null,
//     bodyUsed: false,
//     clone() {
//         return this;
//     },
//     arrayBuffer() {
//         return Promise.resolve(new ArrayBuffer(0));
//     },
//     blob() {
//         return Promise.resolve(new Blob());
//     },
//     formData() {
//         return Promise.resolve(new FormData());
//     },
//     json() {
//         return Promise.resolve({});
//     },
//     text() {
//         return Promise.resolve("");
//     },
//     bytes: function (): Promise<Uint8Array<ArrayBuffer>> {
//         throw new Error('Function not implemented.');
//     }
// }

// like this 
// const aaa = new onceCubeLookupPromise("testmain-0n0u1w15p-0", 0, true);

// result = await octload.TwoWayLookupAndMerge(needToLookUp)
// function TwoWayLookupAndMerge(cubes: oct.Cube[]): Promise<oct.TreeStatus[] | Error> {


//     return [], null
// }







// type fetchTracker = {
//     cube: oct.Cube,
//     index: number,
//     isXYZ: boolean,
//     hadProblem: boolean
// }

// // BatchFetchAndMergeController is a wrapper for all the other fetches we'll be running.
// // The main thing is we want to re-run some of them, however that works. 
// // we're checking the cache before we get here.
// // We compare the .vr and .xyz results. And pick the best one. If either one is a 2, we have to do it again.
// // The results will be made into a TreeStatus.
// export class BatchFetchAndMergeController {

//     cubes: oct.Cube[]
//     fetchTrackers: fetchTracker[]    // we do one .vr and one .xyz for each cube.
//     promises: Promise<Response>[]   // we do one .vr and one .xyz for each cube.
//     type: "TXT" | "A"
//     prefix: string
//     // I heard this is how the cool kids do it. 
//     signal: AbortSignal
//     controller: AbortController

//     dnsResponses: atwdns.DnsResponse[]   // we do one .vr and one .xyz for each cube.
//     theDamnAnswers: oct.TreeStatus[]   // we do one .vr and one .xyz for each cube.


//     problemChildren = new Map<fetchTracker, number>() // this is the set of cube names that had problems. We want to retry these.

//     constructor(cubes: oct.Cube[], type: "TXT" | "A", prefix: string) {
//         this.cubes = cubes
//         this.type = type
//         this.prefix = prefix
//         this.fetchTrackers = new Array(this.cubes.length * 2) // we do one .vr and one .xyz for each cube.
//         this.promises = new Array(this.cubes.length * 2) // we do one .vr and one .xyz for each cube.
//         this.dnsResponses = new Array(this.cubes.length * 2) // we do one .vr and one .xyz for each cube.

//         this.controller = new AbortController();
//         this.signal = this.controller.signal;

//         this.theDamnAnswers = new Array(this.cubes.length) // we do one .vr and one .xyz for each cube.
//     }

//     // let's stick them all into little objects.
//     // save them up

//     // The goal is to NEVER return an error unless we have tried, relentlessly, for at least 30 seconds.
//     // I hate it but I've seen horrors. People return a 2 when really mean to say 0 or 3
//     async TwoWayLookupAndMerge(): Promise<[oct.TreeStatus[], Error | null]> {

//         const uberPromise = this.makeThePromisesAll() // this kicks off all the fetches in parallel and gives us a promise that resolves when they are all done. 

//         await uberPromise.then(results => {
//             // console.log("Uber promise level 0 results: ", results)
//             // handle level 0 results. We probably have 200's ?
//             return this.handleFetchResults(results)
//         }).catch(err => {
//             // is this handled now or will it puke on the caller too?
//             // it needs all new promises. We have to remake the fetches and the promises and then do it again.
//             if (err.cause && err.cause.code === "ECONNREFUSED") {

//                 this.controller.abort() // this will abort all the fetches that are still in flight. If the server is down they are ALL dead.

//                 const server = atwdns.knotfreeServer // localhost:8085 or knotfree.dog:8085 or knotfree.net (secure) or knotfree.io (http)
//                 console.log(`BatchFetchAndMergeController Connection refused to ${server}: pass`, 0)
//                 return this.tryAgain(0)
//             }
//             console.log("TwoWayLookupAndMerge giving up due to unhandled error: ", err)
//             return [[], err]
//         }).finally(() => {
//             // no, why? console.log("Error in uberPromise: ", "finally block reached. We can do something here if needed.")
//         })

//         // console.log("TwoWayLookupAndMerge Uber promise result: end initial call. ")

//         return [this.theDamnAnswers, null]
//     }

//     async tryAgain(level: number): Promise<[oct.TreeStatus[], Error | null]> {

//         if (level > 6) { // 30 seconds baby.
//             console.error("tryAgain Too many retries. Giving up.")
//             return [[], new Error("Too many retries. Giving up.")]
//         }

//         await new Promise(resolve => setTimeout(resolve, 5000)) // wait for 5 seconds before trying again.

//         const newUberPromises = this.makeThePromisesAll()
//         await newUberPromises.then((results) => {

//             console.log(`tryAgain succeeded. level ${level} treeStatuses: `, results)
//             return this.handleFetchResults(results)

//         }).catch(err => {
//             if (err.cause && err.cause.code === "ECONNREFUSED") {

//                 this.controller.abort() // this will abort all the fetches that are still in flight. If the server is down they are ALL dead.

//                 const server = atwdns.knotfreeServer // localhost:8085 or knotfree.dog:8085 or knotfree.net (secure) or knotfree.io (http)
//                 console.log(`tryAgain Connection refused to ${server}: pass`, level)

//                 return this.tryAgain(level + 1)
//             }
//             console.log("tryAgain giving up due to unhandled error: ", err)
//             return [[], err]
//         })
//         return [[], null]
//     }

//     makeThePromisesAll(): Promise<Response[]> {
//         for (let i = 0; i < this.cubes.length; i++) {
//             const cube = this.cubes[i]
//             const name = oct.CubeToString(cube)[0]
//             const fetchTracker1: fetchTracker = {
//                 cube: cube,
//                 index: i,
//                 isXYZ: false,
//                 hadProblem: false
//             }
//             this.promises[i * 2] = this.FetchOneDnsResponse(name, true) // is knotfree 
//             this.fetchTrackers[i * 2] = fetchTracker1

//             const fetchTracker2: fetchTracker = {
//                 cube: cube,
//                 index: i,
//                 isXYZ: true,
//                 hadProblem: false
//             }
//             this.fetchTrackers[i * 2 + 1] = fetchTracker2
//             this.promises[i * 2 + 1] = this.FetchOneDnsResponse(name, false) // is xyz
//         }
//         // we can kick these off in parallel.
//         // we need to track them so we can retry if needed. 
//         // maybe we put them in an array and then check them all after a certain time? 
//         // or we could use Promise.allSettled and then check the results. That might be cleaner. 

//         const uberPromise = Promise.all(this.promises)
//         return uberPromise
//     }

//     // FetchOneDnsResponse set up the promise. Just one.  We work from the botom up.
//     async FetchOneDnsResponse(name: string, knotfreeNative: boolean):
//         Promise<Response> {

//         const server = atwdns.knotfreeServer // localhost:8085 or knotfree.dog:8085 or knotfree.net (secure) or knotfree.io (http)

//         // eg  url = "https://knotfree.net/api1/dns-query?name=meta_group_id.testmain-0n0u0e16p-0.vr&type=TXT&knotfree=1"&dnsServer="1.1.1.1"
//         if (this.prefix) {
//             name = `${this.prefix}.${name}`
//         }
//         if (knotfreeNative) {
//             name = `${name}.vr`
//         } else {
//             name = `${name}.xyz`
//         }
//         let url = `${server}/api1/dns-query?name=${name}&type=${this.type}&dnsServer=${atwdns.currentDnsServer}`
//         if (knotfreeNative) {
//             url += `&knotfree=1`
//         }
//         // console.log("FetchOneDnsResponse url is", url)
//         const responsePromise = fetch(url, { signal: this.signal });
//         // should we just wait for the text now?
//         // no, catch problems here and then we can do the parsing in the caller and catch problems there too.
//         return responsePromise
//     }

//     async handleFetchResults(results: Response[]): Promise<[oct.TreeStatus[], Error | null]> { // these are fetch Responses. We need to check the status codes and then parse the json.
//         console.log("handleFetchResults: results length: ", results.length)
//         if (results.length !== this.promises.length) {
//             console.error("handleFetchResults: results length does not match fetchTrackers length. Something is wrong.")
//             return Promise.resolve([[], new Error("handleFetchResults: results length does not match fetchTrackers length. Epic fail.")])
//         }
//         // we should make promises for getting the text and run those all at once too. 

//         // we gotto check them all and see if any of them had problems. If they did, we have to try again.
//         for (let i = 0; i < results.length; i++) {
//             const response = results[i]
//             // console.log(`handleFetchResults: Fetch result ${i}: `, response)
//             const fetchTracker = this.fetchTrackers[i]
//             if (!response.ok) {
//                 console.error(`handleFetchResults: Fetch failed for cube ${oct.CubeToString(fetchTracker.cube)[0]} (${fetchTracker.isXYZ ? "xyz" : "vr"}): ${response.status} ${response.statusText}`)
//                 fetchTracker.hadProblem = true
//                 this.problemChildren.set(fetchTracker, i)
//                 continue // just bail? I'm getting tired of beiing perfect. We can try again later.
//             }
//             // we have a 200 
//             try {
//                 const text = await response.text()
//                 // it's fetch Responses.
//                 const dnsResponse: atwdns.DnsResponse = JSON.parse(text) as atwdns.DnsResponse
//                 // console.log(`handleFetchResults have dns Response ${JSON.stringify(dnsResponse)}`)
//                 // console.log(`handleFetchResults have dns Response dnsResponse `, dnsResponse)
//                 if (dnsResponse.Status !== atwdns.DnsStatusCode.NOERROR && dnsResponse.Status !== atwdns.DnsStatusCode.NXDOMAIN) {
//                     // god, you're annoyibng, console.error(`handleFetchResults: DNS response status not success for cube ${oct.CubeToString(fetchTracker.cube)[0]} (${fetchTracker.isXYZ ? "xyz" : "vr"}): ${dnsResponse.Status} ${dnsResponse.Comment}`)
//                     fetchTracker.hadProblem = true
//                     this.problemChildren.set(fetchTracker, i)
//                     continue
//                 }
//                 this.dnsResponses[i] = dnsResponse

//             } catch (err) {
//                 console.error(`handleFetchResults: Error parsing response for cube ${oct.CubeToString(fetchTracker.cube)[0]} (${fetchTracker.isXYZ ? "xyz" : "vr"}): ${err}`)
//                 fetchTracker.hadProblem = true
//                 this.problemChildren.set(fetchTracker, i)
//                 continue
//             }
//         }

//         const doWeHaveThemAll1 = this.problemChildren.size === 0
//         let doWeHaveThemAll2 = true
//         // let's make the dnsResponses
//         this.dnsResponses.forEach(resp => { if (!resp) { doWeHaveThemAll2 = false } })
//         if (!doWeHaveThemAll1 || !doWeHaveThemAll2) {
//             console.error(`handleFetchResults: We have problems with ${this.problemChildren.size} fetches. We have to try again. `, this.problemChildren)
//             return [[], new Error(`handleFetchResults: We have problems with ${this.problemChildren.size} fetches. We have to try again.`)]
//         }
//         // make the actual responses we need. Man, I'm tired of this. it's been 4 hours.
//         for (let i = 0; i < this.dnsResponses.length; i += 2) {
//             const dnsResponseVr = this.dnsResponses[i]
//             const dnsResponseXyz = this.dnsResponses[i + 1]
//             // don't I already have logic for this? 
//             const cubeIndex = Math.floor(i / 2)
//             const cube = this.cubes[cubeIndex]
//             this.theDamnAnswers[cubeIndex] = this.handlePairOfResponses(dnsResponseVr, dnsResponseXyz, cube)
//         }
//         return [this.theDamnAnswers, null]
//     }

//     handlePairOfResponses(dnsResponseVr: atwdns.DnsResponse, dnsResponseXyz: atwdns.DnsResponse, cube: oct.Cube): oct.TreeStatus {
//         // this is where we compare the .vr and .xyz responses and decide what the TreeStatus is. 
//         // This is a simplification for this example. In reality, you would need to parse the responses according to your specific format and logic.
//         let whichResponse = dnsResponseVr
//         const treeStatus: oct.TreeStatus = {
//             name: oct.CubeToString(cube)[0],
//             found: false,
//             cube: cube,
//             level: cube.p,
//             isParent: false,
//             wasXYZ: false,
//             childrenBits: 0,
//             error: null
//         }
//         if (dnsResponseXyz.Status === atwdns.DnsStatusCode.NOERROR && dnsResponseVr.Status === atwdns.DnsStatusCode.NOERROR) {
//             // got both. This is weird but let's go with the .vr for now. We can merge them later if needed.
//             whichResponse = dnsResponseXyz
//             treeStatus.wasXYZ = true
//             treeStatus.found = true
//         } else if (dnsResponseXyz.Status === atwdns.DnsStatusCode.NOERROR) {
//             treeStatus.found = true
//             treeStatus.wasXYZ = true
//             whichResponse = dnsResponseVr
//         } else if (dnsResponseVr.Status === atwdns.DnsStatusCode.NOERROR) {
//             treeStatus.found = true
//         } else {
//             treeStatus.found = false
//         }
//         if (treeStatus.found) {
//             const theanswer = atwdns.GetAnswer(whichResponse)
//             const theanswertext = theanswer[1]
//             // was it an A request? 
//             // there's a version of this at the end of BuildVisibleTree
//             // where the answer is parsed as a oct.GroupTextParameters
//             // should we do that HERE? it's a terrible hack 
//             // that will hurt someone someday but where to put the Answer?

//             if (this.type == "A") {
//                 // do we need the array of address that they supply?
//                 // I don't know that we EVER use it.
//                 treeStatus.addresses = [theanswertext]
//             } else { // the type MUST BE TXT. There's only two types now.
//                 // what if we want to do CNAMES someday?? Death and destruction.

//                 // groupId?: GroupTextParameters | boolean, 
//                 // the group that this tree belongs to, which is the same for all leaf nodes rendered by the same iFrame or server. 
//                 let somegrp: oct.GroupTextParameters = {
//                     grp: utils.randomString(24)
//                 }
//                 try {
//                     somegrp = JSON.parse(theanswertext) as oct.GroupTextParameters
//                 } catch {
//                     somegrp = { grp: utils.randomString(24) }
//                     somegrp.ex = { "actually-got": theanswertext }
//                 }
//                 if (somegrp) {
//                     if (somegrp.grp === undefined || somegrp.grp === "") {
//                         somegrp.grp = utils.randomString(24)
//                     }
//                 } else {
//                     // didn't parse.
//                     somegrp = { grp: utils.randomString(24) }
//                 }
//                 treeStatus.groupId = somegrp
//             }
//         }
//         return treeStatus
//     }
// }

