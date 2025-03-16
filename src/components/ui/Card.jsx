// src/components/ui/Card.js
import React from 'react';
import './Card.css';


export const Card = ({ children }) => {
  return (
    <div className="card">
      {children}
    </div>
  );
};

export const CardContent = ({ children }) => {
  return <div className="card-content">{children}</div>;
};
