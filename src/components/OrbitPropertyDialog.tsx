import React from 'react';
import { FC, ReactElement } from 'react'

import * as THREE from 'three';

import * as bvts from '../knotfree-ts-lib/3d/BuildVisibleTreeStatus';

// material ui
import {
    Dialog,
    Box,
    IconButton,
    Switch,
    DialogTitle,
    TextField,
    Button
} from '@mui/material'
import { Close } from '@mui/icons-material'

import { Tooltip } from 'react-tooltip'


import OrbitalCanvas from './OrbitCanvas'
import * as oct from '../knotfree-ts-lib/3d/UrlOctTree'

import * as ps4 from './PubSub4App'
import OrbitCanvas from './OrbitCanvas';
import { WorldDisplayState } from './WorldDisplayState';
import { myMapCacheIntf } from '../knotfree-ts-lib/3d/CacheIntf';
// import * as bvts from './knotfree-ts-lib/3d/BuildVisibleTreeStatus';


type Props = {
    open: boolean
    onClose: () => any
    title: string
    onConfirm: () => any
    // box: oct.Cube
    spaces: string // comma delimited.
    worldName: string

    /// state: WorldDisplayState
}

export const OrbitPropertyDialog: FC<Props> = (props: Props): React.ReactElement => {

    const state = {
        worldName: "testmain",
        previousCameraPosition: new THREE.Vector3(1e999, 0, 0),
        timeSinceLastCameraMovement: 0,
        theGlobalTree: new bvts.BuildVisibleTreeStatus(myMapCacheIntf)
    }

    const demoProperties = localStorage.getItem("demoProperties") // this is just for demo purposes, to show how you could save the entered properties for later use. In a real application, you would likely want to handle this differently, such as saving it to a database or using a state management solution.
    const [demoPropertiesState, setDemoPropertiesState] = React.useState(demoProperties || "")

    const [localDemoPropertiesState, setLocalDemoPropertiesState] = React.useState(demoProperties || "")

    console.log("OrbitPropertyDialog demoPropertiesState ", demoPropertiesState)

    function changeDemoProperties(newProperties: string) {
        localStorage.setItem("demoProperties", newProperties)
        setDemoPropertiesState(newProperties)
        setLocalDemoPropertiesState(newProperties)
    }

    React.useEffect(() => {
        console.log("OrbitPropertyDialog useEffect 1")
        ps4.subscribe("DemoPropertiesChanges", "OrbitPropertyDialog", (status: Object, err: Error) => {
            console.log("OrbitPropertyDialog got pubsub message", status, err)
            if (status && typeof status === "string") {
                changeDemoProperties(status as string)
            } else {
                // got funny object from pubsub. Expected a string.
                console.log("OrbitPropertyDialog got pubsub message but it's not a string", status)
                changeDemoProperties("") // and now it's off.
            }
        })
        return () => {
            ps4.unsubscribe("DemoPropertiesChanges", "OrbitPropertyDialog")
            console.log("OrbitPropertyDialog useEffect DemoPropertiesChanges cleanup")
        };
    }, [demoPropertiesState])


    // async function callMeBaby() {
    //     // see if we can run some of the reserve code here, to test it out.
    //     let tmp = await oct.PrepareToReservePropertyBatch([demoPropertiesState], oct.gCubeCache)
    //     console.log("PrepareToReservePropertyBatch result", tmp)
    //     if (tmp instanceof Error) {
    //         console.error("Error preparing to reserve property batch:", tmp)
    //         return
    //     }
    //     const reserveResult = tmp[0]

    //     console.log("the raw list", reserveResult.rawChains.map(chain => chain.map(cube => oct.cubeToUrlString(cube))))
    // }

    function onOkClicked() {
        // this is crazy
        // callMeBaby();
        console.log("OK clicked, input value: ", localDemoPropertiesState)

        if (localDemoPropertiesState.trim() === "") {
            localStorage.removeItem("demoProperties")
            ps4.publish("DemoPropertiesChanges", "")
            return
        }
        const [spacesArray, error] = oct.ParseCubeList(localDemoPropertiesState)
        if (error !== null) {
            return
        }
        ps4.publish("DemoPropertiesChanges", localDemoPropertiesState)
    }

    function inputSpacesTooltipText() {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <strong>This will save the entered 'spaces' aka 'properties'</strong>
                <span>They will be the green boxes in the scene.</span>
                <span>You can enter multiple comma delimited addresses to load multiple spaces at once.</span>
                <span>Clear the text and 'Add' to remove.</span>
            </div>
        )
    }
    //  to load multiple spaces at once. For demo purposes you can also use the following sample 16 meter properties
    //  which are all located near the origin: testmain-3n0u4e4p,testmain-4n0u4e4p,testmain-5n0u4e4p

    return (
        <>

            <Dialog open={props.open} fullWidth maxWidth="lg" fullScreen
                onClose={props.onClose}
            >
                <DialogTitle>{props.title}</DialogTitle>
                <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                    <IconButton onClick={props.onClose} size="small">
                        <Close />
                    </IconButton>
                </Box>
                <div style={{ padding: '4px', fontSize: '15px', color: 'black' }}>
                    Full Screen Dialog demo of orbiting a sample space aka 'cube'. Drag with mouse to orbit, scroll to zoom, right click to pan.
                    The input box is where you would enter a property address to load and display in the 3D view.
                    Example: testmain-3n0u3e3p is the 8 meter cube located 3*8 meters North and 3*8 meters South from the origin. (because 2^3 is 8)
                    Try it.
                </div>
                <Box sx={{ padding: 2 }}>
                    <span style={{ display: 'flex', gap: '4px', alignItems: 'center', fontSize: '15px' }}  >
                        <TextField
                            label="Add property address here"
                            value={localDemoPropertiesState}
                            // onChange={(e) => latestInputValue = e.target.value}
                            onChange={(e) => setLocalDemoPropertiesState(e.target.value)}
                            // fullWidth
                            size="medium"
                            margin="normal"
                            fullWidth
                        />
                        <Button variant="contained" onClick={onOkClicked} sx={{ marginTop: 2 }}
                            data-tooltip-id="input-spaces-tooltip"
                        >
                            Add
                        </Button>
                        <Tooltip id="input-spaces-tooltip" place="bottom" >
                            {inputSpacesTooltipText()}
                        </Tooltip>
                    </span>
                </Box>


                <OrbitCanvas spaces={demoPropertiesState}
                    state={state} />
            </Dialog>
        </>
    );

};

export default OrbitPropertyDialog;

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
