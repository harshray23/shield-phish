'use client';

import React, { useEffect } from 'react';

export function StarryNight() {
  useEffect(() => {
    const createStarryNight = () => {
      // Check if the container already exists to avoid duplication on HMR
      if (document.querySelector('.stars-layer')) {
        return;
      }
      
      const starsContainer = document.createElement('div');
      starsContainer.className = 'stars-layer';

      // Create 150 stars randomly positioned
      for (let i = 0; i < 150; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.animationDelay = Math.random() * 3 + 's';
        starsContainer.appendChild(star);
      }

      document.body.appendChild(starsContainer);
    };

    createStarryNight();

    // No cleanup function is needed if we check for existence,
    // as it will persist across navigation.
  }, []);

  return null; // This component does not render anything itself
}
