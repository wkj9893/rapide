export type HMRMessage = ConnectedMessage | ReloadMessage | UpdateMessage

interface ConnectedMessage {
    type: 'connected'
}

interface ReloadMessage {
    type: 'reload'
}

interface UpdateMessage {
    type: 'update'
}

const socket = new WebSocket('ws://localhost:3000')

socket.onopen = () => {
    console.log('[connected] Connection Established')
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

socket.onmessage = ({ data }) => {
    console.log(`[message] receive message ${data} from server`)
    handleMessage(JSON.parse(data))
}

function handleMessage(data: HMRMessage) {
    if (data.type === 'connected') {
    } else if (data.type === 'reload') {
        window.location.reload()
    }
}
