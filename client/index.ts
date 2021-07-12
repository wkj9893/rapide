const socket = new WebSocket('ws://localhost:8080')

let count = 13

socket.onopen = () => {
    console.log('[open] Connection established')
}

socket.onmessage = event => {
    console.log(`[message] receive message ${event.data} from server`)
}

socket.onclose = event => {
    if (event.wasClean) {
        console.log(
            `[close] Connection closed cleanly, code = ${event.code} reason = ${event.reason}`
        )
    }
    console.log('[close] Connection died')
}

socket.onerror = error => {
    console.log(`[error] ${error}`)
}
