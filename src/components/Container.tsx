import React from 'react';

export function Container({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`max-w-[1600px] w-full mx-auto ${className}`}>
      {children}
    </div>
  );
}
