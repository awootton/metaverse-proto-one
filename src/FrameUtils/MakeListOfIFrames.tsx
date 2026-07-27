
import React, { useRef } from 'react';

import { useEffect, useState } from 'react';
import * as pubsub from '../components/PubSubTopicAndSubscribers';
import * as sub from '../components/PubSubSimple';
import { CoronavirusOutlined, Padding } from '@mui/icons-material';
import * as messes from '../knotfree-ts-lib/3d/messageTypes';
import * as oct from '../knotfree-ts-lib/3d/DomainNameOctTree';
import { BatchInfo } from '../knotfree-ts-lib/3d/DomainNameOctTree';
import { count } from 'console';
import { props4RenderOneFrameGroup, RenderOneFrameGroup } from './MakeAnIFrame';

// see this at the end of App.tsx. It shows all the iFrames.
// in real life we want to hide it.  

// how do we load this bad boy?
// master: testmain-0n0u0e5p.vr, dbg: localhost:3010, asset: cobblestonesgrok512.jpg:repeat:20, type: floor,leaves: testmain-0n0u0e5p
// irl we just use the domain name right there.
// locally it would be localhost:3010/?domain=testmain-0n0u0e5p.vr&asset=cobblestonesgrok512.jpg:repeat:20&type=floor
// ? That's not a bad idea. 
// it's not clear the right iFrames are in the right places since we're using localhost:3010 for everything.

export function MakeListOfIFrames() {

    // the iFrames will be a list of the BatchInfo that we calculated from the leaves
    // in MakeBoxesForShowingLeaves.  We will have to subscribe to that list of BatchInfo and then render the iFrames for each of them.

    // way too complicated,
    const [finalGroup2LeafListMap, SetFinalGroup2LeafListMap] = useState(new Map<string, oct.BatchInfo>);

    // no, fully param themn and thet the props figure it out.
    // when we get new ones we keep the old ones and just add the new ones.
    // const [rendered, setRendered] = useState(new Map<string, JSX.Element>());
    // at the end of the element rendered will be all of them

    // just checking the names are right and the aux records are there. This is a sanity check.
    function checkallMasters(themap: Map<string, oct.BatchInfo>) {

        for (const [key, batchInfo] of themap.entries()) {
            const aux = batchInfo.auxRecord;
            if (!aux) {
                // does this happen?
                console.warn("ERROR MakeListOfIFrames: no aux for master: ", batchInfo.masterName, " batchInfo: ", batchInfo)
            } else {
                oct.NoTld(aux.wholeMaster)
                const [tmp, err] = oct.StringToCube(oct.NoTld(aux.wholeMaster));
                if (err) {
                    console.warn("ERROR MakeListOfIFrames: bad aux for master: ", batchInfo.masterName, " aux: ", aux, " batchInfo: ", batchInfo)
                }
                // normal console.log("MakeListOfIFrames: aux for master: ", batchInfo.masterName, " aux: ", aux)
                aux.leaves.forEach((leaf) => {
                    const [tmp2, err2] = oct.StringToCube(aux.justTheWorld + "-" + leaf);
                    if (err2) {
                        console.warn("ERROR, Leaves are bad MakeListOfIFrames: bad aux leaf for master: ", batchInfo.masterName, " aux: ", aux, " leaf: ", leaf, " batchInfo: ", batchInfo)
                    }
                });
            }
        }
    }
    checkallMasters(finalGroup2LeafListMap)


    // useEffect to subscribe to the pubsub topic "group2LeafListMap" and then render the iFrames for each of them. 
    // This is a sub for the whole batch. No individual items.
    useEffect(() => {
        const subscription = pubsub.subscribe<Map<string, oct.BatchInfo>>("group2LeafListMap", "ListOfIframes", (group2LeafListMap) => {

            // let's verity the incoming map is valid.
            checkallMasters(group2LeafListMap)

            // this is where they come in. As group2LeafListMap
            // the first thing we want to do is toss the ones we already have here.
            const theNewOnes = new Map<string, oct.BatchInfo>();
            for (var [key, val] of group2LeafListMap.entries()) {
                // if it NOT in the old map add it to theNewOnes.
                if (!finalGroup2LeafListMap.has(key)) {
                    // it's new. A Virgin {
                    theNewOnes.set(key, val);
                }
            }
            // It's better to have a new list when we set the state so let's copy the old ones into the new list. 
            for (const [key, batchInfo] of finalGroup2LeafListMap.entries()) {
                theNewOnes.set(key, batchInfo);
            }
            // and now the theNewOnes is the new map! 
            SetFinalGroup2LeafListMap(theNewOnes);
            checkallMasters(theNewOnes) // finalGroup2LeafListMap didn't happen yet
        });

        return () => {
            pubsub.unsubscribe("group2LeafListMap", "ListOfIframes");
        };
    }, [finalGroup2LeafListMap]);

    // what do we know when we get here?
    const handleOneFrameMessageHandler = (event: MessageEvent) => {

        // HINTS:
        //         console.log("MakeListOfIFrames source", event.source); // list of window object
        //         console.log("MakeListOfIFrames origin", event.origin); // http://localhost:3020 always the same
        //         console.log("MakeListOfIFrames data", event.data); // various {source: 'react-devtools-bridge', payload: {…}}
        //         console.log("MakeListOfIFrames target", event.target); //is a list of Window objects sand a big struct
        //         console.log(: type", event.type); // webpackWarnings etc

        // they come in here almost worthless, we don't know 'from' or 'to' 
        // or 'what' or why or anything. Some should go straight to a publish.
        // They are supposed to only come from our iFrames.
        const baseMMessage = messes.ensureMessageBaseClass(event.data) // interesting.

        if (baseMMessage) {

            // a more interesting message would be a an Avatar 'Wants to move' here message.
            // we expect it's an initial contack from a loaded frame.
            // a ping back.
            console.log("Received GOTOHERE Message:", baseMMessage);

            sub.publish(baseMMessage.to, baseMMessage); // this is the one and only global event listener for all the iframes. It will get the messages from the iframes and then dispatch them to the correct iframe based on the master name.

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


    // useEffect This is how we maintain the event listener that get's the messages from ALL the iframes.
    // We need to have a single even listener that gets the messages from all the iframes and then dispatches them to the correct iframe based on the master name.
    // this is the one and only global event listener for all the iframes. 
    // It will get the messages from the iframes and then dispatch them to the correct iframe based on the master name.
    // this object knows it's BatchInfo and to it's aux and name.
    useEffect(() => {

        window.addEventListener("message", handleOneFrameMessageHandler);
        return () => {
            // don't we unhook this here? I think we do.
            window.removeEventListener("message", handleOneFrameMessageHandler);
        };
    }, []); // empty dependency array means this effect runs once on mount and cleans up on unmount. ok


    function renderIframes() {
        const iframes = [];
        for (const [key, batchInfo] of finalGroup2LeafListMap.entries()) {

            const tmp: props4RenderOneFrameGroup = {
                batchInfo: batchInfo,
                name: batchInfo.masterName,
            };
            const newElement = <RenderOneFrameGroup   {...tmp} />;

            iframes.push(newElement);
        }
        return iframes;
    }

  // this is dumb bacause nobody is using it anyway.
    // function aux2LocalUrl(aux: oct.AuxLeafStatus): string {
    //     // NO. We'll get the TLD from the LeafStatus end everyone else can hang.
    //     // const ts : oct.TreeStatus = oct.GetTreeStatusFromCache(aux.master + "-" + aux.leaves[0]) as oct.TreeStatus;
    //     // let tld = ".vr"
    //     // if (!ts) {
    //     //     console.warn("aux2LocalUrl: no TreeStatus for aux.master: ", aux.master, " aux.leaves[0]: ", aux.leaves[0], " aux: ", aux)
    //     //     return `http://localhost:3010/?domain=${aux.master}&asset=missing&type=missing`;
    //     // } else {
    //     //     tld = ts.wasXYZ ? ".xyz" : ".vr"
    //     //}
    //     const master = aux.wholeMaster
    //     const dbg = aux.txtParams.dbg;
    //     const asset = aux.txtParams.asset;
    //     const type = aux.txtParams.type;
    //     return `http://${dbg}/?domain=${master}&asset=${asset}&type=${type}`;
    // }

    // const sourceUrl = aux2LocalUrl(aux);
    // // console.log("ListOfIframes: Loading an iFrame: ", sourceUrl, " batchInfo: ", batchInfo)

    const containerStyle = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    };

    const containerStyleSkinny = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        //  minWidth: '12px',
        maxWidth: '12px',
        margin: 0,
        padding: 0,
        border: 'none',
        outline: 'none',
        gap: '2',
    };

 //   let count = props.count;

    // <span style={{
    //                 maxWidth: '12px', padding: "0px",
    //                 borderWidth: 'small', borderStyle: 'none', borderColor: 'currentcolor', borderImage: 'none', outline: 'none'
    //                 , fontSize: '4px', lineHeight: '6px'
    //             }}>{""}</span>

    //  <div class="skinny-top-div" style="display: flex; align-items: center; justify-content: center; max-width: 12px; margin: 0px; padding: 0px; border-width: medium; border-style: none; border-color: currentcolor; border-image: none; outline: none;"><span style="padding: 0px; max-width: 12px;">_</span></div>

    // this is for ONE iframe, not the flex container

}

