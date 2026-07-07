

// import * as dns from "dns/promises" NOPE. We can't use this.

import * as oct from '../knotfree-ts-lib/3d/UrlOctTree'
import * as octload from '../knotfree-ts-lib/3d/OctTreeLoaders'
import * as atwdns from '../knotfree-ts-lib/3d/DnsTypes'
import * as namesapi from '../knotfree-ts-lib/3d/NamesApi'

import assert from 'node:assert/strict';

// test some atwdns stuff 

// command to execute. in a javascript debug terminal: npx ts-node src/scripts/testingTrees.ts


async function doTheScript() {

    { // this is actully a test. :-)
        // what's supposed to happen here is that  testmain-0n0u0e16p-0.vr exists in knotfree
        // it would be fun if 12 was in cloudflare but that would cost $12. testmain-0n0u0e12p-0.xyz is registered at cloudflair now. 
        const rawChain: oct.Cube[] = [
            { world: "testmain", x: 0, y: 0, z: 0, p: 16, whichParent: 0 }, // is in vr but not xyz
            { world: "testmain", x: 0, y: 0, z: 0, p: 12, whichParent: 0 }, // is in xyz but not vr in cloudflare. I registered it there to test.
            { world: "testmain", x: 0, y: 0, z: 0, p: 6, whichParent: 0 },  // is in neither
        ]
        console.log("12th level cube name:", oct.CubeToString(rawChain[1]))

        const [twlm, err] = await octload.TwoWayLookupAndMerge(rawChain)

        console.log(`got TwoWayLookupAndMerge: ${twlm}, ${err}`)

        if (err) {
            console.error(`Error in TwoWayLookupAndMerge: ${err}`)
        } else {
            assert.equal(twlm.length, rawChain.length, `Expected tree status length to match raw chain length. Expected ${rawChain.length} but got ${twlm.length}`)

            assert.equal(twlm[0].found, true, `Expected first cube to be found in knotfree. ${twlm[0].found}`)
            assert.equal(twlm[0].wasXYZ, false, `Expected first cube to be found in knotfree. ${twlm[0].wasXYZ}`)

            assert.equal(twlm[1].found, true, `Expected second cube to BE found in xyz. ${twlm[1].found}`)
            assert.equal(twlm[1].wasXYZ, true, `Expected second cube to BE found in xyz. ${twlm[1].wasXYZ}`)

            // this got registered when I reserved 0n0u0e5p-0.vr
            assert.equal(twlm[2].found, true, `Expected third cube to be found.  ${twlm[2].found}`)
            assert.equal(twlm[2].wasXYZ, false, `Expected vr . ${twlm[2].wasXYZ}`)

            for (const ts of twlm) {
                console.log(`Tree status for ${ts.name}: found=${ts.found}, isParent=${ts.isParent}, wasXYZ=${ts.wasXYZ}`)
            }
        }
    }

    { // this is just me trying things. This could be a test. 
        const knt = await atwdns.FetchDnsResponse("alan-t-wootton.vr", "A", "xxx", true)
        //console.log("knotfree FetchDnsResponse result", knt)

        const dd = await atwdns.FetchDnsResponse("adobe.com,google.com", "A", "8.8.8.8", false)
        // console.log("google FetchDnsResponse result", dd)
    }
    { // this part is actually a test.
        // I added an unnecessary TXT to the 16 level 0th quadrant.
        let theName = "meta_group_id.testmain-0n0u0e16p-0.vr"
        const kftest = await atwdns.FetchDnsResponse(theName, "TXT", "xxx", true)

        const dd0 = kftest instanceof Error ? kftest : kftest[0]
        if (dd0 instanceof Error) {
            console.error("Error fetching DNS response:", dd0)
        } else {
            const answerData = dd0.Answer ? dd0.Answer[0].data : "No answer"
            console.log("google FetchDnsResponse adobe address:", answerData)
            assert.equal(answerData, "meta_group_id-no-leading-underscore")
        }
    }

    finished = true
}


let finished = false
setTimer()

doTheScript()

function setTimer() {
    setTimeout(() => {
        if (!finished) {
            setTimer()
        } else {
            console.log("Finished the script")
        }
    }, 100)
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
