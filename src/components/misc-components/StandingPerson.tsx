import * as THREE from 'three';
import React from 'react';

import { useTexture } from '@react-three/drei';
import { Billboard, Image } from '@react-three/drei';


export default function StandingPerson(propes: { position: [number, number, number] }) {
    const texture = useTexture("/images/editedStandingWoman.png")
    return (
        < Billboard position={propes.position}
        >
            <mesh>
                <planeGeometry args={[.70, 2]} />
                <meshBasicMaterial map={texture}
                    transparent={true}      // Required for opacity/alpha channels
                    opacity={1.0}           // Adjust overall opacity if needed
                />
            </mesh>
        </Billboard >
    );
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

