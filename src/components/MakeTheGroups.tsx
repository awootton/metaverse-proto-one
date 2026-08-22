
import * as THREE from 'three';

// what does useMemo do?
import React, { Suspense, useRef, useState, useEffect, SetStateAction } from 'react';
import { useFrame } from '@react-three/fiber';
import * as oct from '../knotfree-ts-lib/3d/Dns8Tree';

import { mainpubsub } from '../App';
// import * as pubsub from "../knotfree-ts-lib/avatars/PubSubTopicAndSubscribers"
import { AuxGroupRender } from './AuxGroupRenderer';



export type MaketheGroupsProps = {
    worldName: string;
}

export function MaketheGroups(props: MaketheGroupsProps) {


    // the last batch of leaves to render were processed into a list of groups.
    // These are their keys. They may or may not have changed.
    // They are ALSO the base for the URL's of the iFrames.
    const [groupKeysToRender, SetGroupKeysToRender] = useState([] as string[]); // this is the list of keys for the BatchInfo in the map. We will use this to render the iFrames.`

    // useEffect to subscribe to the pubsub topic "NewGroupKeys" and then render the iFrames for each of them. 
    // This is a sub for the whole batch. No individual items.
    useEffect(() => {
        const subscription = mainpubsub.subscribe("NewGroupKeys", "MaketheGroups", (groupKeys: string[]) => {

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
        },"Changes the GroupKeys");
        return () => { // "MakeListOfIFrames")
            mainpubsub.unsubscribe("NewGroupKeys", "MaketheGroups")
        }
    }); // run every time, not just once. 
    // We want to subscribe every time the component renders so that the callback has the LATEST state. EVERY TIME.

    // DidKeysChange checks if the keys changed by sorting them by name
    // and then just comparing the names. If they are the same then we can just go home.
    // The beauty part is that we don't even have to sort the previous list
    // because we already sorted that list before we publish it. So we can just compare the names in order.
    // Thanks CP for writing the fluffiest possible version of this possible. lol.
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

    function renderGroups() {

        let totalCubes = 0;
        // is the aux leaf in the list? twice?
        for (const key of groupKeysToRender) {
            const aux = oct.LookupAuxLeafStatus(key);
            if (aux) {
                totalCubes += aux.leaves.length;
            } else {
                console.warn("MakeTheGroups: No aux for key: ", key, " groupKeysToRender: ", groupKeysToRender)
            }
        }
        // console.log("MakeTheGroups: Rendering groups. Total cubes to render: ", groupKeysToRender.length, totalCubes)

        const groups = [];
        for (const key of groupKeysToRender) {
            const aux = oct.LookupAuxLeafStatus(key);
            if (!aux) {
                console.warn("MakeTheGroups: No aux for key: ", key, " groupKeysToRender: ", groupKeysToRender)
                continue;
            }
            // we have the aux and the name. We can make the props for the ThingWithAux component.
            // it might be a group of one cube or a group of hundreds, making a road.
            let newElement = (
                <AuxGroupRender
                    key={aux.wholeMaster}
                    worldName={props.worldName}
                    aux={aux}
                />
            )

            groups.push(newElement);
        }
        return groups;
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
        <>{renderGroups()}</>
    )

}


