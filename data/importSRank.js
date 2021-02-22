const https = require('https')
const fs = require('fs')

const rawAccounts = require('../data/raw_srank.json')

const url = 'https://api.etherscan.io/api'
const query = {
    module: 'logs',
    action: 'getLogs',
    fromBlock: rawAccounts.lastBlock, // could +1 but might miss large transactions on a single block
    toBlock: 999999999,
    address: '0xa050A8e2EFD7FB9106515F8F014FDee2c42fE707', // SRANK TOKEN CONTRACT ADDR
    topic0: '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
    apikey: '2I2FME1U6YW41S1BN7YWY2BTEBWN64VRPU'
}
const endpoint = `${url}?${Object.keys(query).map(o=>`${o}=${query[o]}`).join('&')}`
console.log(endpoint)

console.log(`\nREAD ${rawAccounts.owners.length} RECORDS\n`)

//fetch(endpoint,obj=>{console.log(obj)})
// using promises
//fetch(endpoint).then(o=>{console.log(o)})
async function start(){
    let data = await fetch(endpoint)
    let raw = processData(data)
    let compressed = compressData(raw)

    fs.writeFileSync( '../data/raw_srank.json', JSON.stringify(raw) )
    fs.writeFileSync( '../data/accounts_srank.json', JSON.stringify(compressed) )

    console.log(compressed)
    console.log('IMPORT SRANK DONE\n\n')
}
start()

function processData(data){

    let lastBlock = rawAccounts.lastBlock
    let owners = rawAccounts.owners

    data.result.map(o=>{
        let fromAddr = `0x${o.topics[1].substr(-40)}`
        let toAddr = `0x${o.topics[2].substr(-40)}`
        let value = parseInt(o.topics[3])
        let block = parseInt(o.blockNumber)
        lastBlock = lastBlock < block ? block : lastBlock
        console.log(`At block [${block}]: \tfrom ${fromAddr} \tto ${toAddr} \tID ${value}`)
        owners[value] = toAddr
    })
    //console.log(owners)
    return {
        lastBlock: lastBlock,
        owners: owners
    }
}

function compressData(data){
    return data.owners.reduce( (prev,curr,i)=>{
        if(curr){
            prev[curr] = prev.hasOwnProperty(curr) ? prev[curr] : []
            prev[curr].push(i)
        }
        return prev
    },{})
}

function fetch(url){

    return new Promise((resolve,reject)=>{
        https.get(url,(res) => {
            let body = ""
    
            res.on("data", (chunk) => {
                body += chunk
            });
    
            res.on("end", () => {
                try {
                        let obj = body[0] === '{' ? JSON.parse(body) : null
                        resolve(obj)
    
                } catch (error) {
                    console.error(error.message)
                    reject(error)
                }
            })
    
        }).on("error", (error) => {
            console.error(error.message)
            reject(error)
        })
    }) 
}
