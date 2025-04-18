import React from 'react';
import '../App.css'; // بنستخدم التنسيقات من App.css

const Loading = ({ message }) => {
  return (
    <div className="loading-overlay">
      <div className="loading-spinner"></div>
      <p>{message}</p>
    </div>
  );
};

export default Loading;