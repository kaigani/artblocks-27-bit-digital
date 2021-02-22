const https = require('https')
const fs = require('fs')


let prefix = "https://api.artblocks.io/token/2100" // +0000

getRecords(0,1023,()=>{
    
    //fs.writeFileSync(dbFile, data)
    console.log('DONE')
})

// ---

function getRecords(start,end,callback){

    const bufferSize = 25

    this.count = this.hasOwnProperty('count') ? this.count : 0
    this.total = this.hasOwnProperty('total') ? this.total : end-start+1

    if(start > end){
        console.log('>>> Queued.')
        return
    }else if(this.count < bufferSize){
        this.count++
        let id = start.toString().padStart(4,0)
        console.log(`Get record: ${id}`)
        
        getRecord(`${prefix}${id}`,(o)=>{
            
            // abort if no result
            if(o){ 
                
                // process the data object
                console.log(`Writing ${id}...`)
                fs.writeFileSync(`db/${id}.json`, JSON.stringify(o))

            }else{
                console.log('NO RECORD',start)
                this.isAbort = true
            }

            console.log(`<< ${start}`)
            this.count--
            if(this.count === 0){
                console.log('Done with buffer.')
            }
            this.total--
            if(this.total === 0){
                callback()
            }
            
        })
        getRecords(start+1,end,callback)  
    }else{
        setTimeout( ()=>{
            getRecords(start,end,callback)
        },1000)
    }
}

function getRecord(url,callback){

    console.log(url)
    https.get(url,(res) => {
        let body = "";

        res.on("data", (chunk) => {
            body += chunk;
        });

        res.on("end", () => {
            try {
                    let obj = body[0] === '{' ? JSON.parse(body) : null
                    callback(obj)

            } catch (error) {
                console.error(error.message);
            };
        });

    }).on("error", (error) => {
        console.error(error.message);
    })
}

