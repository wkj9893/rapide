import os = require('os')

export function getNetworkAddress(): string {
  const interfaces = os.networkInterfaces()
  for (const name of Object.keys(interfaces)) {
    const i = interfaces[name]
    if (!i) {
      continue
    } else {
      for (const { address, family, internal } of i) {
        if (family === 'IPv4' && !internal) {
          return address
        }
      }
    }
  }
  return ''
}
