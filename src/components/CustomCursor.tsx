
import React, { useState, useEffect } from 'react';

const CustomCursor: React.FC = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updatePosition = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setIsVisible(true);
    };

    const updateExpanded = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isInteractive = target.closest('button, a, input, select, textarea, [role="button"]');
      setIsExpanded(!!isInteractive);
    };

    window.addEventListener('mousemove', updatePosition);
    window.addEventListener('mousemove', updateExpanded);
    
    document.body.classList.add('interactive-cursor');
    
    return () => {
      window.removeEventListener('mousemove', updatePosition);
      window.removeEventListener('mousemove', updateExpanded);
      document.body.classList.remove('interactive-cursor');
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div 
      className={`custom-cursor ${isExpanded ? 'custom-cursor-expanded' : ''}`}
      style={{ 
        left: `${position.x}px`,
        top: `${position.y}px`,
        transition: 'width 0.2s, height 0.2s, background-color 0.2s',
      }}
    />
  );
};

export default CustomCursor;
