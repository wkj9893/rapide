#!/usr/bin/env node
const version = require('../package.json').version;


// console.log(process.argv)

const args = process.argv.slice(2)

if (!args[0] || args[0] === 'dev') {
    require('../index')
} else if (args[0] === 'build') {
    //  TODO build
    console.log('build')
} else if (args[0] === '--version') {
    console.log('rapide', version)
} else {
}