export type HMRMessage = ConnectedMessage | ReloadMessage | UpdateMessage

interface ConnectedMessage {
    type: 'connected'
}

interface ReloadMessage {
    type: 'reload'
}

interface UpdateMessage {
    type: 'update'
    update: string
}

const socket = new WebSocket(`ws://${location.host}`)

socket.onopen = () => {
    console.log('[connected] Connection Established')
}

async function waitForRestart(timeout = 1000) {
    while (true) {
        try {
            await fetch('/')
            break
        } catch (error) {
            await new Promise(resolve => setTimeout(resolve, timeout))
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

async function handleMessage(data: HMRMessage) {
    if (data.type === 'connected') {
    } else if (data.type === 'reload') {
        window.location.reload()
    } else if (data.type === 'update') {
        const { update } = data
        //  @ts-ignore
        const res = await import('/qwe')
        console.log(res)
    }
}
