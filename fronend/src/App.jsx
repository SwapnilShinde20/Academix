
// In your index.js or App.js
import 'boxicons/css/boxicons.min.css';
import { Outlet } from 'react-router';
import React from "react"

function App() {

  return (
    <div className="w-full">
      <Outlet/>
    </div>
  )
}

export default App
