import { spawn } from 'child_process'
import { platform } from 'process'

export default function open(url: string) {
    if (platform === 'win32') {
        const command = `${process.env.SYSTEMROOT}\\System32\\WindowsPowerShell\\v1.0\\powershell`
        spawn(command, ['start', url])
    } else {
        throw new Error('TODO for other platforms')
    }
}
