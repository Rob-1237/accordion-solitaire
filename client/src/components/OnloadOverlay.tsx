import React from 'react';

const OnloadOverlay: React.FC = () => (
  <div
    style={{
      position: 'fixed',
      inset: 0,
      width: '100vw',
      height: '100vh',
      background: 'black',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <img
      src="/accordion-main-logo.jpeg"
      alt="Accordion Logo"
      style={{
        maxWidth: '80vw',
        maxHeight: '60vh',
        objectFit: 'contain',
        filter: 'drop-shadow(0 4px 24px rgba(0,0,0,0.7))',
      }}
    />
  </div>
);

export default OnloadOverlay;
