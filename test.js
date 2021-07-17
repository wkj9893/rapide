const { init, parse } = require('es-module-lexer')



async function main(){
    await init
    const[imports] = parse(`import {add} from "./add" 

    console.log(import.meta)
    `)
    console.log(imports)
}

main().catch((e)=>console.log(e))