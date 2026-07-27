import React from 'react';
// This is the plumbing, or routing, for a single iFrame, or a group of TreeStatus's
// the batchInfo contains a list of those. Each TreeStatus has a Cube and also a "groupId" which is our 
// goofy, and hopefully temporary way setting up drawing state.
// RenderOneFrame
// RenderOneFrame

import { useState, useRef, useEffect } from 'react';

import * as oct from '../knotfree-ts-lib/3d/DomainNameOctTree';
import * as messes from '../knotfree-ts-lib/3d/messageTypes';

import * as sub from '../components/PubSubSimple';

const skinnyVersion = true;// like 12 pixel wide iFrames.
// out them at the TOP of the screen.  We can hide them later.

export type props4RenderOneFrameGroup = {
    // same as the master in the batchInfo
    name: string, // this is a verifiable name of a Cube, like "testmain-0n0u0e5p.vr" or "testmain-0n0u0e5p.xyz"
    // only without the the .TLD.
    batchInfo: oct.BatchInfo,
}

// RenderOneFrameGroup is a lot of code that makes a tiny dot. 
export function RenderOneFrameGroup(props: props4RenderOneFrameGroup) {

    if (oct.NoTld(props.batchInfo.masterName) !== props.batchInfo.masterName) {
        console.warn("RenderOneFrameGroup: master has TLD: ", oct.NoTld(props.batchInfo.masterName), " aux.master: ", props.batchInfo.auxRecord?.wholeMaster, " batchInfo: ", props.batchInfo)
    }
    if (oct.NoTld(props.name) !== props.batchInfo.masterName) {
        console.warn("RenderOneFrameGroup: master has TLD: ", oct.NoTld(props.batchInfo.masterName), " aux.master: ", props.batchInfo.auxRecord?.wholeMaster, " batchInfo: ", props.batchInfo)
    }

    const master = oct.NoTld(props.batchInfo.masterName);
    const [tmp, err] = oct.StringToCube(master);
    if (err) {
        console.warn("RenderOneFrameGroup: bad master name: ", master, " batchInfo: ", props.batchInfo)
        return null;
    }
    const aux = props.batchInfo.auxRecord;
    if (!aux) {
        console.warn("RenderOneFrameGroup: no aux for master: ", master, " batchInfo: ", props.batchInfo)
        // which never happens.
        return null;
    }

    const [loaded, setLoaded] = useState(false);
    const [initialMessageSent, setInitialMessageSent] = useState(false);
    const [gotAnyReply, setGotAnyReply] = useState(false);

    const iframeRef = useRef(null);

    // console.log("ListOfIframes: renderOneItem: batchInfo ", batchInfo, ", loaded: ", loaded);

    // we're going to subscribe to the name of the group, or master, or just the domain name of a space. (all the same thing).
    // So we have an address where we can send and receive messages.
    // It's name-to-frame with no tld. The iFrame will subscribe to that and then we can send messages to it.


    useEffect(() => {

        console.warn("RenderOneFrameGroup: useEffect: ", master);
        console.warn("RenderOneFrameGroup: loaded: ", loaded);
        console.warn("RenderOneFrameGroup:  master: ", master);
        console.warn("RenderOneFrameGroup:  iframeRef.current: ", iframeRef.current);

        if (loaded) {

            if (oct.NoTld(master) !== master) {
                console.warn("renderOneItem: master master has TLD: ", oct.NoTld(master), " aux.master: ", aux.wholeMaster, " batchInfo: ", props.batchInfo)
            }

            // just once, right?
            // there's no place HERE where we process messages.
            // Why would I want to send a message to an HTMLIFrameElement?
            // I can see wanting to get to the  window.addEventListener("message", handleMessageOrangeWest
            // INSIDE the iFrame, but not here. 

            sub.subscribe(oct.NoTld(master) + "-to-frame", (message) => {

                if (iframeRef.current != null) {
                    const iframe = iframeRef.current as HTMLIFrameElement;
                    if (iframe.contentWindow) {

                        // console.log("renderOneItem: iFrame has window name", iframe.name) // is empty
                        console.log("renderOneItem: -to-frame has window name", master) // is testmain-0n0u0e5p.vr

                        // This Origin * thing is going to be a problem.
                        // I have no problems locking everyone, except for gotohere.com, out but it 
                        // really doesn't seem nice. It's a lock out and that's how projects like this DIE.
                        // This will pass the message through to the iFrame. That's ALL it does
                        // there's a publish on the other end!!

                        // the message has to be a valid MessageBaseClass from messagesTypes.ts type
                        // it's not serialozed thrpugh yje subscriptiom system
                        // but it's about to be`.

                        // OK, I' decided to filter these
                        const filtered = messes.ensureMessageBaseClass(message);
                        if (filtered) {
                            const options: WindowPostMessageOptions = {
                                targetOrigin: "*", // Replace with the actual origin of the iframe for security
                            };
                            const retMessage: messes.MessageBaseClass = {
                                to: "nobody",
                                from: "iframe handle top of screen",
                                type: "dummy useless message to an html iframe element",
                                sessionId: "none",
                            }
                            // just send something already.
                            console.log("renderOneItem: sending message to iframe: master: ", master, " mapkey: ", props.batchInfo.masterName, " batchInfo: ", props.batchInfo, " message: ", retMessage)
                            // where is this going? Where does it come out.
                            // It's not a publish. !
                            // iframe.contentWindow.postMessage(retMessage, options);

                        } else {
                            // on the floor baby. In the round file. console.warn("renderOneItem: undefined message.", message);
                        }
                    }
                }
            });
        }
        else {
            //console.log("renderOneItem: Master not loaded: ", master, " mapkey: ", mapkey, " batchInfo: ", batchInfo)
        }
        // send a test message to the iFrame.
        // let's only send this once.
        if (loaded && !initialMessageSent) {
            // const saymore = "this is coming from master: " + master
            // const testMessage = { type: 'TEST_MESSAGE', content: 'Hello from parent! to frame' + saymore };
            // // The iframe should get it eventually.
            // const anaux = oct.GetAuxLeafStatus(oct.NoTld(master));
            // if (!anaux) {
            //     console.warn("renderOneItem: no aux for master: ", master, " batchInfo: ", props.batchInfo)
            // } else 
            // we have an aux
            const anAux = aux
            {
                if (oct.NoTld(master) !== master) {
                    console.warn("renderOneItem: master master has TLD: ", oct.NoTld(master), " aux.master: ", anAux.wholeMaster, " batchInfo: ", props.batchInfo)
                }
                const ourReply: messes.Greetings = {
                    to: oct.NoTld(master),
                    from: oct.NoTld(master) + "-from-frame",
                    type: "greetings",
                    sessionId: "none",
                    message: "Hello from parent. We hear you're Loaded. Send me a glb or a gltf",
                    aux: anAux
                }
                // goes through the pub sub even though we're right here.
                // why? sub.publish(oct.NoTld(master) + "-to-frame", ourReply);
            }
            // console.log("renderOneItem: sent test message to iframe: master: ", master, " mapkey: ", mapkey, " batchInfo: ", batchInfo, " message: ", ourReply)
            setInitialMessageSent(true);
        }
        else {
            // console.log("renderOneItem: iframe not loaded yet, cannot send message: master: ", master, " batchInfo: ", batchInfo)
        }

        return () => {
            sub.unsubscribe(oct.NoTld(master) + "-to-frame");
        };
    }, [loaded]);

    function loadedFunc() {

        console.log("RenderOneFrameGroup frame is loaded now: master: ", master)


        setLoaded(true); // triggers the useEffect to subscribe to the master name and send a test message.
    }

    // function info2LocalUrl(batchInfo: BatchInfo): string {
    //     const master = batchInfo.masterName
    //     const dbg = batchInfo.groupInfo.dbg;
    //     const asset = batchInfo.groupInfo.asset;
    //     const type = batchInfo.groupInfo.type;
    //     return `http://${dbg}/?domain=${master}&asset=${asset}&type=${type}`;
    // }

    // this is dumb bacause nobody is using it anyway.
    function aux2LocalUrl(aux: oct.AuxLeafStatus): string {
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

    const sourceUrl = aux2LocalUrl(aux);
    // console.log("ListOfIframes: Loading an iFrame: ", sourceUrl, " batchInfo: ", batchInfo)

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

    // <span style={{
    //                 maxWidth: '12px', padding: "0px",
    //                 borderWidth: 'small', borderStyle: 'none', borderColor: 'currentcolor', borderImage: 'none', outline: 'none'
    //                 , fontSize: '4px', lineHeight: '6px'
    //             }}>{""}</span>

    //  <div class="skinny-top-div" style="display: flex; align-items: center; justify-content: center; max-width: 12px; margin: 0px; padding: 0px; border-width: medium; border-style: none; border-color: currentcolor; border-image: none; outline: none;"><span style="padding: 0px; max-width: 12px;">_</span></div>

    // this is for ONE iframe, not the flex container

    if (skinnyVersion) {
        console.log("Loading an iFrame: ", sourceUrl, " batchInfo: ", props.batchInfo)
        return (
            <div className="skinny-top-div" key={master} style={{
                ...containerStyleSkinny
            }}>
                <iframe key={master} style={{ padding: "0px", margin: "0px" }}
                    ref={iframeRef}
                    src={sourceUrl}
                    onLoad={() => loadedFunc()}
                    width="12" height="6" title={master} loading="lazy"
                >
                </iframe>
            </div >
        );
    } else {
        return (
            <div key={master} style={{ margin: "4px", padding: "4px", ...containerStyle }}>
                <span style={{ padding: "4px" }}>{master}</span>
                <iframe key={master} style={{ padding: "4px", margin: "4px" }}
                    ref={iframeRef}
                    src={sourceUrl}
                    onLoad={() => loadedFunc()}
                    width="32px" height="32px" title={master} loading="lazy"
                >
                </iframe>
            </div>

        );
    }

}


// // make a list of the frame RenderOneFrameGroup above. Draw them below.
// function renderIframes() {
//     const iframes = [];
//     let count = 0;
//     const allElements = new Map<string, JSX.Element>();
//     for (const [key, batchInfo] of finalGroup2LeafListMap.entries()) {
//         const renderedHas = rendered.get(key);
//         if (renderedHas) {
//             // console.log("renderIframes: already rendered: ", key, " batchInfo: ", batchInfo)
//             iframes.push(renderedHas);
//             allElements.set(key, renderedHas)
//             count++;
//         } else {
//             const tmp: props4RenderOneFrameGroup = {
//                 batchInfo: batchInfo,
//                 count: count
//             };
//             const newElement = <RenderOneFrameGroup   {...tmp} />;
//             rendered.set(key, newElement);
//             iframes.push(newElement);
//             allElements.set(key, newElement)
//             count++;
//         }
//     }
//     setRendered(allElements);
//     return iframes;
// }





// const gridStyle = {
//     display: 'grid',
//     gridTemplateColumns: 'repeat(auto-fit, minmax(24px, 1fr))',
//     gap: '2px',
//     padding: '2px',
//     backgroundColor: '#f3e9e9',
//     minHeight: '12px',
// };



// if (skinnyVersion) {
//     console.log("Loading an iFrame: ", sourceUrl, " batchInfo: ", props.batchInfo)
//     return (
//         <div className="skinny-top-div" key={count} style={{
//             ...containerStyleSkinny
//         }}>
//             <iframe key={count} style={{ padding: "0px", margin: "0px" }}
//                 ref={iframeRef}
//                 src={sourceUrl}
//                 onLoad={() => loadedFunc()}
//                 width="12" height="6" title={master} loading="lazy"
//             >
//             </iframe>
//         </div >
//     );
// } else {
//     return (
//         <div key={count} style={{ margin: "4px", padding: "4px", ...containerStyle }}>
//             <span style={{ padding: "4px" }}>{master}</span>
//             <iframe key={count} style={{ padding: "4px", margin: "4px" }}
//                 ref={iframeRef}
//                 src={sourceUrl}
//                 onLoad={() => loadedFunc()}
//                 width="32px" height="32px" title={master} loading="lazy"
//             >
//             </iframe>
//         </div>

//     );
// }