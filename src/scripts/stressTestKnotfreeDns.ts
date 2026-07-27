// import * as dns from "dns/promises" NOPE. Never. We can't use this.

import * as oct from '../knotfree-ts-lib/3d/DomainNameOctTree'
import * as dnstypes from '../knotfree-ts-lib/3d/DnsTypes'

// This is actually testing api1/dns-query and not the api1/nameService. probably because dns-query is public, no keys required.
// ultimitaly it does call: 	command := "get option " + typeStr + " " + subkey // eg get option A

// command to execute: 
// npx ts-node src/scripts/stressTestKnotfreeDns.ts


async function doTheScript() {

    // dnstypes.SetKnotfreeServer("https://knotfree.net") // test against prod.
    // dnstypes.SetKnotfreeServer("http://knotfree.io") // test against prod.

    let theName = "meta_group_id.testmain-0n0u0e16p-0.vr"
    let count = 0
    let success = 0
    for (let i = 0; i < 9999999; i++) {
        // console.log(`FetchDnsResponseTryHard attempt ${i + 1}`)
        const startTime = Date.now()
        const response = await dnstypes.FetchDnsResponseTryHard(theName, "TXT", "xxx", true)
        const endTime = Date.now()
        const duration = endTime - startTime
        // console.log(`FetchDnsResponseTryHard result for attempt ${i + 1}:`, response)

        const dd0 = response instanceof Error ? response : response[0]
        let got = "wrong answer"
        if (dd0 instanceof Error) {
            console.error("Error fetching DNS response:", dd0)
        } else {
            // console.log("google FetchDnsResponse adobe address:", dd0.Answer ? dd0.Answer[0].data : "No answer")
            got = dd0.Answer ? dd0.Answer[0].data || "No data" : "No answer"
        }
        if (got !== "meta_group_id-no-leading-underscore") {
            console.error(`Unexpected DNS response data: ${got}. Retrying...`)
        } else {
            console.log(`Received text: ${got} at ${new Date().toLocaleTimeString()}. duration: ${duration}ms`)
            success++
        }
        count++
        if (count % 100 == 0) {
            const percent = (success / count) * 100
            console.log(`--- ${count} iterations, ${success} good, ${count - success} fails (${percent.toFixed(2)}%) ---`)
        }

        // await new Promise(resolve => setTimeout(resolve, 30 * 1000)) // wait 30 seconds between attempts  
        await new Promise(resolve => setTimeout(resolve, 10 * 1000)) // faster !!!   
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
