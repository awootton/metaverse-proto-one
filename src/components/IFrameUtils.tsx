

import React, { useEffect } from 'react';
'use client';

import * as pubsub from './PubSubSimple';


// garbage 

const string2ElementMap = new Map<string, HTMLIFrameElement>()

export const SetMap = (name: string, iframe: HTMLIFrameElement) => {
    string2ElementMap.set(name, iframe)
    console.log("setMap ", name, iframe)
    const theNewList = string2ElementMap.entries()
    console.log("SetMap called, new list of entries ", theNewList)
    pubsub.publish("frameMapChange", theNewList)
}
export const GetMap = (name: string): HTMLIFrameElement | null => {
    let iframe = string2ElementMap.get(name)
    if (iframe == null) {
        console.log("getMap ", name, " not found")
        return null!
    } else {
        console.log("getMap ", name, iframe)
    }
    return iframe
}
export const GetMapKeys = (): string[] => {
    let keys = string2ElementMap.keys()
    let keyArray = Array.from(keys)
    console.log("getMapKeys ", keyArray)
    return keyArray
}

export const GetMapEntries = (): Array<HTMLIFrameElement> => {
    let vals = string2ElementMap.values()
    let valArray = Array.from(vals)
    console.log("getMap values ", valArray)
    return valArray
}

export type Params = {
    name: string
    target: string
}

export type LoadedMessageFromChild = {
    name: string
    type: string // is LoadedMessageFromChild
    message: string
}

// a 2d component.
// the 3d happens elsewhere
export const MyIframe = (params: Params) => {

    // const ref = useRef(null!) // what is this good for? 

    // const [unique, setUnique] = React.useState(Math.random())

    function loaded() { // fr: HTMLIFrameElement

        let fr = document.getElementById(params.name) as HTMLIFrameElement
        console.log("iframe loaded ", fr, typeof fr)

        SetMap(params.name, fr)

        let myMessage: LoadedMessageFromChild = {
            name: params.name,
            type: "LoadedMessageFromChild",
            message: "hello from child"
        }
        let iframeWin = fr.contentWindow
        if (iframeWin == null) {
            console.log("iframe loaded contentWindow is null")
        } else {
            // should we add the iframe target here? 
            iframeWin.postMessage(myMessage, "*") // '*' is not secure, but I don't care
        }
    }

    return (
        <>
            <iframe src={params.target} id={params.name} width={100} height={100}
                onLoad={loaded} sandbox="allow-scripts allow-popups" ></iframe>
        </>
    )

}
