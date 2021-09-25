#!/usr/bin/env node
import { createServer, preCreateServer, cyan, lightBlue, build } from './server'
import { version } from '../package.json'
import { performance } from 'perf_hooks'

const args = process.argv.slice(2)

async function main() {
  if (!args[0] || args[0] === 'dev') {
    const startTime = performance.now()
    const config = await preCreateServer()
    const server = await createServer(config)
    console.log(cyan(`\n  rapide ${version}`) + ' dev server running at:\n')
    console.log('  > Local: ' + lightBlue(`http://localhost:${server.port}\n`))
    console.log(
      cyan(`  ready in ${(performance.now() - startTime).toFixed()}ms`)
    )
    return
  }
  if (args[0] === 'build') {
    await build()
    return
  }
  if (args[0] === '--version') {
    console.log('rapide', version)
    return
  }
  if (args[0] === '--help') {
    console.log('rapide', version)
    console.log(`OPTIONS:
    h, --help
        Prints help information`)
    //  TODO help
  }
  throw new Error(
    `rapide:  '${args[0]}' is not a rapide command. See 'rapide --help'`
  )
}

main().catch((e) => console.error(e))
