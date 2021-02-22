const fs = require('fs')

let hashList = []
for(let i=0;i<1024;i++){
    let id = i.toString().padStart(4,0)
    let o = require(`./db/${id}.json`)
    console.log(o["token hash"])
    hashList.push(o["token hash"])
} 
console.log('WRITING hashList.txt')
fs.writeFileSync('hashList.txt',hashList.join('\n'))

let metadata = []
let count = {}
for(let i=0;i<hashList.length;i++){
    let o = getMetadata(hashList[i])
    let record = `${i}\t${o.glyph}\t${o.res}\t${o.pattern.join(',')}`
    count[o.glyph] = count.hasOwnProperty(o.glyph) ? count[o.glyph]+1 : 1
    count[o.res] = count.hasOwnProperty(o.res) ? count[o.res]+1 : 1
    count[o.pattern.join(',')] = count.hasOwnProperty(o.pattern.join(',')) ? count[o.pattern.join(',')]+1 : 1
    metadata.push(record)
}

console.log('WRITING metadata.txt')
fs.writeFileSync('metadata.txt',metadata.join('\n'))

console.log('\nFINAL COUNT\n')
console.table(count)


function getMetadata(e){const s=parseInt(e.substr(-7),16),a=4095&s,c=(520192&s)>>12,t=1==(s>>19&255)?5:1==(s>>19&15)?3:4,h=5===t?"LoRes 32x32":3===t?"HiRes 8x8":"VGA 16x16";let i="Glitch";switch(c){case 0:i="Ghost";break;case 63:case 122:case 83:case 124:case 91:case 27:case 58:case 116:case 82:case 56:case 31:case 118:case 62:case 110:i="Alphabetic";break;case 93:case 109:case 46:case 123:case 37:case 111:case 54:i="Numeric";break;case 18:case 36:case 119:case 107:i="Alphanumeric";break;case 127:i="Lucky 8";break;case 70:i="OTTO"}let u=[],r=7&a,p=(56&a)>>3,l=(448&a)>>6,n=(3584&a)>>9;switch(0===r&&0===p&&0===l&&0===n?0===c?u.push("Blackout"):u.push("Binary"):7===r&&7===p&&7===l&&7===n?u.push("Whiteout"):r===p&&p===l&&l===n?u.push("Solid"):0!==r&&7!==r||0!==p&&7!==p||0!==l&&7!==l||0!==n&&7!==n||u.push("Black & White"),r===l&&p===n&&r!==p&&u.push("Bars"),r===p&&l===n&&r!==l&&(0===r||0===l?u.push("Scanlines"):u.push("Stripes")),r===n&&p===l&&r!==p&&u.push("Checkerboard"),(r===p&&r===l&&r!==n||r!==p&&r===l&&r===n||r===p&&r!==l&&r===n||r!==p&&p===l&&p===n)&&u.push("Pointillist"),a){case 3826:case 3994:case 2006:case 1726:case 3539:case 3259:case 1439:case 1271:u.push("Highlighter")}0===u.length&&u.push("Mix");let o={glyph:i,res:h,pattern:u};return console.table(o),o}