import { useState } from 'react'
import React from 'react'
import './App.css'

export default function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="App">
      <h1>Hello React!</h1>
      <button type="button" onClick={() => setCount((count) => count + 1)}>
        count is: {count}
      </button>
    </div>
  )
}
