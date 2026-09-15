
import React, { FC, ReactElement, useState } from 'react'

// material ui
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    IconButton,
} from '@mui/material';

import * as sub from "../../knotfree-ts-lib/avatars/PubSubSimple"

import { OrbitControls } from '@react-three/drei';
import { Canvas, useFrame, useLoader } from "@react-three/fiber";


import { Close } from '@mui/icons-material';

import TextField from '@mui/material/TextField';

import Switch from '@mui/material/Switch'
import { mainpubsub } from '../../App';
import { DrawDogComponent, ShibaCanvas } from './Shiba';
import { LetterText } from 'lucide-react';
import OriginAxisDisplay from '../OriginAxisDisplay';
import { NestedFlowerPots } from './MyCylinderScene';

type Props = {
    open: boolean
    onClose: () => any
    title: string
    body: string
    onConfirm: (str: string) => any
    label: string // the label of the text field
    default: string // default text in the input
    // inject?: React.ReactElement

    showOriginAxis: boolean
    toggleShowAxisAtOrigin: () => void
    onlyShowOutlineBoxes: boolean
    toggleOnlyShowOutlineBoxes: () => void

}

export const MiscInputDialog: FC<Props> = (props: Props): ReactElement => {

    let theTextTyped: string = ''

    function textClicked(e: React.ChangeEvent<HTMLInputElement>) {
        const str = e.currentTarget.value
        // console.log("MyInputDialogtextClicked", str)
        theTextTyped = str
    }

    function confirmMe() {
        props.onConfirm(theTextTyped)
    }
    //sx={{ position: 'absolute', top: 8, right: 8 }}
    //             <Box position="absolute" top={0} right={0}>


    // try to make download of pots by publub
    function OrderDownload() {
        // props.onConfirm(theTextTyped)
        sub.publish("downloadFlowerPotsDemo", "no-arg")
    }


    function pStyle() {
        return {
            margin: '2px 4px',
            fontSize: '16px',
            fontFamily: 'Inter, sans-serif'
        }
    }

    const [buttonList, SetButtonList] = React.useState<React.ReactElement[]>([])

    const [threeList, setThreeList] = React.useState<React.ReactElement[]>([])

    function MakeButtonList(a: string, action: () => void) {
        let list = []
        // an element
        const b = (<div><Button color="primary" variant="contained" onClick={action}>
            AboveTheDialog{a}
        </Button></div>
        )
        const newBu = buttonList.concat(b)
        SetButtonList(buttonList)
    }

    function Make3dList(element: React.ReactElement) {
        // an element
        const b = (<>
            {element}
        </>
        )
        const new3 = threeList.concat(b)
        setThreeList(new3)
    }


    React.useEffect(() => {
        // Example effect
        // add a button.
        MakeButtonList("1", () => console.log("Button 1 clicked"))
        Make3dList(<><DrawDogComponent cube={{ x: 0, y: -1, z: 0, p: 0, world: "testmain" }} /></>)

    }, []);

    // GLB to binary

    // we should make the blob and then send it elsewhere where someone else can try to convert it 
    // to a scene or something and 
    // draw it.


    // GLB to binary (saved to file?)  . 
    // Back to binary. 
    // Back to screen.
    // group to binary to (? transmitted) to screen.
    // group to screen 

    // group to blob
    //       blob to file.

    // group with animation to binary to screen. 

    // add a button that does something.
    // add the 3d the something makes.


    return (
        <>
            <Dialog open={props.open} maxWidth="sm" fullWidth
                onClose={props.onClose}
            >
                <DialogTitle>{props.title}</DialogTitle>
                <Box sx={{ position: 'absolute', top: 0, right: 0 }} >
                    <IconButton onClick={props.onClose} size="large">
                        <Close />
                    </IconButton>
                </Box>
                <DialogContent>
                    {/* <Typography>{props.body}</Typography> */}
                    <div className="likeTypography" style={pStyle()}>{props.body}</div>
                    <br />
                    <TextField
                        autoFocus
                        onChange={textClicked}
                        // id="outlined-helperText"
                        label={props.label}
                        defaultValue={props.default}
                        helperText=""
                        fullWidth
                    />
                </DialogContent>
                <DialogActions>

                    {/* <Button color="primary" variant="contained" onClick={props.onClose}>
                        Cancel
                    </Button> */}
                    <Button color="secondary" variant="contained" onClick={confirmMe}>
                        Confirm
                    </Button>

                    <>
                        <br />
                        <div>
                            <Switch checked={props.showOriginAxis} size="small" onClick={() => props.toggleShowAxisAtOrigin()} />Show the axis at the origin
                        </div>
                        <div>
                            <Switch checked={props.onlyShowOutlineBoxes} size="small" onClick={() => props.toggleOnlyShowOutlineBoxes()} />Show owned properties as blue cubes. See their addresses.
                        </div>

                    </>

                    <div>
                        <div>
                            <Button variant="outlined" size="small" onClick={() => DumpThePubSubState()} >Dump</Button>
                        </div>
                    </div>
                    <div>
                        {buttonList}
                    </div>

                    <div>
                        <Button color="secondary" variant="contained" onClick={OrderDownload}>
                            DownloadPots
                        </Button>
                    </div>


                </DialogActions>

                <div style={{ width: '100%', height: '400px' }}>
                    {/* <ShibaCanvas /> */}

                    <Canvas
                        camera={{ position: [0, 1.75, 4] }}>

                        {/* <ambientLight /> */}
                        <directionalLight
                            position={[3.3, 1.0, -4.4]}
                            intensity={Math.PI * 2}
                        />
                        <directionalLight
                            position={[-3.3, -1.0, 4.4]}
                            intensity={Math.PI * 1.0}
                        />

                        <OrbitControls />

                        <OriginAxisDisplay />

                        {/* One Meter Cube */}
                        {/* <DrawDogComponent cube={{ x: 0, y: 0, z: 0, p: 0, world: "testmain" }} /> */}

                        {threeList}

                        <group position={[2, 0, 0]}>
                            <NestedFlowerPots />
                        </group>

                        <group position={[2, 0, 0]}>
                            <NestedFslowerPots />
                        </group>

                    </Canvas>

                </div>

            </Dialog>

        </>
    );

};

function DumpThePubSubState() {
    //    const rows : string[]  =  mainpubsub.DumpState()
    //    console.log("DumpThePubSubState", rows)
    mainpubsub.DumpState((dump) => {
        console.log("DumpThePubSubState", dump)
    });
}

// Copyright 2021-2022 Alan Tracey Wootton
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
