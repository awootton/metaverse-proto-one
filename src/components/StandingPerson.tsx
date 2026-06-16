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
                <meshBasicMaterial map={texture} />
            </mesh>
        </Billboard >
    );
}
