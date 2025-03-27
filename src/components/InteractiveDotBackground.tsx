
import React, { useEffect, useRef } from 'react';

const InteractiveDotBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let dots: { x: number; y: number; size: number; brightness: number; maxBrightness: number }[] = [];
    let mouse = { x: width / 2, y: height / 2 };
    
    const INFLUENCE_RADIUS = 200;
    const COLUMNS = 25;
    const ROWS = Math.floor((COLUMNS * height) / width);
    const CELL_SIZE = width / COLUMNS;

    // Setup canvas
    const setupCanvas = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      
      // Re-calculate rows based on new dimensions
      const newRows = Math.floor((COLUMNS * height) / width);
      const newCellSize = width / COLUMNS;
      
      // Create dots grid
      dots = [];
      for (let i = 0; i < COLUMNS; i++) {
        for (let j = 0; j < newRows; j++) {
          const x = i * newCellSize + newCellSize / 2;
          const y = j * newCellSize + newCellSize / 2;
          const maxBrightness = 0.2 + Math.random() * 0.3; // Random max brightness between 0.2 and 0.5
          dots.push({ 
            x, 
            y, 
            size: 1 + Math.random(), 
            brightness: 0.05, // Start very dim
            maxBrightness
          });
        }
      }
    };

    // Handle mouse movement
    const handleMouseMove = (e: MouseEvent) => {
      mouse = { x: e.clientX, y: e.clientY };
    };

    // Handle touch movement
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    // Draw dots
    const drawDots = () => {
      ctx.clearRect(0, 0, width, height);
      
      // Update brightness based on mouse distance
      dots.forEach(dot => {
        const dx = mouse.x - dot.x;
        const dy = mouse.y - dot.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < INFLUENCE_RADIUS) {
          // Increase brightness based on proximity to mouse
          const influence = 1 - distance / INFLUENCE_RADIUS;
          dot.brightness = Math.min(dot.maxBrightness, dot.brightness + influence * 0.1);
        } else {
          // Gradually fade when away from mouse
          dot.brightness = Math.max(0.05, dot.brightness * 0.95);
        }
        
        // Draw the dot
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${dot.brightness})`;
        ctx.fill();
      });
    };

    // Animation loop
    const animate = () => {
      drawDots();
      requestAnimationFrame(animate);
    };

    // Handle window resize
    const handleResize = () => {
      setupCanvas();
    };

    // Set up event listeners
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('resize', handleResize);

    // Initialize and start animation
    setupCanvas();
    animate();

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 w-full h-full bg-[#0A0A0A]"
    />
  );
};

export default InteractiveDotBackground;
