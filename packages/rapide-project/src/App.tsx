import { useState } from 'react'
import React from 'react'
import './App.css'
import Button from '@mui/material/Button';


function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="App">
        <h1>Hello React!wqeqweewq</h1>
          <button type="button" onClick={() => setCount((count) => count + 1)}>
            count is: {count}
          </button>
          <Button variant="contained">Hello World</Button>
    </div>
  )
}

export default App
