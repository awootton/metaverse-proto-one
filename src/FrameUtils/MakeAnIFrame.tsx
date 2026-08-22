import React from 'react';
// This is the plumbing, or routing, for a single iFrame, or a group of TreeStatus's
// the batchInfo contains a list of those. Each TreeStatus has a Cube and also a "groupId" which is our 
//  , and   temporary way setting up drawing state.
// RenderOneFrame This is the mainland side of an iFrame.
// RenderOneFrame

import { useState, useRef, useEffect } from 'react';

import * as oct from '../knotfree-ts-lib/3d/Dns8Tree';
// import { publish } from '../knotfree-ts-lib/avatars/PubSubTopicAndSubscribers';
import * as sub from '../knotfree-ts-lib/avatars/PubSubSimple';
import { mainpubsub } from '../App';
import { aux2LocalUrlForIframes } from '../components/RewriteUrl';
import { MasterToFriviousName } from '../knotfree-ts-lib/avatars/testServermap';

const skinnyVersion = true;// like 12 pixel wide iFrames.
// out them at the TOP of the screen.  We can hide them later.

export type props4RenderOneFrameGroup = {
    // same as the master in the batchInfo
    name: string, // this is a verifiable name of a Cube, like "testmain-0n0u0e5p.vr" or "testmain-0n0u0e5p.xyz"
    // only WITHOUT the the .TLD.
    aux: oct.AuxLeafStatus,
}

// RenderOneFrameGroup is a lot of code that makes a tiny dot. 
// What do we have over here that a AuxGroupRenderer would want except that we're loaded now and can 
// ask for weapons and status and glb's and stuff.
export function RenderOneFrameGroup(props: props4RenderOneFrameGroup) {

    const master = props.aux.wholeMaster;
    const [tmp, err] = oct.StringToCube(master);
    if (err) {
        console.warn("RenderOneFrameGroup: bad master name: ", master)
        return null;
    }
    const aux = props.aux;
    if (!aux) {
        console.warn("RenderOneFrameGroup: no aux for master: ", master)
        // which never happens.
        return null;
    }

    // const [loaded, setLoaded] = useState(false);
    const [initialMessageSent, setInitialMessageSent] = useState(false);
    const [gotAnyReply, setGotAnyReply] = useState(false);

    const iframeRef = useRef<HTMLIFrameElement>(null);

    // We COULD use this for the initial sunscribe. We'll see.
    // We really want the iFrame to manage the subscribe.
    function OnLoad() {

        console.log("OnLoad: iFrame is loaded now: name: ", MasterToFriviousName(master), " master: ", master)

        const thing = iframeRef.current;
        if (!thing) {
            console.warn("RenderOneFrameGroup: OnLoad: no iframeRef.current for master: ", master)
            return;
        }
        if (iframeRef.current) {
            if (iframeRef.current.contentWindow) {
                mainpubsub.addContentWindow(master, iframeRef.current.contentWindow);
            } else {
                console.warn("RenderOneFrameGroup: OnLoad: no iframeRef.current.contentWindow for master: ", master)
                return;
            }
        } else {
            console.warn("RenderOneFrameGroup: OnLoad: no iframeRef.current for master: ", master)
            return;
        }

    // who do we expect to have subscribed to this?
    // lol. nobody. It doesn't matter.
    // but it makes an annoying log though - sub.publish(aux.wholeMaster + "-loaded", "We are loaded now.")
}

const sourceUrl = aux2LocalUrlForIframes(aux);

//console.log("ListOfIframes: attemptiong an iFrame load: ", sourceUrl, " batchInfo: ", master)

const containerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
};

const containerStyleSkinny = {
    // display: 'flex',
    // alignItems: 'center',
    // justifyContent: 'center',
    //  minWidth: '12px',

    fontSize: '8px',
    lineHeight: '6px',
    maxWidth: '12px',
    margin: 0,
    padding: 0,
    border: 'none',
    outline: 'none',
    gap: '2',
};

// we ONLY use the skinny  now.
// what would the title be? title={master} master means nothing to the user. It's just a cube name.

if (skinnyVersion) {
    return (<>

        <span className="skinny-top-div" key={master} style={{
            ...containerStyleSkinny
        }}>

            <iframe key={master}
                style={{ padding: "0px", margin: "0px" }}
                ref={iframeRef}
                src={sourceUrl}
                onLoad={OnLoad}
                width="12" height="6"
                loading="lazy"
            />

        </span >
    </>
    );
} else {
    return (
        <div key={master} style={{ margin: "4px", padding: "4px", ...containerStyle }}>
            <span style={{ padding: "4px" }}>{master}</span>
            <iframe key={master} style={{ padding: "4px", margin: "4px" }}
                ref={iframeRef}
                src={sourceUrl}
                onLoad={OnLoad}
                width="32px" height="32px" title={master} loading="lazy"
            >
            </iframe>
        </div>
    );
}
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
// along with this program.  If not, see <http://www.gnu.org/licenses/

