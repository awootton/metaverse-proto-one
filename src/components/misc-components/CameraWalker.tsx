import React from 'react';

import { useRef, useEffect, useState } from "react";
import { Box } from "@react-three/drei"

import { useLoader, useFrame, useThree } from "@react-three/fiber"

// import { TextureLoader, BackSide } from "three"
import * as THREE from "three"
import { PointerLockControls } from "@react-three/drei";

// and old nav thing

export const CameraWalker: React.FC = () => {

    const camera = useThree(state => state.camera) //cameraRef.current;

    const [speed, setSpeed] = useState(0.1)
    const [faster, setFaster] = useState(false)
    const [faster2, setFaster2] = useState(false)
    const [direction, setDirection] = useState(new THREE.Vector3())

    useEffect(() => {

        console.log('CameraWalker useEffect')

        const handleKeyDown = (event: any) => {
            let newDir = new THREE.Vector3()
            newDir.x = direction.x
            newDir.z = direction.z
            let key = event.key
            let lower = key.toLowerCase()
            const shifted = event.shiftKey
            if (shifted) {
                setFaster(true)
            } else {
                setFaster(false)
            }
            // is control pressed? if so, we want to move faster for 
            const ctrl = event.ctrlKey
            setFaster2(ctrl)
            switch (lower) {
                case 'w':
                    //camera.position.z -= speed;
                    newDir.z = -1
                    break;
                case 's':
                    newDir.z = +1
                    break;
                case 'a':
                    newDir.x = -1
                    break;
                case 'd':
                    newDir.x = +1
                    break;
                case 'z':
                    newDir.y = -1
                    break;
                case 'q':
                    newDir.y = +1
                    break;
                case 'b': /// birds eye view
                    camera.position.y = 200
                    camera.rotation.x = Math.PI / 2
                    camera.lookAt(0, 0, 0)
                    break;
                // camera.position.x += speed;
                case 'r': // r to reset camera
                    camera.position.x = -10
                    camera.position.y = 1.75
                    camera.position.z = 0
                    camera.rotation.set(0, 0, 0)
                    camera.lookAt(0, 0, 0)
                    newDir.set(0, 0, 0)
                    break;
            }
            setDirection(newDir)
        }
        window.addEventListener('keydown', handleKeyDown);
    }, []);

    //const incdummy = new THREE.Quaternion()

    useFrame((delta) => {

        if (camera.position.y <= 0) {
            camera.position.y = 1.75
        }

        // console.log('CameraWalker ',delta)
        if (direction.x !== 0 || direction.y !== 0 || direction.z !== 0) {
            // const wdir = camera.getWorldDirection(new THREE.Vector3())
            // console.log('CameraWalker useFrame', wdir, direction)
            const incdummy = new THREE.Quaternion()
            let increment = camera.getWorldQuaternion(incdummy)
            let dd = direction.applyQuaternion(increment)
            // console.log('CameraWalker pointing', dd)
            let s = speed
            let tall = camera.position.y

            if (faster) {
                s *= 4
                tall *= 4
            } else if (faster2) {
                s *= 8
                tall *= 8
            }

            camera.position.add(dd.multiplyScalar(s))
            camera.position.y = tall // how tall the avatar is.
        }
    });

    return (
        <>
            <PointerLockControls />
        </>
    )
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

