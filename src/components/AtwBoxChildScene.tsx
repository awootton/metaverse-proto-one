import React from 'react';
'use client';

// not using this

// import { RotatingBox1, RotatingBox2 } from "./MetaMainContain"
import { useRef } from "react";
import { useFrame } from "@react-three/fiber"

// the child of a frame
// xx assign a myself to the document of the frame
// so the parent can find me
export const AtwBoxChildFrame: React.FC = () => {


  if (window.location.href.includes('domain=two')) {
    return (<>
      <RotatingBox2 ></RotatingBox2>
    </>)
  }
  // else if (window.location.href.includes('domain=one')) 
  return (<>
    <RotatingBox1 ></RotatingBox1>
  </>)
}

export function RotatingBox1(props: {}) {

  const ref = useRef<THREE.Mesh>(null!)
  useFrame((state, delta) => {

    ref.current.rotation.x += 0.04
   
  })
  return (
    <mesh ref={ref} {...props} >
      <boxGeometry args={[1.5, 0.2, 1]} />
      <meshStandardMaterial color="red" />
    </mesh>
  )
}

export function RotatingBox2(props: {}) {

  const ref = useRef<THREE.Mesh>(null!)
  useFrame((state, delta) =>  {

    ref.current.rotation.x += 0.04

    ref.current.position.x = 1 
   
  })
  return (
    <mesh ref={ref} {...props} >
      <boxGeometry args={[1.5, 0.2, 1]} />
      <meshStandardMaterial color="green" />
    </mesh>
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

