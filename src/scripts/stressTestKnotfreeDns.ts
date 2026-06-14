

// import * as dns from "dns/promises" NOPE. We can't use this.

import * as oct from '../knotfree-ts-lib/3d/UrlOctTree'

import * as atwdns from '../knotfree-ts-lib/3d/DnsTypes'

// command to execute: npx ts-node src/scripts/stressTestKnotfreeDns.ts

// FetchDnsResponse takes a comma-separated list of dns names and returns a DnsResponse or an Error. or an array of DnsResponses if the comma-separated list contains multiple names.
// It requires type to be TXT or A.
// It also requires a dnsServer, like "1.1.1.1" (cloudflare) or "8.8.8.8" (google).
// UNLESS knotfreeNative is true, then it will use the knotfree native dns resolver inside of knotfree.net
// we do this to test world building without having to spend boucoup $$$ buying domain
export async function xFetchDnsResponseTryHard(commaList: string, type: "TXT" | "A", dnsServer: string, knotfreeNative: boolean):
    Promise<atwdns.DnsResponse[] | Error> {

    // for 30 second, keep trying to fetch the dns response until we get a response that is not an error, or until we get a reasonable response. 
    // This is to test the stability of the knotfree dns resolver under load.

    const startTime = Date.now()
    let lastError: Error | null = null
    while (Date.now() - startTime < 30000) {
        try {
            let hadUnexpectedStatus = false

            const response = await atwdns.FetchDnsResponse(commaList, type, dnsServer, knotfreeNative)
            if (response instanceof Error) {
                lastError = response
                console.error(`Error fetching DNS response: ${response}. Retrying...`)
                hadUnexpectedStatus = true
            } else {
                // they have to be either 0 or 3. 
                // SERVFAIL is NOT an answer.
                // when we get a 3 we need to be 100% the name actually doesn't exist.
                for (const r of response) {
                    if (r.Status !== 0 && r.Status !== 3) {
                        lastError = new Error(`Unexpected DNS response status: ${r.Status}. Retrying...`)
                        hadUnexpectedStatus = true
                    }
                }
                if (!hadUnexpectedStatus) {
                    // they look legit. This is the normal/common case.
                    // the other things are server and internet issues.
                    return response
                }
                // else keep trying.
            }
        } catch (err) {
            lastError = err as Error
            console.error(`Exception fetching DNS response: ${lastError}. Retrying...`)
        }
    }
    return lastError || new Error("Unknown error fetching DNS response")
}


async function doTheScript() {

    let theName = "meta_group_id.testmain-0n0u0e16p-0.vr"
    let count = 0
    let success = 0
    for (let i = 0; i < 9999999; i++) {
        // console.log(`FetchDnsResponseTryHard attempt ${i + 1}`)
        const startTime = Date.now()
        const response = await atwdns.FetchDnsResponseTryHard(theName, "TXT", "xxx", true)
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

