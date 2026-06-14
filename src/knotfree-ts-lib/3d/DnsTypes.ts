

// export const dnsGotohere = "dns.gotohere.com" // "149.28.250.163" not used.
export const dnsCloudflare = "1.1.1.1" // we could also use google.
export const dnsGoogle = "8.8.8.8" // we could also use cloudflare.

export const dnsCloudFlair2 = "1.0.0.1" 

export const dnsGoogle2 = "8.8.4.4" // we could also use cloudflare.

export const dnsQuad9 = "9.9.9.9" // quad9.
export const dnsQuad92 = "9.9.9.10" // Quad9: Founded on strict privacy principles and governed by Swiss law

export const dnsOpenDNS = "208.67.222.222" // OpenDNS (Best for parental controls)Owned by Cisco 
export const dnsOpenDNS2 = "208.67.220.220" // OpenDNS (Best for parental controls)Owned by Cisco 

export const dnsGotohere = "149.28.250.163" // dns.gotohere.com Don't use this. It's weak. Real weak, but it serves .vr records for The Metaverse proto.

// we should round robin them. That would be funny. 
export const currentDnsServer = dnsGoogle // change this to test different dns servers.

// The reason we have to call knotfree is because browser security rules won't let us use the normal dns resolvers
// and because the DNS over HTTPS (DoH) services at google and cloudflare won't take cross domain requests from the browser. 
// So we have to call knotfree.net to do the dns lookup for us. This is a bummer, but it is what it is. Someday we might fix this. 

export const knotFreeDotNet = "https://knotfree.net"
export const knotFreeLocalHost = "http://knotfree.com:8085" // knotfree.com is in my /etc/hosts file.

export const knotfreeServer = knotFreeLocalHost // change this to test against local or remote knotfree server.

export type DnsAnswer = {
	name: string;
	type: number; // 1 for A, 16 for TXT, etc.
	TTL?: number;
	data?: string;
}

export type DnsQuestion = {
	name: string;
	type: number;
}

export enum DnsStatusCode {
	NOERROR = 0,    // The query was successful, and the response contains the requested IP address or records.
	FORMERR = 1,    // The DoH resolver could not interpret the format of the DNS query.
	SERVFAIL = 2,   // The DNS server failed to answer the request (often a timeout or issue with the upstream server).
	NXDOMAIN = 3,   // Non-Existent Domain. The domain name you queried does not exist.
	NOTIMP = 4,     // Not Implemented. The DoH server does not support the requested DNS operation.
	REFUSED = 5,    // The DNS server refused to process the request (e.g., due to policy)
}

export type DnsResponse = {
	Status: number; // 0 for no error, 3 for name error, etc.
	TC: boolean;
	RD: boolean;
	RA: boolean;
	AD: boolean;
	CD: boolean;
	Question: DnsQuestion[];
	Answer?: DnsAnswer[];
	Authority?: DnsAnswer[]; // when do I do this?
	Comment?: string;
}

//   url = "https://knotfree.net/api1/dns-query?name=meta_group_id.testmain-0n0u0e16p-0.vr&type=TXT&knotfree=1"

// FetchDnsResponse takes a comma-separated list of dns names and returns a DnsResponse or an Error. or an array of DnsResponses if the comma-separated list contains multiple names.
// It requires type to be TXT or A.
// It also requires a dnsServer, like "1.1.1.1" (cloudflare) or "8.8.8.8" (google).
// UNLESS knotfreeNative is true, then it will use the knotfree native dns resolver 'lookup' inside of knotfree.net
// We do this to test metaverse world building without having to spend boucoup $$$ buying domains
export async function FetchDnsResponse(commaList: string, type: "TXT" | "A", dnsServer: string, knotfreeNative: boolean):
	Promise<DnsResponse[] | Error> {

	let server = "https://knotfree.net"
	// try this on localhost and see if it crashes. There's been buffer problems with the big batches. 
	// buffers are phat at knotfree now.
	// server = "http://knotfree.com:8085"
	server = knotfreeServer

	let url = `${server}/api1/dns-query?name=${commaList}&type=${type}&`
	if (knotfreeNative) {
		url += `knotfree=1`
	}
	else {
		url += `dnsServer=${dnsServer}`
	}
	try {
		const response = await fetch(url);
		if (!response.ok) {
			return new Error(`HTTP error! status: ${response.status}`);
		}

		const theText = await response.text()
		// console.log('Raw DNS response text:', theText);

		const parsed = JSON.parse(theText);
		let data: DnsResponse[] = []
		if (commaList.includes(",")) {
			data = parsed as DnsResponse[];
			return data;
		} else {
			data = [parsed as DnsResponse];
			return data;
		}
	} catch (error) {
		return error instanceof Error ? error : new Error(String(error));
	}
}

// FetchDnsResponseTryHard takes a comma-separated list of dns names and returns a DnsResponse or an Error. or an array of DnsResponses if the comma-separated list contains multiple names.
// It requires type to be TXT or A.
// Note that knotfree serves .vr names but .xyz names are what we're using in the end. Presumably.
// It also requires a dnsServer, like "1.1.1.1" (cloudflare) or "8.8.8.8" (google).
// UNLESS knotfreeNative is true, then it will use the knotfree native dns resolver inside of knotfree.net
// we do this to test metaverse world building without having to spend boucoup $$$ buying domains
export async function FetchDnsResponseTryHard(commaList: string, type: "TXT" | "A", dnsServer: string, knotfreeNative: boolean, howMany?: number):
	Promise<DnsResponse[] | Error> {

	// for 30 second, keep trying to fetch the dns response until we get a response that is not an error, or until we get a reasonable response. 
	// This is to test the stability of the knotfree dns resolver under load.

	if (!howMany) {
		howMany = commaList.split(",").length
	}

	const startTime = Date.now()
	let lastError: Error | null = null
	let attempt = 0
	while (Date.now() - startTime < 30000) {
		try {
			let hadUnexpectedStatus = false

			const response = await FetchDnsResponse(commaList, type, dnsServer, knotfreeNative)
			if (response instanceof Error) {
				lastError = response
				console.error(`Error fetching DNS response: ${response}. Retrying...`)
				hadUnexpectedStatus = true
			} else if (response.length !== howMany) {
				lastError = new Error(`Expected ${howMany} DNS responses, but got ${response.length}. Retrying...`)
				console.error(lastError.message)
				hadUnexpectedStatus = true
			} else {
				// they have to be either 0 or 3. 
				// SERVFAIL is NOT an answer.
				// when we get a 3 we need to be 100% the name actually doesn't exist.
				for (const r of response) {
					if (r.Status !== 0 && r.Status !== 3) {
						lastError = new Error(`Unexpected DNS response status: ${r.Status}. Retrying... Attempt ${attempt + 1}`)
						hadUnexpectedStatus = true
					}
				}
				if (!hadUnexpectedStatus) {
					// they look legit. This is the normal/common case.
					// the other things are server and internet issues.
					return response
				}
				// else keep trying.
				attempt++
			}
		} catch (err) {
			lastError = err as Error
			console.error(`Exception fetching DNS response: ${lastError}. Retrying...`)
		}
		// we're here because we got an error or an unexpected status. Wait a bit and try again.
		console.log("FetchDnsResponseTryHard Waiting 5 seconds before retrying because ...", lastError?.message)
		console.log("FetchDnsResponseTryHard seeks ",commaList)
		// wait 5 seconds before retrying. This has been killing the server. What a wimp. We should be able to handle more load than this. 
		await new Promise(resolve => setTimeout(resolve, 5000))
	}
	return lastError || new Error("Unknown error fetching DNS response")
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
