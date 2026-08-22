
import React, { useRef } from 'react';

import { useEffect, useState } from 'react';
// import * as pubsub from '../knotfree-ts-lib/avatars/PubSubTopicAndSubscribers';
import * as messes from '../knotfree-ts-lib/3d/messageTypes';
import * as oct from '../knotfree-ts-lib/3d/Dns8Tree';
import { props4RenderOneFrameGroup, RenderOneFrameGroup } from './MakeAnIFrame';
import { mainpubsub } from '../App';

// See this at the top of App.tsx. It shows all the iFrames. in teeny tiny boxes.
// if the're not visible they don't render and we need them alive. 
// Some how, in life we want to hide it.  

var countOfPrintedMessages = 0;

export function MakeListOfIFrames() {

    // the iFrames will be a list of the BatchInfo that we calculated from the leaves
    // in MakeBoxesForShowingLeaves.  We will have to subscribe to that list of BatchInfo and then render the iFrames for each of them.

    // the last batch of leaves to render were processed into a list of groups.
    // These are their keys. They may or may not have changed.
    // They are ALSO the base for the URL's of the iFrames.
    const [groupKeysToRender, SetGroupKeysToRender] = useState([] as string[]); // this is the list of keys for the BatchInfo in the map. We will use this to render the iFrames.`

    // useEffect to subscribe to the pubsub topic "NewGroupKeys" and then render the iFrames for each of them. 
    // This is a sub for the whole batch. No individual items.
    useEffect(() => {
        const subscription = mainpubsub.subscribe("NewGroupKeys", "MakeListOfIFrames",
             (groupKeys: string[], err: Error | null) => {

            // do nothing if the keys are the same and this happens a lot. 
            // We don't want to re-render the iFrames if the keys are the same.

            // trigger a re-render of the AppCanvas with the new leaves.
            // We'll just check that they're in the cache and that's good enough.
            // This is just a verification.
            for (const key of groupKeys) {
                if (!oct.VerifyCubeName(key)) {
                    // .. never happens. Why am I writing it? It's just a sanity check. Who says there's sanity in this bug house.
                    console.error("ERROR App got showingLeaves with a leaf that is not a valid cube name ", key)
                }
            }
            if (DidKeysChange(groupKeysToRender, groupKeys)) {
                SetGroupKeysToRender([...groupKeys])
            } else {
                // console.log("MakeListOfIFrames: keys are the same, no need to re-render iFrames.")
            }
        },"nolog");
        return () => {
            mainpubsub.unsubscribe("NewGroupKeys", "MakeListOfIFrames")
        }
    }); // run every time, not just once. Yes? No? NO NO NO. It starts loopiing?
    // We want to subscribe every time the component renders so that the callback has the LATEST state. EVERY TIME.


    // DidKeysChange checks if the keys changed by sorting them by name
    // and then just comparing the names. If they are the same then we can just go home.
    // The beauty part is that we don't even have to sort the previous list
    // because we already sorted that list before we publish it. So we can just compare the names in order.
    // Thanks CP for writing the fluffiest possible version of this possible. lol. Gotta love it.
    function DidKeysChange(oldKeys: string[], newKeys: string[]): boolean {
        if (oldKeys.length !== newKeys.length) {
            return true
        }
        // let's keep them sorted by name all the time.
        oldKeys.sort((a, b) => a.localeCompare(b));
        // The old leaves are already sorted from the last time we published them. 
        // So we don't have to sort them again. We just have to sort the new leaves before we compare them.
        newKeys.sort((a, b) => a.localeCompare(b));
        for (let i = 0; i < oldKeys.length; i++) {
            const oldKey = oldKeys[i];
            const newKey = newKeys[i];
            if (oldKey !== newKey) {
                return true;
            }
        }
        return false
    }

    // what do we know when we get here?
    // who calls this? Who do the iFrames call?
    // Maybe we should avoid this bad boy,
    // delete me.
    const XXXXXhandleOneFrameMessageHandler = (event: MessageEvent) => {


        // getting these from dev tools.
        if (countOfPrintedMessages < 20) {
           //  console.log("MakeListOfIFrames: handleOneFrameMessageHandler: event.data:", event.data, event);
            countOfPrintedMessages++;
        } else if (countOfPrintedMessages === 10) {
            // console.log("MakeListOfIFrames: handleOneFrameMessageHandler: event.data: ... too many messages, suppressing further logs.");
            // countOfPrintedMessages++;
        }

        // some log info:
        //         console.log("MakeListOfIFrames source", event.source); // list of window object
        //         console.log("MakeListOfIFrames origin", event.origin); // http://localhost:3020 always the same
        //         console.log("MakeListOfIFrames data", event.data); // various {source: 'react-devtools-bridge', payload: {…}}
        //         console.log("MakeListOfIFrames target", event.target); //is a list of Window objects sand a big struct
        //         console.log(: type", event.type); // webpackWarnings etc

        // they come in here almost worthless, we don't know 'from' or 'to' 
        // or 'what' or why or anything. Some should go straight to a publish.
        // They are supposed to only come from our iFrames.
        // filter out the rif raff. 
        const baseMMessage = messes.ensureMessageBaseClass(event.data) // interesting.
        if (baseMMessage) {

            // a more interesting message would be a an Avatar 'Wants to move' here message.
            // we expect it's an initial contack from a loaded frame.
            // a ping back.

            // not getting these?
            console.log("INFO Received GOTOHERE Message in Make List All I frames. filtered:", baseMMessage);

            //    sub.publish(baseMMessage.to, baseMMessage); // this is the one and only global event listener for all the iframes. It will get the messages from the iframes and then dispatch them to the correct iframe based on the master name.

            // there's no GLB's around here.
            // if (baseMMessage.type === "glb") {
            //     const glbMessage = baseMMessage as messages.GlbMessage;
            //     // handle glb message
            //     // we have received the desired glb message.
            //     console.log("Received GLB Message:", baseMMessage);
            //     const aCubeName = glbMessage.to.split('-')[0];
            //     let auxTree = oct.nameToAuxTreeStatus[aCubeName];
            //     if (!auxTree) {
            //         auxTree = {
            //             name: aCubeName,
            //             glbBlob: glbMessage.data,
            //         };
            //         oct.nameToAuxTreeStatus[aCubeName] = auxTree;
            //     }
            //     auxTree.glbBlob = glbMessage.data;
            //}

        } else {
            return
        }
    };

    function renderIframes() {

        let totalCubes = 0;
        // is the aux leaf in the list? twice?
        for (const key of groupKeysToRender) {
            const aux = oct.LookupAuxLeafStatus(key);
            if (aux) {
                totalCubes += aux.leaves.length;
            } else {
                console.warn("MakeListOfIFrames: No aux for key: ", key, " groupKeysToRender: ", groupKeysToRender)
            }
        }
        // console.log("MakeListOfIFrames: Rendering iFrames. Total cubes to render: ", groupKeysToRender.length, totalCubes)

        const iframes = [];
        for (const key of groupKeysToRender) {
            const aux = oct.LookupAuxLeafStatus(key);
            if (!aux) {
                console.warn("MakeListOfIFrames: No aux for key: ", key, " groupKeysToRender: ", groupKeysToRender)
                continue;
            }
            // we have the aux and the name. We can make the props for the RenderOneFrameGroup component.
            //
            const tmp: props4RenderOneFrameGroup = {
                name: key,
                aux: aux,
            };
            const newElement = (
                <React.Fragment key={aux.wholeMaster}>
                    <RenderOneFrameGroup   {...tmp} />
                </React.Fragment>
            );

            iframes.push(newElement);
        }
        return iframes;
    }

    // I think this is in the APP now.
    // const containerStyle = {
    //     display: 'flex',
    //     alignItems: 'center',
    //     justifyContent: 'center',
    // };

    // const containerStyleSkinny = {
    //     display: 'flex',
    //     alignItems: 'center',
    //     justifyContent: 'center',
    //     //  minWidth: '12px',
    //     maxWidth: '12px',
    //     margin: 0,
    //     padding: 0,
    //     border: 'none',
    //     outline: 'none',
    //     gap: '2',
    // };


    return (
        <>{renderIframes()}</>
    )

}


// What is this ? 
// no, fully param themn and thet the props figure it out.
// when we get new ones we keep the old ones and just add the new ones.
// const [rendered, setRendered] = useState(new Map<string, JSX.Element>());
// at the end of the element rendered will be all of them

// just checking the names are right and the aux records are there. This is a sanity check.
// function checkallMasters(themap: Map<string, oct.BatchInfo>) {

//     for (const [key, batchInfo] of themap.entries()) {
//         const aux = batchInfo.auxRecord;
//         if (!aux) {
//             // does this happen?
//             console.warn("ERROR MakeListOfIFrames: no aux for master: ", batchInfo.masterName, " batchInfo: ", batchInfo)
//         } else {
//             oct.NoTld(aux.wholeMaster)
//             const [tmp, err] = oct.StringToCube(oct.NoTld(aux.wholeMaster));
//             if (err) {
//                 console.warn("ERROR MakeListOfIFrames: bad aux for master: ", batchInfo.masterName, " aux: ", aux, " batchInfo: ", batchInfo)
//             }
//             // normal console.log("MakeListOfIFrames: aux for master: ", batchInfo.masterName, " aux: ", aux)
//             aux.leaves.forEach((leaf) => {
//                 const [tmp2, err2] = oct.StringToCube(aux.justTheWorld + "-" + leaf);
//                 if (err2) {
//                     console.warn("ERROR, Leaves are bad MakeListOfIFrames: bad aux leaf for master: ", batchInfo.masterName, " aux: ", aux, " leaf: ", leaf, " batchInfo: ", batchInfo)
//                 }
//             });
//         }
//     }
// }
// checkallMasters(groupKeyList)

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
