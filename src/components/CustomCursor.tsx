
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
        width: isExpanded ? '40px' : '20px',
        height: isExpanded ? '40px' : '20px',
        borderRadius: '50%',
        background: 'transparent',
        border: '2px solid rgba(255, 255, 255, 0.4)',
        pointerEvents: 'none',
        position: 'fixed',
        transform: 'translate(-50%, -50%)',
        zIndex: 9999,
        mixBlendMode: 'difference',
        transition: 'width 0.2s, height 0.2s, background-color 0.2s',
      }}
    />
  );
};

export default CustomCursor;
