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
 	