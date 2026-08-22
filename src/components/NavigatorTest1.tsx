import { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import React from 'react';

import { DefaultCameraPosition } from '../components/AppCanvas'


// import { FlatCompass } from './flatCompass';
// import { flatCompass } from './FlatCompass';


// Define the type for the camera reference
// this gets shared around.
export type ControlCameraRef = {
    moveForward: () => void;
    moveBackward: () => void;
    moveUp: () => void;
    moveDown: () => void;
    turnLeft: () => void;
    turnRight: () => void;
    skateLeft: () => void;
    skateRight: () => void;
    birdsEye: () => void;
    home: () => void;
    lookDown: () => void;
    lookUp: () => void;

    changeCount: number; // property to track changes for compass angle updates
    compassAngle: number; // optional property to store the current compass angle};
}

interface NavigationControlsProps {
    cameraRef: React.RefObject<ControlCameraRef | null>;
    // compassAngle: number;
    // aCamera : THREE.Camera
    // camera : THREE.Camera
}

let previousChangeCount = -99;

// UI Overlay Component with Vertical Controls
// goes in the 2d
export function NavigationControls1(props: NavigationControlsProps) {

    const styles: React.CSSProperties = { padding: '8px 12px', cursor: 'pointer', fontWeight: 'bold' };

    // state for compass angle
    const [compassAngle, setCompassAngle] = useState(99999);

    useEffect(() => {
        // I'm sad this doesn't trigger )-: Like only the first time.
        if (props.cameraRef.current && props.cameraRef.current.changeCount !== previousChangeCount) {
            previousChangeCount = props.cameraRef.current.changeCount;
            console.log("NavigationControls1 updating compass angle ", props.cameraRef.current.compassAngle);
            setCompassAngle(props.cameraRef.current.compassAngle);
        }
    }, [props.cameraRef.current?.changeCount]);

    const [seconds, setSeconds] = useState(10);
    const [isActive, setIsActive] = useState(true);

    useEffect(() => {
        let intervalId: NodeJS.Timeout | undefined;
        // Only set up the timer if it is active and has time remaining
        if (isActive && seconds > 0) {
            intervalId = setInterval(() => {
                if (props.cameraRef.current && props.cameraRef.current.changeCount !== previousChangeCount) {
                    previousChangeCount = props.cameraRef.current.changeCount;
                    setCompassAngle(props.cameraRef.current.compassAngle);
                }
            }, 100);
        }
        // CRITICAL: Cleanup function clears the interval when the effect re-runs or unmounts
        return () => {
            if (intervalId !== undefined) {
                clearInterval(intervalId);
            }
        };
    }, [isActive, seconds]); // Dependencies trigger the effect to update correctly

    // what is the height og thus critter? 

    // <div style={{ position: 'absolute', 
    //             bottom: '-120px', left: '20px', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '8px' }}>

    return (
        <>
            <div style={{ position: 'relative', 
                            left: '0px', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '8px' }}>

                {/* <div style={{ color: '#fff', backgroundColor: 'rgba(0,0,0,0.6)', padding: '6px', borderRadius: '4px', fontSize: '12px' }}>
                ⌨️ WASD / Arrows = Move | Space = Up | Shift = Down
            </div> */}

                <div style={{ display: 'flex', gap: '4px' }}>
                    <button style={styles} onClick={() => props.cameraRef.current?.moveForward()}>Go ( W/↑)</button>
                    <button style={styles} onClick={() => props.cameraRef.current?.moveBackward()}>Back (S/↓)</button>

                    <button style={styles} onClick={() => props.cameraRef.current?.turnLeft()}>↺ (←)</button>
                    <button style={styles} onClick={() => props.cameraRef.current?.turnRight()}>↻ (→)</button>

                    <button style={styles} onClick={() => props.cameraRef.current?.skateLeft()}>Skate Left (A)</button>
                    <button style={styles} onClick={() => props.cameraRef.current?.skateRight()}>Skate Right (D)</button>

                    <button style={styles} onClick={() => props.cameraRef.current?.moveUp()}>Up (E)</button>
                    <button style={styles} onClick={() => props.cameraRef.current?.moveDown()}>Down (C)</button>
                    <button style={styles} onClick={() => props.cameraRef.current?.lookUp()}>Look Up (Q)</button>
                    <button style={styles} onClick={() => props.cameraRef.current?.lookDown()}>Look Down (Z)</button>
                    <button style={styles} onClick={() => props.cameraRef.current?.birdsEye()}>Birds eye (B)</button>
                    <button style={styles} onClick={() => props.cameraRef.current?.home()}>Home (H)</button>
                </div>
            </div>
            {/* <div style={{ transform: 'scale(0.25)', position: 'absolute', top: '10px', right: '10px' }}>
                <flatCompass rotationAngle={compassAngle} />
            </div> */}
        </>
    );
}

interface NavigationCameraControlsProps {
    cameraRef: React.RefObject<ControlCameraRef | null>;
    // stateRef: React.RefObject<HTMLCanvasElement | null>;
    // camera : THREE.Camera
}

// Scene Camera Controller with Keyboard Listeners
// this goes in the canvas, and directly manipulates the camera position and rotation based on the API defined in ControlCameraRef. 
// It also listens for keyboard events to trigger those actions. 
// The NavigationControls1 component is just a UI overlay that calls these actions when buttons are clicked, but the actual camera movement logic is handled here in NavigationCamera.
export function NavigationCamera(props: NavigationCameraControlsProps) {
    // Target states for fluid camera physics
    // THIS is actually where the default camera position is set.
    const targetPosition = useRef(DefaultCameraPosition.clone());
    const targetRotationY = useRef(0);
    const targetRotationX = useRef(0);

    // Distance constants
    const moveDistance = 1;
    const turnAngle = Math.PI / 8; // 22.5-degree turns

    // Define API actions
    const actions: ControlCameraRef = {

        changeCount: 0,
        compassAngle: 0,

        moveForward: () => {
            const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), targetRotationY.current);
            targetPosition.current.addScaledVector(forward, moveDistance);
        },
        moveBackward: () => {
            const backward = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), targetRotationY.current);
            targetPosition.current.addScaledVector(backward, moveDistance);
        },
        moveUp: () => {
            targetPosition.current.y += moveDistance;
        },
        moveDown: () => {
            targetPosition.current.y -= moveDistance;
        },
        turnLeft: () => {
            targetRotationY.current += turnAngle;
            actions.changeCount += 1;
        },
        turnRight: () => {
            targetRotationY.current -= turnAngle;
            actions.changeCount += 1;
        },
        skateLeft: () => {
            const left = new THREE.Vector3(-1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), targetRotationY.current);
            targetPosition.current.addScaledVector(left, moveDistance);
        },
        skateRight: () => {
            const right = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), targetRotationY.current);
            targetPosition.current.addScaledVector(right, moveDistance);
        },

        birdsEye: () => {
            targetPosition.current.set(0, 100, 0);
            targetRotationY.current = 0;
            targetRotationX.current = -Math.PI / 2 * .75;
            // look down at the origin
            // This will be handled in the useFrame interpolation to smoothly transition to the new position and rotation 
            actions.changeCount += 1;
        },
        home: () => {
            targetPosition.current = DefaultCameraPosition.clone();
            targetRotationY.current = 0;
            targetRotationX.current = 0
            actions.changeCount += 1;
        }

        ,
        lookDown: () => { // almost all the way up.
            if (targetRotationX.current > -.85 * Math.PI / 2) {
                targetRotationX.current -= turnAngle;
            }
            actions.changeCount += 1;
        },
        lookUp: () => { // almost all the way down.
            if (targetRotationX.current < .85 * Math.PI / 2) {
                targetRotationX.current += turnAngle;
            }
            actions.changeCount += 1;
        },
    };

    // let previousChangeCount = -2;

    // const camera = useThree(state => state.camera)
    // function calculateCompassAngle() {

    //     if (actions.changeCount !== previousChangeCount) {

    //         previousChangeCount = actions.changeCount;

    //         const v = new THREE.Vector3();
    //         const camDir = camera.getWorldDirection(v);

    //         // Calculate the horizontal angle (azimuth) relative to the Z-axis
    //         const angle = Math.atan2(camDir.z, camDir.x);

    //         actions.compassAngle = angle;
    //     }
    // }

    // Expose methods to interface
    useEffect(() => {
        if (props.cameraRef) {
            (props.cameraRef as React.MutableRefObject<ControlCameraRef | null>).current = actions;
        }
    }, [actions, props.cameraRef]);

    // Bind key events directly to the actions
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            switch (e.key) {
                case 'w': case 'W':
                    actions.moveForward(); break;
                case 'ArrowUp':
                     actions.moveForward(); break;
                     e.preventDefault();

                case 's': case 'S':
                    actions.moveBackward(); break;
                case 'ArrowDown':
                    actions.moveBackward(); break;
                    e.preventDefault();

                case 'ArrowLeft':
                    actions.turnLeft(); break;
                    e.preventDefault();
                case 'ArrowRight':
                    actions.turnRight(); break;
                    e.preventDefault();

                case 'a': case 'A':
                    actions.skateLeft(); break;
                case 'd': case 'D':
                    actions.skateRight(); break;

                case 'b': case 'B':
                    actions.birdsEye(); break;
                case 'h': case 'H':
                    actions.home(); break;
                case 'q': case 'Q':
                    actions.lookUp(); break;
                case 'z': case 'Z':
                    actions.lookDown(); break;
                // case ' ':
                    // good lord. This is shit is 3 hours of my life I'll never get back
                    // e.preventDefault(); // Stop page scrolling
                    // It meant I couldn't make spaces in an input dialog.
                    // total garbage. 
                //    actions.moveUp(); break;
                case 'E': case 'e':
                    actions.moveUp(); break;
                // absolutely not case 'Shift/': 
                case 'C': case 'c':
                    actions.moveDown(); break;
            }
        };

        // We STILL need to unhook this addEventListener when we're not using it. damn. How? 

        window.addEventListener('keydown', handleKeyDown);
        // console.log("NavigationCamera installation: added keydown listener");

        return () => {
            // how do we make THIS happen so that the dialog will work? Just don't make the main canvas!!! 
            console.log("NavigationCamera cleanup: removing keydown listener");
            window.removeEventListener('keydown', handleKeyDown);
        }
    }, []);

    // Frame loop interpolation
    useFrame((state) => {
        const camera = state.camera;
        state.camera.position.lerp(targetPosition.current, 0.1);

        camera.rotation.order = 'YXZ'; // vitally important. Otherwise the rotations will be applied in the wrong order and you'll get gimbal lock and other weirdness.
        
        state.camera.rotation.y = THREE.MathUtils.lerp(state.camera.rotation.y, targetRotationY.current, 0.1);
        state.camera.rotation.x = THREE.MathUtils.lerp(state.camera.rotation.x, targetRotationX.current, 0.1);

        //calculateCompassAngle()
    });

    return null;
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
