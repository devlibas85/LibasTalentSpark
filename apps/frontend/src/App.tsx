
import { useEffect } from 'react'
import './App.css'
import { getHealth } from './api/health'

function App() {

  useEffect(()=>{
    getHealth().then(console.log);
  },[]);
 
  return (
    <>
    <p>LIBAS TALENT SPARK</p>
     <p>Check console for backend health </p>
    </>
  )
}

export default App
