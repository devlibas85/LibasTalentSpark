
import { useEffect } from 'react'

import { getHealth } from './api/health'
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login ';
import ProtectedRoute from './components/ProtectedRoute';
import AuthSuccess from './pages/AuthSuccess';
import Dashboard from './pages/Dashboard';


function App() {

  useEffect(()=>{
    getHealth().then(console.log);
  },[]);
 
  return (
     <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="*" element={<Navigate to="/login" />} />
      <Route path="/auth/success" element={<AuthSuccess />} />
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>
    </Routes>
  )
}

export default App
