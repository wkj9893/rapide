import React from 'react' 
import { useState } from 'react'
import './index.css'
import {Button} from '@material-ui/core'

export default function App() {
    const [count, setCount] = useState(0)
    const [time, setTime] = useState('')

    setInterval(() => setTime(new Date().toLocaleString()), 1000)

    return (
        <>
            <h1>{time}</h1>
            <button onClick={() => setCount(prev => prev + 1)}>
                Please Click Me
            </button>
            <h1 className="count">{count}</h1>
            <Button variant="contained" color="primary">
      Hello World
    </Button>
        </>
    )
}
