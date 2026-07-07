import React, { useRef } from 'react';
import { FC, ReactElement, useState } from 'react'

import * as THREE from 'three';

import * as bvts from '../knotfree-ts-lib/3d/BuildVisibleTreeStatus';
import * as utils from '../knotfree-ts-lib/3d/utils';

// material ui
import {
    Dialog,
    Box,
    IconButton,
    DialogTitle,
    TextField,
    Button
} from '@mui/material'
import { Close } from '@mui/icons-material'

import { Tooltip } from 'react-tooltip'

import * as oct from '../knotfree-ts-lib/3d/UrlOctTree'

import * as pubsub from './PubSubTopicAndSubscribers'
import OrbitCanvas from './OrbitCanvas';
import { myMapCacheIntf } from '../knotfree-ts-lib/3d/CacheIntf';

import { WorldDisplayState } from './WorldDisplayState'


type Props = {
    open: boolean
    onClose: () => any
    title: string
    onConfirm: () => any
    // box: oct.Cube
    // no, this was confusing and error prone. spaces: string // comma delimited.
    // worldName: string

    shouldShowOrbitalCanvasDisplay: boolean

    worldDisplayState: WorldDisplayState,
    // lookingAtPosition: THREE.Vector3 // where the camera should be looking at when the dialog opens. This is where you were standing when you clicked the button to open the orbit canvas.
}

export const OrbitPropertyDialog: FC<Props> = (props: Props): React.ReactElement => {

    console.log("OrbitPropertyDialog starting with props ", props, " props as blue cubes: ", props.worldDisplayState.onlyShowOutlineBoxes)

    const [showingLeaves, setShowingLeaves] = useState([] as oct.TreeStatus[])

    const zzzzUESLESSstatePassedIN: WorldDisplayState = {
        ...props.worldDisplayState,
        previousCameraPosition: new THREE.Vector3(1e999, 0, 0),
        timeSinceLastCameraMovement: 0,
        theGlobalTree: new bvts.BuildVisibleTreeStatus(myMapCacheIntf), // we get a new one.
        uniqueId: utils.randomString(24),
        onlyShowOutlineBoxes: props.worldDisplayState.onlyShowOutlineBoxes,
        showOriginAxis: props.worldDisplayState.showOriginAxis
    }

    // this might make sense. Why? 
    // const ourState = useRef<WorldDisplayState>(statePassedIN)
    // props will do. 

    let demoProperties = localStorage.getItem("DemoProperties") || ""
    // for mere mortals to see space names.    
    // console.log("OrbitPropertyDialog demoProperties from localStorage: ", demoProperties)

    const [inputValue, setInputValue] = React.useState(demoProperties);

    const [demoPropertiesError, setDemoPropertiesError] = React.useState("")

    React.useEffect(() => {

        pubsub.subscribe("ShowingLeavesChanges", "OrbitalDialog" + props.worldDisplayState.uniqueId,
            (leaves: oct.TreeStatus[]) => {
                //  too long to log: console.log("OrbitalPropertyDialog got showingLeaves ", leaves)
                // trigger a re-render of the OrbitalCanvas with the new leaves.
                // they better freaking be actual TreeStatus objects or the OrbitalCanvas will crash.
                for (const leaf of leaves) {  // I guess this is pretty good.
                    if (!leaf.name || !leaf.groupId || !leaf.cube) {
                        console.error("OrbitalPropertyDialog got showingLeaves with invalid leaf ", leaf)
                    }
                }
                setShowingLeaves(leaves)
            })

        return () => {
            pubsub.unsubscribe("ShowingLeavesChanges", "OrbitalDialog" + props.worldDisplayState.uniqueId)
        }
    }, [showingLeaves])


    function checkForGoodParse(str: string): boolean {

        let isOk = false
        str = str.trim()
        if (str === "") {
            isOk = true
        } else {
            // is it a from to?
            const [fromToArray, fromToError] = oct.FromXToY(str)
            if (fromToError === null) {
                // console.log("FromXToY result: ", fromToArray)
                // localStorage.setItem("demoProperties", str)
                isOk = true
            } else {
                // everything is not from x to y
                const [spacesArray, error] = oct.ParseCubeList(str)
                if (error !== null) {
                    // console.error("Error parsing spaces: ", error)
                    // maybe we should clear the saved state if it doesn't parse?
                    // na just ignore it)
                    isOk = false
                } else {
                    // console.log("Parsed spaces: ", spacesArray)
                    // localStorage.setItem("demoProperties", str)
                    isOk = true
                }
            }
        }
        return isOk
    }

    // these don't propogate. They should cause a refresh. FIXME:
    function onClearClicked() {
        console.log("OrbitalPropertyDialog Clear clicked")
        setInputValue("")
        localStorage.setItem("DemoProperties", "")
        setDemoPropertiesError("")
        pubsub.publish("DemoPropertiesChanges", utils.randomString(24))
    }

    // these don't propogate. They should cause a refresh. FIXME:
    function onOkClicked() {
        // this is crazy
        // callMeBaby();
        const str = inputValue.trim()

        console.log("OrbitalPropertyDialog OK clicked, input value: ", str)
        // I'll set the saved state if it parses.
        const isGood = checkForGoodParse(str)
        if (isGood) {
            localStorage.setItem("DemoProperties", str)
            setDemoPropertiesError("")
        } else {
            setDemoPropertiesError("Input does not parse as a property address or from-to list.")
        }
        if (isGood) {
            console.log("OrbitalPropertyDialog OK clicked, PUBLISH final input value: ", str)
            pubsub.publish("DemoPropertiesChanges", utils.randomString(24))
        } else {
            setDemoPropertiesError("not an addresses or from-to list.")
        }
    }

    function inputSpacesTooltipText() {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <strong>This will save the entered 'spaces' aka 'properties'</strong>
                <span>They will be the green boxes in the scene.</span>
                <span>Clear the text and 'Add' to remove.</span>
            </div>
        )
    }

    function inputSpacesTooltipTextClear() {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <strong>This will clear the green boxes in the scene.</strong>
            </div>
        )
    }

    //  to load multiple spaces at once. For demo purposes you can also use the following sample 16 meter properties
    //  which are all located near the origin: testmain-3n0u4e4p,testmain-4n0u4e4p,testmain-5n0u4e4p

    const buttonStyles: React.CSSProperties = { padding: '2px 2px', margin: '2px 2px', fontSize: '14px', cursor: 'pointer' };

    // can we center them on the camera or something?
    function setFromToAndClick(from: string, to: string) {
        const worldname = props.worldDisplayState.worldName
        const fromToString = `from ${worldname}-${from} to ${worldname}-${to}`
        // ix nay on the "and click". Just change the input form.
        setInputValue(fromToString);
        // onOkClicked()
    }

    function makeTheCanvas() {
        return (
            <div style={{
                width: '100%', height: '100%'
            }}>
                <OrbitCanvas
                    worldDisplayState={props.worldDisplayState}
                    showingLeaves={showingLeaves}
                    shouldShowOrbitalCanvasDisplay={props.shouldShowOrbitalCanvasDisplay} />
            </div>
        )
    }

    function makeTheError() {
        if (demoPropertiesError) {
            return (
                <div style={{ color: 'black', margin: '4px' }}>
                    {demoPropertiesError}
                </div>
            )
        } else {
            return null
        }
    }

    function pStyle() {
        return {
            margin: '2px 4px',
            fontSize: '16px',
            fontFamily: 'Inter, sans-serif'
        }
    }

    return (
        <>
            <div id="orbit-property-dialog"
                style={{
                    // position: 'absolute', does this do anything?
                    top: 0, left: 0, width: '100%', height: '100%'
                }}>

                <Dialog open={props.open} fullWidth maxWidth="lg"
                    fullScreen
                    onClose={props.onClose}
                >
                    <DialogTitle>{props.title}</DialogTitle>
                    <Box sx={{ position: 'absolute', top: 4, right: 4 }}>
                        <IconButton onClick={props.onClose} size="small">
                            <Close />
                        </IconButton>
                    </Box>

                    <div style={{ padding: '4px', fontSize: '18px', color: 'black' }}>
                        <p style={pStyle()} >
                            Drag with mouse to orbit, scroll to zoom, right click to pan.</p>
                        <p style={pStyle()}>
                            The input box is where you would enter a property address to load and display in the 3D view (in green).</p>
                        <p style={pStyle()}>
                            Example: testmain-3n0u3e3p is an 8 meter cube 3 north and 3 east, 0 up. </p>
                        {/* <p style={pStyle()}>
                            The first part is the world name. The 3p means a 3 power cube or 8 meters because 2^3 is 8.</p>
                        <p style={pStyle()}>
                            The rest is the east/west, up/down and north south count of 3p cubes from the origin.</p>
                        <p style={pStyle()}>
                            We say this is a 3p space 3 north and 3 east. That's it's address. Someday you can send mail there. 😊</p> */}
                        <p style={pStyle()}>
                            Or, you can use "from ... to ..." format to load a range of spaces. eg. "from testmain-3n0u3e3p to testmain-3n0u3w3p"</p>
                    </div>
                    <div style={{ display: 'flex', gap: '4px', margin: '2px 4px' }}>
                        <p style={pStyle()}>These will show MANY free properties;</p>
                        <button style={buttonStyles} onClick={() => setFromToAndClick("32n0u32e2p", "32s0u32w2p")}>4 by 4 meter spaces</button>
                        <button style={buttonStyles} onClick={() => setFromToAndClick("16n0u16e3p", "16s0u16w3p")}>8 by 8 meter spaces</button>
                        <button style={buttonStyles} onClick={() => setFromToAndClick("8n0u8e4p", "8s0u8w4p")}>16 by 16 meter spaces</button>
                        <button style={buttonStyles} onClick={() => setFromToAndClick("8n0u8e5p", "8s0u8w5p")}>32 by 32 meter spaces</button>
                    </div>

                    <Box sx={{ padding: 2 }}
                        style={{ margin: '2px 0' }}
                    >
                        {makeTheError()}
                        <span style={{ display: 'flex', gap: '4px', alignItems: 'center', fontSize: '15px', margin: '2px 0' }}>

                            <TextField
                                style={{ margin: '2px 0' }}
                                label="Add property address here"
                                value={inputValue}
                                // onChange={(e) => localDemoPropertiesLastTyped.current = e.target.value}
                                // where do I put this? 
                                // I should leave it in the element and then search by ID.
                                // even though they say to not do that.
                                onChange={(e) => {
                                    console.log("Input changed, new value: ", e.target.value)
                                    setInputValue(e.target.value);
                                    const str = e.target.value.trim()
                                    const isGood = checkForGoodParse(str)
                                    if (isGood) {
                                        setDemoPropertiesError("")
                                    } else {
                                        setDemoPropertiesError("Input does not parse as a property address or from-to list.")
                                    }
                                }}
                                // fullWidth
                                size="medium"
                                margin="normal"
                                fullWidth
                            />
                            <div
                                style={{ color: 'black', margin: '2px', fontSize: '12px' }}
                            >
                                <Button variant="contained" onClick={onOkClicked}
                                    sx={{ marginTop: 2, marginBottom: 2 }}
                                    style={{ color: 'white', margin: '2px', fontSize: '12px', backgroundColor: 'lightblue', padding: '2px 2px', cursor: 'pointer' }}
                                    data-tooltip-id="input-spaces-tooltip"
                                >
                                    Set
                                </Button>
                                <Button variant="contained" onClick={onClearClicked}
                                    sx={{ marginTop: 2, marginBottom: 2 }}
                                    style={{ color: 'white', margin: '2px', fontSize: '12px', backgroundColor: 'lightblue', padding: '2px 2px', cursor: 'pointer' }}
                                    data-tooltip-id="input-spaces-tooltip-clear"
                                >
                                    Clear
                                </Button>


                            </div>
                            <Tooltip id="input-spaces-tooltip" place="bottom" >
                                {inputSpacesTooltipText()}
                            </Tooltip>
                            <Tooltip id="input-spaces-tooltip-clear" place="bottom" >
                                {inputSpacesTooltipTextClear()}
                            </Tooltip>

                        </span>
                    </Box>

                    {makeTheCanvas()}

                </Dialog>

            </div >

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
