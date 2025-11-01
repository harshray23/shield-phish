
'use client';

import React, { useState, useEffect, useRef } from 'react';
import Lottie, { LottieRefCurrentProps } from 'lottie-react';

export function InteractiveGlobe() {
  const [animationData, setAnimationData] = useState(null);
  const lottieRef = useRef<LottieRefCurrentProps>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/Globe.json')
      .then((response) => response.json())
      .then((data) => {
        setAnimationData(data);
      })
      .catch((error) => console.error('Error loading animation:', error));
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !lottieRef.current) return;

  }, [animationData]);

  if (!animationData) {
    return null; 
  }

  return (
    <div ref={containerRef} className="w-full h-full transition-transform duration-300 ease-out" style={{ transformStyle: "preserve-3d"}}>
        <div className="absolute inset-0 rounded-full transition-all duration-300 border-2 border-transparent group-hover:border-primary/50 group-hover:shadow-[0_0_40px_10px] group-hover:shadow-primary/20 group-hover:backdrop-blur-sm"></div>
        <div className="scale-[1.5]">
            <Lottie lottieRef={lottieRef} animationData={animationData} loop={true} />
        </div>
    </div>
  );
}
