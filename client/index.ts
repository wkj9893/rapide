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


async function waitForRestart(timeout = 1000) {
    while (true) {
        try {
            await fetch('http://localhost:3000')
            break
        } catch (error) {
            await new Promise((resolve) => setTimeout(resolve, timeout))
        }
    }
}

socket.onclose = async event => {
    if (event.wasClean) {
        return
    }
    console.log('[close] Connection Died, Wait For Restart')
    await waitForRestart()
    window.location.reload()
}

socket.onerror = error => {
    console.log(`[error] ${error}`)
}

socket.onmessage = ({ data }) => {
    handleMessage(JSON.parse(data))
}

function handleMessage(data: HMRMessage) {
    if (data.type === 'connected') {
    } else if (data.type === 'reload') {
        window.location.reload()
    }
}
