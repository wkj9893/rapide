import { HMRMessage } from '../server/index'

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
        const module = await import(data.update)
        console.log(import.meta)
    }
}

export function createHotContext(url: string) {
    const { pathname } = new URL(url)

    const hot = {
        pathname,
        accept(callback: Function) {
            callback()
        },
    }

    return hot
}
