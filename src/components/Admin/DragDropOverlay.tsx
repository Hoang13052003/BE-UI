import React, { ReactNode } from 'react';

interface DragDropOverlayProps {
  onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  children: ReactNode;
}

const DragDropOverlay: React.FC<DragDropOverlayProps> = ({
  onDragLeave,
  children,
}) => {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 1050,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onDragLeave={onDragLeave}
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      {children}
    </div>
  );
};

export default DragDropOverlay;