import * as dnstypes from '../knotfree-ts-lib/3d/DnsTypes';
import * as oct from '../knotfree-ts-lib/3d/Dns8Tree';

// we're doing all over again from scratch. 

// There are no more texture urls. It's only vr urls.
// also, they can't all run on localhost:3010 They can run on different ports, but not step on each other.

// When we are local and running against the local copy of WorldsTest1 we want to rewrite the urls to point to the local server instead of the remote server.
// This way there's debugging available for the iFrame even from inside this app. Very cool.
// There will be a hint to do this in the group text parameters, so we can check for that and rewrite the urls accordingly.
// eg {"grp":"j9xK3mP8wL2z","dbg":"localhost:3010","type":"floor","asset":"cobblestonesgrok512.jpg:repeat:20"}
// url will be like: "http://testmain-0n0u0e5p.vr/cobblestonesgrok512.jpg"
// for local testing we make it "http://localhost:3010/cobblestonesgrok512.jpg" instead.

// for a iFrame we need something like "http://localhost:3010/testmain-0n0u0e5p.vr" which is weird but it's how the local copy of WorldsTest1 knows which world it's serving.
// and I AM using the same code to serve several spaces.

// atw: actually: "http://localhost:3010/domain=testmain-0n0u0e5p.vr" but we don't do that either.

// if it's a .vr url and we're not local and the IP address is to knotfree.net (secure) or knotfree.io (insecure) 
// unless we're somehow using the dns.gotohere.com resolver (and we're not) then we have to make it a subdomain request.
// eg. "http://testmain-0n0u0e5p_vr.knotfree.io/cobblestonesgrok512.jpg" or 
// eg. "https://testmain-0n0u0e5p_vr.knotfree.net/cobblestonesgrok512.jpg"
// and they will try to proxy to some static server or something. 

// Since knotfree is an IOT server, it's a pub/sub server and so it will try to publish the request to the topic "testmain-0n0u0e5p_vr" 
// and then some server that is subscribed to that topic will get the message and serve the asset.
// There is a mac app that will subscribe to topics and forward them to localhost. It's knotfree-local-hoster.app
// (It's beter to check out the knotfree-local-hoster project and run it locally. getting knotfree-local-hoster.app signed by apple is currently broken
// and for the love of god would some please build the windows version of https://github.com/awootton/knotfree-local-hoster - an 'electron' app)
// so if we're running that app and we have it set up to forward the "testmain-0n0u0e5p_vr" topic to localhost:3010, then it will work.
// this is all very hacky and we should have a better way to do this, but it works for now. I NOT want to be in the knotfree.net business like this.

// try: https://testmain-0n0u0e5p_vr.knotfree.net/dummyFile.txt with the knotfree-local-hoster.app running and forwarding the testmain-0n0u0e5p.vr topic to localhost:3010
// or http://testmain-0n0u0e5p_vr.knotfree.io/dummyFile.txt 
// topic to localhost:3010, and see if it works.


// RewriteUrl will provide the complicated case where the url must become a subdomain request to knotfree.net or knotfree.io, 
// and also the problem of master names for textures?
// add a setting to force non-local urls to be rewritten to the subdomain form, so we can test the subdomain form.

import { ServerItem, OurServerList } from '../knotfree-ts-lib/avatars/testServermap';


// eg 

export function aux2LocalUrlForIframes(aux: oct.AuxLeafStatus): string {

    // console.log("aux2LocalUrlForIframes, url rewritten FROM ", aux.wholeMaster)

    if (dnstypes.localAndInWindows) {

        for (const [name, info] of Object.entries(OurServerList.servers)) {
            const item = info as ServerItem
            const itemNoTld = item.master.split(".")[0] // no tld

            if (aux.wholeMaster === itemNoTld) {
                // replace the master with the local server name and port.
                let url = "http://" + aux.wholeMaster + ".zzz:" + item.port
                // console.log("rewriteUrl: localAndInWindows, url rewritten to ", url)
                return url
                // eg "http://testmain-0n0u0e5p.zzz:4001"
            }
        }
    }

    // NO. We'll get the TLD from the LeafStatus end everyone else can hang.
    // const ts : oct.TreeStatus = oct.GetTreeStatusFromCache(aux.master + "-" + aux.leaves[0]) as oct.TreeStatus;
    // let tld = ".vr"
    // if (!ts) {
    //     console.warn("aux2LocalUrl: no TreeStatus for aux.master: ", aux.master, " aux.leaves[0]: ", aux.leaves[0], " aux: ", aux)
    //     return `http://localhost:3010/?domain=${aux.master}&asset=missing&type=missing`;
    // } else {
    //     tld = ts.wasXYZ ? ".xyz" : ".vr"
    //}
    const master = aux.wholeMaster
    const dbg = aux.txtParams.dbg;
    const asset = aux.txtParams.asset;
    const type = aux.txtParams.type;
    return `http://${dbg}/?domain=${master}&asset=${asset}&type=${type}`;
}

// do we care about textures anymore? Let them fail until they are replaced with .vr urls. 
// The .vr urls will be rewritten to the subdomain form if we're not local and not using the local servers.
export default function RewriteUrl(url: string, groupInfo: oct.GroupTextParameters,
    treeStatus: oct.TreeStatus,
    forceRemote?: boolean): string {

    // console.log("rewriteUrl: localAndInWindows, url rewritten FROM ", url)

    if (false && dnstypes.localAndInWindows) { // using to translate
        // we have a master and a list.
        // make a local url 

        // eg, have "http://testmain-1n0u10w4p/street.jpg", "http://testmain-0n0u0e5p/cobblestonesgrok512.jpg"
        // or 

        for (const [name, info] of Object.entries(OurServerList.servers)) {
            const item = info as ServerItem
            if (url.includes(item.master)) {
                // replace the master with the local server name and port.
                url = url.replace(item.master, "localhost:" + item.port)
                console.log("rewriteUrl: localAndInWindows, url rewritten to ", url)
                return url
            }
        }
    }

    if (dnstypes.localAndInWindows && !dnstypes.rewriteUrlsToRemote && !forceRemote) {
        if (groupInfo.dbg) {
            // replace everything between // and the next / with the dbg value.
            url = url.replace(/\/\/[^\/]+/, "//" + groupInfo.dbg)
        } else {
            // now what?
            console.log("rewriteUrl: we're local and in windows but no dbg value in groupInfo, so we can't rewrite the url to point to the local server. url is ", url, " groupInfo is ", groupInfo)
        }
    } else {
        // get there the hard way.
        if (url.includes(".vr")) {
            // make into a subdomain request to knotfree.net or knotfree.io
            const domain = dnstypes.inHTTPSmode ? "knotfree.net" : "knotfree.io"
            url = url.replace(".vr", "_vr." + domain)  // so, now like "http://testmain-0n0u0e5p_vr.knotfree.net/cobblestonesgrok512.jpg"
            if (dnstypes.inHTTPSmode && url.startsWith("http://")) {
                url = url.replace("http://", "https://")
            }
        } else {
            // nothing. Assume that the .xyz leads to an actual server that serves the assets.
            // except... !!!
            if (dnstypes.inHTTPSmode && url.startsWith("http://")) {
                url = url.replace("http://", "https://")
            }
            // I'm using cloudflare to register the .xyz domain and to serve the assets. 
            // by default they add THEIR ip address and I think there's a tunneling trick to get that
            // to go to localhost:3010 ... more later. TODO: someone try that. I tried it. Works great. I think they will also terminate the https for you so no mucking about with certificates.
        }
    }
    // console.log("rewriteUrl returns", url)
    return url
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
