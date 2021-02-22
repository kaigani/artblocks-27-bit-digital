window.addEventListener('load', init, false)
function init() {
			
    const canvas = document.getElementsByTagName("canvas")[0]
    canvas.width = document.body.clientWidth
    canvas.height = document.body.clientHeight
    let seed = parseInt(tokenData.hash.substr(-7),16)
    drawToken(canvas,seed)
    getMetadata(tokenData.hash)
}

function drawToken(canvas,seed){

    const c = canvas.getContext('2d')
    c.webkitImageSmoothingEnabled = false

    const colorSeed = seed & 0xfff 
    const segmentSeed = (seed & 0x7f000) >> 12 
    const rSeed = ((seed >> 19) & 0xff) === 1 ? 5 : ((seed >> 19) & 0xf) === 1 ? 3 : 4 

    let outerSize = Math.min(canvas.width,canvas.height)
    c.fillStyle = '#C4CDD5'
    c.fillRect(0,0,outerSize,outerSize)

    let innerSize = Math.pow(2,parseInt(Math.log2(outerSize)))
    offset = Math.floor((outerSize-innerSize)/2)

    let scale = Math.pow(2,rSeed)
    let factor = innerSize / 2048.0 
    
    drawPattern(colorSeed,offset,offset,scale*factor,innerSize)
    draw7Segment(segmentSeed,factor,offset)

    function drawPattern(bitmap,dx,dy,scale,size){

        for(x=dx;x<dx+size;x+=scale*2){
            for(y=dy;y<dy+size;y+=scale*2){
                
                for(var i=0;i<4;i++){
                    let byte = bitmap >> (3*i)
                    let [r,g,b] = [ (byte & 4) ? 'F' : '0', (byte & 2) ? 'F' : '0', (byte & 1) ? 'F' : '0' ]
                    c.fillStyle = `#${r}${g}${b}`
                    let [xOffset,yOffset] = [ (i%2)*scale, parseInt(i/2)*scale ]
                    c.fillRect(x+xOffset,y+yOffset,scale,scale)
                }
            }
        }
    }

    function draw7Segment(mask,factor,offset){
        const [scale,sprite,segments,dx,dy] = [
            32*factor,
            [32760,65532,131070,262143,131070,65532,32760],
            [[1,0,0,1,4,0],[0,1,-1,0,7,4],[0,1,-1,0,26,4],[1,0,0,1,4,19],[0,1,-1,0,7,23],[0,1,-1,0,26,23],[1,0,0,1,4,38],],
            19,9
        ]
        
        segments.map((translation,i)=>{
            let bit = Math.pow(2,i)
            mask & bit && draw(sprite, translation, dx, dy, scale, offset)
        }) 
        
        function draw(sprite,translation,dx,dy,scale,offset){
            c.setTransform(1,0,0,1,dx*scale+offset,dy*scale+offset)
            c.transform(...translation.map(o=>scale*o))
            sprite.map((bits,dy)=>{
                for(dx=0;bits>0;dx++){
                    if(bits & 1){
                        c.fillStyle = `#FFF`       
                        c.fillRect(dx,dy,1,1)
                    }
                    bits = bits >> 1
                }
            })
        }
    } 
}

function getMetadata(hash){

    const seed = parseInt(hash.substr(-7),16)
    const colorSeed = seed & 0xfff 
    const segmentSeed = (seed & 0x7f000) >> 12 
    const rSeed = ((seed >> 19) & 0xff) === 1 ? 5 : ((seed >> 19) & 0xf) === 1 ? 3 : 4
    const res = rSeed === 5 ? 'LoRes 32x32' : rSeed === 3 ? 'HiRes 8x8' : 'VGA 16x16'
    
    let type = 'Glitch'
    switch(segmentSeed){
        case 0x0:
            type = 'Ghost'
            break

        case 0x3f: // A
        case 0x7a: // b
        case 0x53: // C
        case 0x7c: // d
        case 0x5b: // E
        case 0x1b: // F
        case 0x3a: // h
        case 0x74: // J
        case 0x52: // L
        case 0x38: // n
        case 0x1f: // P
        case 0x76: // U
        case 0x3e: // X
        case 0x6e: // y
            type = 'Alphabetic'
            break

        case 0x5d: // 2
        case 0x6d: // 3
        case 0x2e: // 4
        case 0x7b: // 6
        case 0x25: // 7
        case 0x6f: // 9
        case 0x36: // 11
            type = 'Numeric'
            break

        case 0x12: // I, l, 1
        case 0x24: // I, l, 1
        case 0x77: // O,0
        case 0x6b: // S,5
            type = 'Alphanumeric'
            break

        case 0x7f:
            type = 'Lucky 8'
            break

        case 0x46:
            type = 'OTTO'
            break
        
    } 

    let pattern = []
    let p1 = colorSeed & 0x7
    let p2 = (colorSeed & (0x7<<3)) >> 3
    let p3 = (colorSeed & (0x7<<6)) >> 6
    let p4 = (colorSeed & (0x7<<9)) >> 9

    if(
        p1 === 0 &&
        p2 === 0 &&
        p3 === 0 &&
        p4 === 0
    ){
        if(segmentSeed === 0){
            pattern.push('Blackout')
        }else{
            pattern.push('Binary')
        }
    }else if(
        p1 === 7 &&
        p2 === 7 &&
        p3 === 7 &&
        p4 === 7
    ){
        pattern.push('Whiteout')
    }else if(
        p1 === p2 &&
        p2 === p3 &&
        p3 === p4 
    ){
        pattern.push('Solid')
    }else 
    if(
        (p1 === 0 || p1 === 7) && 
        (p2 === 0 || p2 === 7) && 
        (p3 === 0 || p3 === 7) && 
        (p4 === 0 || p4 === 7)
    ){ 
        pattern.push('Black & White')
    }

    if(
        p1 === p3 &&
        p2 === p4 &&
        p1 !== p2
    ){
        pattern.push('Bars')
    }

    if(
        p1 === p2 &&
        p3 === p4 &&
        p1 !== p3
    ){
        if(p1 === 0 || p3 === 0){
            pattern.push('Scanlines')
        }else{
            pattern.push('Stripes')
        }
    }

    if(
        p1 === p4 &&
        p2 === p3 &&
        p1 !== p2
    ){
        pattern.push('Checkerboard')
    }

    if(
        ( p1 === p2 && p1 === p3 && p1 !== p4 ) || 
        ( p1 !== p2 && p1 === p3 && p1 === p4 ) || 
        ( p1 === p2 && p1 !== p3 && p1 === p4 ) || 
        ( p1 !== p2 && p2 === p3 && p2 === p4 )  
        
    ){
        pattern.push('Pointillist')
    }

    switch(colorSeed){
        case (7<<9)+(3<<6)+(6<<3)+2:
        case (7<<9)+(6<<6)+(3<<3)+2:
        case (3<<9)+(7<<6)+(2<<3)+6:
        case (3<<9)+(2<<6)+(7<<3)+6:
        case (6<<9)+(7<<6)+(2<<3)+3:
        case (6<<9)+(2<<6)+(7<<3)+3:
        case (2<<9)+(6<<6)+(3<<3)+7:
        case (2<<9)+(3<<6)+(6<<3)+7:
            pattern.push('Highlighter')
        break
    }

    if(pattern.length === 0) pattern.push('Mix')

    let metadata = {glyph:type,res:res,pattern:pattern}
    console.table(metadata)
    return(metadata)
}
 	
