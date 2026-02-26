// src/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ user, children }) => {
  if (!user) {
    // replace={true} prevents the user from hitting "back" into a loop
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;