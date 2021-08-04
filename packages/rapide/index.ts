#!/usr/bin/env node
import { preCreateServer, RapideServer } from './server/index'
import { version } from './package.json'
import { cyan, lightBlue } from './server/utils/color'

const args = process.argv.slice(2)

async function main() {
  if (!args[0] || args[0] === 'dev') {
    const startTime = performance.now()
    const config = await preCreateServer()
    console.log(performance.now() - startTime)
    const server = new RapideServer(config)
    server.listen(3000)
    console.log(cyan(`\n  rapide ${version}`) + ' dev server running at:\n')
    console.log('  > Local: ' + lightBlue('http://localhost:3000\n'))
    console.log(
      cyan(`  ready in ${(performance.now() - startTime).toFixed()}ms`)
    )
    return
  }
  if (args[0] === 'build') {
    //  TODO build
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
