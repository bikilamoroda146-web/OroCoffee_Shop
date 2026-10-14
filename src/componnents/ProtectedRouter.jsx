import React, { useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import {useAuth} from'../context/AuthContext'

function ProtectedRouter({children}) {
  const {user} = useAuth();
  const location = useLocation();

  if(!user){
    return <Navigate to="/signin" replace state={{from: location}} />
  }
  return  children;
}

export default ProtectedRouter