
import { useEffect } from 'react'
import './App.css'
import { getHealth } from './api/health'
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login ';
import Register from './pages/Register';

function App() {

  useEffect(()=>{
    getHealth().then(console.log);
  },[]);
 
  return (
     <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  )
}

export default App
