// FlatCompass.tsx

import React, { useState, useRef } from 'react';


// discontinued.

interface FlatCompassProps {
  rotationAngle: number;  
}

// This component renders a flat compass UI element that shows the camera's orientation in the 3D scene.
// 1. Separate UI Component for the 2D Flat Compass
export const XFlatCompass = ( props : FlatCompassProps) => {

  // console.log('FlatCompass render with rotationAngle:', props.rotationAngle);
  return (
    <div
      style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        width: '100px',
        height: '100px',
        borderRadius: '50%',
        background: 'rgba(255, 255, 255, 0.9)',
        border: '3px solid #333',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none', // Allows clicking through the UI to the canvas
        zIndex: 10,
      }}
    >
      {/* Cardinal Labels */}
      <span style={{ position: 'absolute', top: '4px', fontSize: '12px', fontWeight: 'bold', color: 'red' }}>N</span>
      <span style={{ position: 'absolute', bottom: '4px', fontSize: '12px', color: '#666' }}>S</span>
      <span style={{ position: 'absolute', right: '6px', fontSize: '12px', color: '#666' }}>E</span>
      <span style={{ position: 'absolute', left: '6px', fontSize: '12px', color: '#666' }}>W</span>

      {/* Rotating Needle */}
      <div
        style={{
          width: '6px',
          height: '70px',
          position: 'relative',
          // Apply the rotation angle dynamically
          transform: `rotate(${props.rotationAngle ?? 0}rad)`,
          transition: 'transform 0.5s ease-out', // Smooths out jerky movements
        }}
      >
        {/* North Pointer (Red) */}
        <div style={{ width: '0', height: '0', borderLeft: '3px solid transparent', borderRight: '3px solid transparent', borderBottom: '35px solid red' }} />
        {/* South Pointer (Dark Gray) */}
        <div style={{ width: '0', height: '0', borderLeft: '3px solid transparent', borderRight: '3px solid transparent', borderTop: '35px solid #333' }} />
      </div>
    </div>
  );
};


