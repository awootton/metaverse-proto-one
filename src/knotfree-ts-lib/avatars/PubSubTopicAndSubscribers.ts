import { MasterToFriviousName } from "../avatars/testServermap";
import * as messes from "../3d/messageTypes";
import { MessageBaseClass, tracebridgemesses } from "../3d/messageTypes";
import { handlePaleMessages } from "./PubSubBridge";


// Because of symmetry and code overlap I'm afraid we're going discontinue the island (bridge)
// version of this code and fold that into here. See the comments at the top of PubSubBridge though.

// This is a pub/sub system for components to subscribe to changes, messages and replies.
// It is meant to work across the mainland/island boundary, handling messages between different contexts transparently.
// It is also meant to support an RPC mechanism, allowing components to request actions and receive responses asynchronously.

type CallbackInfo = {
    callback: (status: any, err: Error) => any
    info: string // for debugging and general annoyance.
}

type LocalMapItem = {
    // they have to be named so we can remove them when the component unmounts. 
    // So the key would be the name of the component, or some unique identifier for the component instance.
    // are we using the error?
    // the collector has a name and a function to call
    callbackList: Map<string, CallbackInfo>
}

export class PubSubTopicAndSubscribers {

    onAnIsland: boolean; // are WE on an island right now? 

    namesMap = new Map<string, LocalMapItem>()

    // we will get each of our iFrames to register with us and then we can send them messages.
    // The names don't matter but must be unique.
    contentWindows = new Map<string, Window>()

    debugname: string = "frivolous "

    ourCleanMasterDomainName: string = "sssssdddd" // where could get this from? I'm suck it from the 

    constructor(theRealDomainName: string, debugname: string) {

        this.ourCleanMasterDomainName = theRealDomainName;
        this.debugname = debugname || "frivolous "
        this.namesMap = new Map<string, LocalMapItem>()
        this.contentWindows = new Map<string, Window>()
        if (window.self !== window.top) { // pretty cool.
            this.onAnIsland = true;
        } else {
            this.onAnIsland = false;
        }
        window.addEventListener("message", this.ourWindowEventListenerHandler, false); // below
    }

    getOurCleanMasterDomainName(): string {
        return this.ourCleanMasterDomainName
    }

    addContentWindow(name: string, contentWindow: Window) {
        // console.log("PubSubTopicAndSubscribers: registered contentWindow for : ", name, " contentWindow: ", contentWindow)
        this.contentWindows.set(name, contentWindow)
    }

    removeContentWindow(name: string) {
        console.log("PubSubTopicAndSubscribers: removed contentWindow for : ", name)
        this.contentWindows.delete(name)
    }

    // we're setting these here. and we have a map, but what about in the wild? When there's no AppShitter?
    // When there's no testServermap.ts? No /etc/hosts ? 
    getDebugName(): string {
        return this.debugname
    }

    // from name to localMapItem
    // every key, like 'DemoPropertiesChanges' will have a list of callbacks.
    // so "App" might have a callback for "DemoPropertiesChanges", and "OrbitPropertyDialog2" might also have a callback for "DemoPropertiesChanges". 
    // When we publish "DemoPropertiesChanges", we want to call all the callbacks that are subscribed to that name.
    // We will take care to use separate keys for each instance. 

    getMapItem(name: string): LocalMapItem | undefined {
        if (name.length > 0) {
            return this.namesMap.get(name)
        } else {
            return undefined
        }
    }

    // they have to be named so we can remove them when the component unmounts.

    // Note: we don't remember old values or supply them to new subscribers. 
    // We just call the callbacks when we publish.
    subscribe(key: string, who: string, cb: (status: any, err: Error, info?: string) => any, info?: string) {

        if (this.debugname === "courtyard") {
            console.log("PubSubTopicAndSubscribers: subscribe: key: ", key, " who: ", who, " this.debugname: ", this.debugname)
        }

        const tmp: CallbackInfo = {
            callback: cb,
            info: info || ""
        }

        let found: LocalMapItem | undefined = this.getMapItem(key)
        if (found === undefined) {
            let found: LocalMapItem = {
                callbackList: new Map<string, CallbackInfo>(),
            }
            found.callbackList.set(who, tmp)
            this.namesMap.set(key, found)

        } else {
            // replace or add the callback
            found.callbackList.set(who, tmp)
        }
        // no, why, to who? return found
        // let's say we're on the island.
        if (this.onAnIsland) {
            // We don't know what's up at the mainland. Let's send them a message so they know to forward
            // messages on this channel to us here.

            // also send a message to make a subscribe over on the mainland.
            // we can just do it right here? This is weird. The true cb's has been saved here unless somebody deletes them
            // and doesn't tell us.
            const submsg: messes.MessageSubscribeClass = {
                to: "mainland", // the mainland
                from: "island_" + this.debugname,
                key: key, // channel name
                who: who,
                cmd: "execute_theSubscribe_from_island",
                magic: messes.magicMessageNumber,
            }
            tracebridgemesses('PubSubBridge execute_theSubscribe send to window.parent.postMessage', submsg)
            // We HAVE a parent because we are on the island. We are in an iFrame. 
            // We are not on the mainland. 
            window.parent.postMessage(submsg, '*');
            // watch for it coming out at the mainland. It will be handled by the handleTanMessages listener on the mainland.

        } else if (!this.onAnIsland) { // on the mainland

            // TODO: have an option for an isLand to subscribe for just themselves, not all islands..
            // This could actually be a thing. the RPC temporaryChannel really only needs replies from the specific island that initiated it.
            // this makes it a singleton. 

            // we just set a subscribe here. Do we, how do we notify the islands of this subscribe?
            // I'm going to just blast it out??

            // also send a message to make a subscribe over on the mainland.
            // we can just do it right here? This is weird. The true cb's has been saved here unless somebody deletes them
            // and doesn't tell us.
            const submsg: messes.MessageSubscribeClass = {
                to: "IslandsAll", // the which is not a thing
                from: "mainland_????" + this.debugname,
                key: key, // channel name
                who: who,
                cmd: "execute_theSubscribe_from_island",
                magic: messes.magicMessageNumber,
            }
            tracebridgemesses('PubSubBridge execute_theSubscribe send to window.parent.postMessage', submsg)
            // We HAVE no parent because we are on the mainland. 
            // We are ON the mainland. 

            // we do have a lost of contentWindows. Right?
            // We should iterate over them and send the message to each iframe.
            const iframes = document.getElementsByTagName('iframe');
            for (const iframe of iframes) {
                if (iframe.contentWindow) {
                    iframe.contentWindow.postMessage(submsg, '*');
                }
            }
            // That's pretty slick. Do we think it will fly?
            // I would advise all isLands to repeat their subscriptions. It's not that expensive. 
            // publish is much more expensive.

        } else {
            // Let's say we're on the ...where?.... Do we tell ALL the islands to subscribe to this key? 
            // Or just the one that requested it? The one that just requested it just did that work.
            // how can we posssibly reach all the other islands to tell them to subscribe?
            console.log('mainland has a subscribe', key, who, this.debugname, "do we try to notify ALL the islands?")
        }
    }

    // all the who's get a callback.
    publish(key: string, status: any, err: Error = new Error("")) {

        const found = this.getMapItem(key)
        if (found !== undefined) {
            // iterate the callback list and call each one.
            for (const [callbackKey, callbackInfo] of found.callbackList) {
                if (callbackInfo !== undefined) {
                    // console.log('pubsub publish', callbackKey, status)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    -';
                    // call them anonymously so they can't mess with each other.
                    setTimeout(() => {
                        try {
                            // we could log or filter the info here if we wanted to.
                            callbackInfo.callback(status, err)
                        } catch (e) {
                            console.error('Error in pubsub callback for key', callbackKey, 'with status', status, 'and error', err, ': ', e)
                        }
                    }, 0) // straight to the input queue.
                    // c
                    //cb(status, err)
                } else {
                    // this is weird and shouldn't happen.
                    console.log('pubsub publish callback is undefined', callbackKey)
                }
            }
            // also tell the bridge? 
        } else {
            // not really a problem if there are no subscribers, but maybe we want to know about it for debugging.
            console.log('PubSub didnt find key', key, "in", this.debugname, ":", MasterToFriviousName(key))
            // do we check for a bridge now? How does THAT work. 
        }
        // no, the 'bridge' has a subscription where the 'publish' when evoked will automatically send the message across the bridge. 
        // We don't need to manually handle it here.
    }

    // remove is called when a component is unmounted.
    // OMG: none of this has been written. ???
    unsubscribe(key: string, myAppName: string) { // myAppName aka who is unsubscribing
        const found = this.getMapItem(key)
        if (found !== undefined) {
            // console.log('pubsub unsubscribe', key, myAppName)
            found.callbackList.delete(myAppName)
            if (found.callbackList.size === 0) {
                this.namesMap.delete(key)
                // and, it's gone and forgotton.
            }
            if (this.onAnIsland) {
                //use the same message as a sub

                const submsg: messes.MessageSubscribeClass = {
                    to: "IslandsAll", // the which is not a thing
                    from: "mainland_????" + this.debugname,
                    key: key, // channel name
                    who: myAppName,
                    cmd: "execute_UnSubscribe_everywhere",
                    magic: messes.magicMessageNumber,
                }
                tracebridgemesses('PubSubBridge execute_UnSubscribe_everywhere send to window.parent.postMessage', submsg)
                // We HAVE no parent because we are on the mainland. 
                // We are ON the mainland. 

                if (!this.onAnIsland) {
                    // we do have a list of contentWindows. Right?
                    // We should iterate over them and send the message to each iframe.
                    const iframes = document.getElementsByTagName('iframe');
                    for (const iframe of iframes) {
                        if (iframe.contentWindow) {
                            const ourmsg = { ...submsg };
                            iframe.contentWindow.postMessage(ourmsg, '*');
                        }
                    }
                }
                if (this.onAnIsland) {
                    // maybe we need to send a message to the parent as well
                    // they don't need a special massage just for this.
                    window.parent.postMessage(submsg, '*');
                }
            }
        }
    }

    // just dump to the console and that's it. We'll get fancy later.
    // there 

    // accumulatedDumpState: string[] = [] // for debugging, we can dump the state of the pubsub.
    // accumulatedDumpStateReported: number = 0
    // accumulatedDumpStartTime: number = 0

    // accumulatedDumpStateCallback: (dump: string[]) => any = () => { }
    // accumulatedFunished: (dump: string[]) => any = () => { }
    // previouslyDumped: Set<string> = new Set<string>()


    // show us the state of all the subscriptions and their callbacks.
    // needs a callback
    DumpState(cb: (dump: string[]) => void) {

        // if (!this.onAnIsland) {
        //     this.previouslyDumped.clear()
        //     this.accumulatedDumpStateCallback = cb
        //     this.accumulatedDumpStateReported = 0
        //     this.accumulatedDumpState = [] // reset the dump state
        //     this.accumulatedDumpStartTime = Date.now()

        //     // don't do them twice. 
        // }
        // if (this.previouslyDumped.has(this.debugname)) {
        //     return
        // }
        // this.previouslyDumped.add(this.debugname)

        // this is no good: keep the dump in the string array.
        // console.log("dumpPubSubState dumpPubSubState started", this.debugname)

        let dump: string[] = []
        let indent = "    "

        dump.push("Top of Dump for " + this.debugname)

        // subscription 
        //     sunscribeName
        //         callback 

        for (const key of this.namesMap.keys()) {
            const item: LocalMapItem | undefined = this.getMapItem(key)
            if (item === undefined) {
                dump.push(indent + "" + key + " is undefined")
                continue
            } else {
                // we have the whole item.
                const localMapItem = item as LocalMapItem
                for (const [itemName, callbackInfo] of localMapItem.callbackList) {
                    // console.log("dumpPubSubState ", this.debugname, " key: ", key, " itemName: ", itemName, " callback: ", callbackInfo.callback)
                    //let theCallback = callbackInfo.callback
                    // it's the text of the whole callback if you don't watch out
                    // maybe I want that, a little bit.  
                    // var formattedCode = console.debug(theCallback.toString())
                    // It DID work. A lot. The whole thing but it's a mess to read.
                    // theCallback.toString()

                    const theTextCallback = "{.........}"
                    dump.push(indent + indent + key + ":")
                    dump.push(indent + indent + indent + itemName + ":")
                    dump.push(indent + indent + indent + indent + " cb:" + theTextCallback)
                    dump.push(indent + indent + indent + indent + indent + " info:" + callbackInfo.info)
                }
            }
            // dump.push(indent + key)
        }

        // this.accumulatedDumpState.push(...dump)

        if (this.onAnIsland) {
            console.log("have island dump: \n", this.debugname, dump.join("\n"))
            cb(dump)
            return
        } else {
            // on the mainland// dump this and then keep going to inform the islands
            console.log("have mainland dump: \n", this.debugname, dump.join("\n"))
        }

        for (const [name, contentWindow] of this.contentWindows) {
            dump.push(indent + "contentWindow name: " + name)

            const DumpRequest: messes.MessageBaseClass = {
                to: name + ":" + MasterToFriviousName(name) + "-contentWindow",
                from: "pubsub-" + this.debugname,
                cmd: "DumpStateRequest",
                magic: messes.magicMessageNumber
            }
            contentWindow.postMessage(DumpRequest, "*");
        }
        // sit around and wait for them to come back. 
        // we sent them out.  call the callback, not this.
    }

    // haveIncomingDumpState(msg: messes.MessageDumpReplyClass) {

    //     this.accumulatedDumpState.push(msg.nameOfReporter);
    //     this.accumulatedDumpState.push(...msg.dumpData);
    //     this.accumulatedDumpStateReported++;
    //     if (this.accumulatedDumpStateReported >= this.contentWindows.size) {
    //         // console.log("PubSubTopicAndSubscribers: haveIncomingDumpState: all replies received. Accumulated dump state: ", this.accumulatedDumpState)
    //         console.log("We have a whole dump\n" + this.accumulatedDumpState.join("\n"))
    //     }
    // }

    // We're kinda just glomming event handling into this while hoping it doesn't get too messy.
    // We only want to support the pubsub so it may work.

    ourWindowEventListenerHandler = (event: MessageEvent) => {

        tracebridgemesses('PubSubBridge ourEventHandler from ', event.source, " to ", event.origin);
        // If I'm on the mainland (and this happens to spaces and avatars when they are run sseparately)
        // then I don't want to process those messages. 

        const messageCameFromThisWindows = event.source === window;

        if ((!this.onAnIsland) && messageCameFromThisWindows) {
            return; // this would be a case of the mainland sending a message to itself. 
        }

        const data = event.data;
        const msg = messes.ensureMessageBaseClass(data)
        if (msg === null) {
            // console.warn("PubSubTopicAndSubscribers: ourEventHandler: event.data is not a valid MessageBaseClass: ", data)
            return;
        }
        // console.log("PubSubTopicAndSubscribers: ourEventHandler: event: ", event)

        // enough with the precautions already. Just work the commands.
        // There's only like 3, or 5 ?? 
        // this is the first postMessage command we handle, which is the DumpStateRequest.

        if (msg.cmd === "DumpStateRequest") {
            this.DumpState(() => {
                console.log("------End of dump: ", this.debugname)
                //const isLandDump = this.accumulatedDumpState
                const isLandName = this.debugname
                // const reply: messes.MessageDumpReplyClass = {
                //     to: msg.from,
                //     from: "PubSubTopicAndSubscribers",
                //     cmd: "DumpStateReply",
                //     magic: messes.magicMessageNumber,
                //     nameOfReporter: isLandName,
                //     dumpData: isLandDump
                // };
                // // back to mainland.
                // window.parent.postMessage(reply, "*"); // example reply.
            });
            return;
        }

        // we're not doing replies right now.  We just want to see the state of the pubsub.
        // if (msg.cmd === "DumpStateReply") {
        //     this.haveIncomingDumpState(msg as messes.MessageDumpReplyClass)
        //     return;
        // }

        if (msg.cmd === "execute_theSubscribe_from_mainland") {
            console.log("execute_theSubscribe_from_mainland received: ", msg);
            // One presumes we're on an island.
            if (!this.onAnIsland) {
                console.warn("execute_theSubscribe_from_mainland received but we are not on an island.",
                    this.debugname, this.getOurCleanMasterDomainName);
            }
            // this is what the msg is:
            // we send it to the island      --       I'm not sure we need ALL this stuff. 
            //   const submsg: messes.MessageSubscribeClass = {
            //     to: domain name of the island here, // the mainland
            //     from: "mainland_" + this.debugname,
            //     key: key, // channel name
            //     who: who,
            //     cmd: "execute_theSubscribe",
            //     magic: messes.magicMessageNumber,
            // }
            // const 

            const submsg = msg as messes.MessageSubscribeClass;

            // now, over here on the island when a publish happens 
            this.subscribe(submsg.key, submsg.who, (status: any, err: Error, info?: string) => {

                if (err) {
                    this.publish(submsg.key, { status: "error", error: err.message });
                    console.error("Subscription error: ", err);
                } else {
                    this.publish(submsg.key, { status: "success", info: info });
                    console.log("Subscription status: ", status, "Info: ", info);
                }

            }, "cb does publish to local channel")

            return;
        }

        if (msg.cmd === "execute_theSubscribe_from_island") {
            console.log("execute_theSubscribe_from_island received: ", msg);
            // One presumes we're on the mainland.
            // this is what the msg is:
            // we send it to the island 
            //   const submsg: messes.MessageSubscribeClass = {
            //     to: "mainland", // the mainland
            //     from: "island_" + this.debugname,
            //     key: key, // channel name
            //     who: who,
            //     cmd: "execute_theSubscribe",
            //     magic: messes.magicMessageNumber,
            // }
            // const 

            const submsg = msg as messes.MessageSubscribeClass;

            this.subscribe(submsg.key, submsg.who, (status: any, err: Error, info?: string) => {

                if (err) {
                    this.publish(submsg.key, { status: "error", error: err.message });
                    console.error("Subscription error: ", err);
                } else {
                    this.publish(submsg.key, { status: "success", info: info });
                    console.log("Subscription status: ", status, "Info: ", info);
                }

            }, "cb does publish to local channel")

            return;
        }

        if (msg.cmd === "execute_UnSubscribe_everywhere") {
            console.log("execute_UnSubscribe_everywhere received: ", msg);

            const submsg = msg as messes.MessageSubscribeClass;

            this.unsubscribe(submsg.key, submsg.who)
        }

        this.morecommands(msg, event);
    }

    morecommands(msg: MessageBaseClass, event: MessageEvent) {
        // is that it? There's only supposed to be a finite number of these bridge commands to handle.
    }
}

// To see where a window.onmessage event came from, check event.source. 
// Compare event.source to window.parent for a parent frame, 
// or check window.frames and event.source === frameWindow for an iframe. 
// Always verify event.origin to make sure the sender is trusted.
// Check the Source PropertyUse event.source to see the exact window object that sent the message.
// Compare event.source to window.parent to see if it came from the parent window.
// Loop through window.frames or check specific iframe content window references to see if it came from a child iframe.

// not out here.
async function XXXasyncSpamAllTheIslands() {
    // I have no idea. I'm just going to wait 5 sec and see what comes back.
    const DumpRequest: messes.MessageBaseClass = {
        to: "all",
        from: "PubSubTopicAndSubscribers",
        cmd: "DumpState",
        magic: messes.magicMessageNumber
    }
    //   window.contentWindow.postMessage(DumpRequest, "*");
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
