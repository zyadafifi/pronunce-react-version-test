import React from 'react';

const BackButton = ({ onClick, title = "Back to Lessons" }) => {
  const baseStyles = {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    background: 'rgba(0, 0, 0, 0.7)',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '18px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    flexShrink: '0',
    marginTop: '-0.5rem',
    userSelect: 'none',
    outline: 'none',
    padding: '0',
    margin: '0',
    marginTop: '-0.5rem',
    position: 'relative',
    zIndex: '1000',
    backdropFilter: 'blur(10px)',
    boxSizing: 'border-box',
    fontFamily: 'inherit'
  };

  const handleMouseEnter = (e) => {
    Object.assign(e.target.style, {
      background: 'rgba(0, 0, 0, 0.9)',
      transform: 'scale(1.1)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
    });
  };

  const handleMouseLeave = (e) => {
    Object.assign(e.target.style, {
      background: 'rgba(0, 0, 0, 0.7)',
      transform: 'scale(1)',
      boxShadow: 'none'
    });
  };

  const handleMouseDown = (e) => {
    e.target.style.transform = 'scale(1.05)';
  };

  const handleMouseUp = (e) => {
    e.target.style.transform = 'scale(1.1)';
  };

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof onClick === 'function') {
      onClick();
    }
  };

  return (
    <button
      onClick={handleClick}
      title={title}
      style={baseStyles}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      type="button"
    >
      <i 
        className="fas fa-arrow-left"
        style={{
          fontSize: '18px',
          color: 'white',
          pointerEvents: 'none'
        }}
      />
    </button>
  );
};

export default BackButton;