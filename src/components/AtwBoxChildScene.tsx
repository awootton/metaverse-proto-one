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

