
import React, { useEffect, useRef } from 'react';

interface Point {
  x: number;
  y: number;
  size: number;
  opacity: number;
  originalSize: number;
  originalOpacity: number;
}

const InteractiveDotBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const points = useRef<Point[]>([]);
  const mousePosition = useRef({ x: 0, y: 0 });
  const animationFrameId = useRef<number>(0);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      generatePoints();
    };
    
    const generatePoints = () => {
      points.current = [];
      const density = Math.min(window.innerWidth, window.innerHeight) / 20;
      const spacing = Math.min(window.innerWidth, window.innerHeight) / density;
      
      // Create a grid of points
      for (let x = 0; x < window.innerWidth; x += spacing) {
        for (let y = 0; y < window.innerHeight; y += spacing) {
          // Add some randomness to positions
          const pointX = x + (Math.random() * spacing * 0.5);
          const pointY = y + (Math.random() * spacing * 0.5);
          const size = Math.random() * 1.5 + 0.5;
          const opacity = Math.random() * 0.4 + 0.1;
          
          points.current.push({
            x: pointX,
            y: pointY,
            size,
            opacity,
            originalSize: size,
            originalOpacity: opacity
          });
        }
      }
    };
    
    const drawPoints = () => {
      if (!ctx || !canvas) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      points.current.forEach(point => {
        const distance = Math.sqrt(
          Math.pow(mousePosition.current.x - point.x, 2) + 
          Math.pow(mousePosition.current.y - point.y, 2)
        );
        
        // Influence radius - how far from cursor the effect reaches
        const influenceRadius = 150;
        
        if (distance < influenceRadius) {
          // Calculate intensity based on distance (closer = more intense)
          const intensity = 1 - (distance / influenceRadius);
          
          // Enhance size and opacity based on distance from cursor
          point.size = point.originalSize + (intensity * 2);
          point.opacity = point.originalOpacity + (intensity * 0.5);
        } else {
          // Reset to original values with smooth transition
          point.size = point.originalSize + (point.size - point.originalSize) * 0.9;
          point.opacity = point.originalOpacity + (point.opacity - point.originalOpacity) * 0.9;
        }
        
        ctx.beginPath();
        ctx.arc(point.x, point.y, point.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${point.opacity})`;
        ctx.fill();
      });
      
      animationFrameId.current = requestAnimationFrame(drawPoints);
    };
    
    const handleMouseMove = (e: MouseEvent) => {
      mousePosition.current = { x: e.clientX, y: e.clientY };
    };
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    
    handleResize();
    drawPoints();
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId.current);
    };
  }, []);
  
  return (
    <canvas 
      ref={canvasRef} 
      className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none"
    />
  );
};

export default InteractiveDotBackground;
