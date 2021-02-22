else if (this.props.projectId==="17"){

    const getFromHash = h => {
        h = h.substr(2);
        let table = [];
        for (let i = 0; i < 16; i++) { table[i] = parseInt("0x"+(h.substr(i+8, 1) + h.substr(i+24, 1) + h.substr(i+40, 1)),16)/4096; }
        return table;
    }
    const values = getFromHash(tokenData);
    const E = value => { return Math.floor(value+0.5); }
    const SF = (value, minRange, maxRange) => { return Math.floor(((value*(maxRange-minRange))+minRange)+0.5); }
    const S = (value, minRange, maxRange) => { return (value*(maxRange-minRange))+minRange; }
    //const sh = v => { return  Number.parseFloat(v).toFixed(3); }
    const isMonotone = (v) => {
        let monotone = false;
        // If the palette is set to monotone then *it is* monotone
        if (!E(((values[12]+values[15])*0.5)+0.2)) { monotone = true; }
        // v[2] || v[3] might be -1, in case just exclude them
        let colors = [v[0], v[1]];
        if (v[2] >= 0) { colors.push(v[2]); }
        if (v[3] >= 0) { colors.push(v[3]); }
        // Otherwise we need to check for color similarities
        let center = 0.41;
        // Check if all under center
        if (colors.every((v) => v <= center)) { monotone = true };
        // Check if all over center
        if (colors.every((v) => v > center)) { monotone = true };
        return monotone;
    }
  const metadata = {};
  // Orientation
  metadata.orientation = E(values[12]-0.35) ?
    E(values[10]) ? "Horizontal" : "Vertical"
  : E(values[10]) ?  "Vertical" : "Horizontal";
  features.push("Orientation: " + metadata.orientation);


  // Palette
  if (E(((values[12]+values[15])*0.5)+0.2)) {
    if (E(values[11]-0.25) === 1) {
      metadata.palette = "Purple-Yellow";
    } else {
      if (S(values[5],0., 0.07) < 0.03) {
        metadata.palette = "Coral-Teal";
      } else {
        metadata.palette = "Pink–Mint";
      }
    }
  }
  let colors = [values[7], values[6], values[9], values[2]];
    // If LFO is off, the color will just be black.
    if (E(values[12]-0.4)) { colors[2] = -1 };
    // If brightness is very low, the color will just look like black.
    if ((1 - Math.abs(values[6]-0.45)) >= 0.85) { colors[3] = -1 };
  if (isMonotone(colors)) { metadata.palette = "Monotone" };
  features.push("Palette: " + metadata.palette);


  // Modulation frequency
  let mf = SF(values[2], 1., 35.);
  if (mf < 8) {
    metadata.modulation_frequency = "Low";
  } else if (mf >= 8 && mf < 15) {
    metadata.modulation_frequency = "Medium";
  } else if (mf >= 15) {
    metadata.modulation_frequency = "High";
  }
  features.push("Frequency modulation: " + metadata.modulation_frequency);


  // Bitwise operators
  if (E(values[11]) && E(values[3]+0.1)) {
    metadata.bitwise = "OR";
  } else if (!E(values[11]) && !E(values[3]+0.1)) {
    metadata.bitwise = "AND";
  } else {
    metadata.bitwise = "Mixed";
  }
  features.push("Bitwise operators: " + metadata.bitwise);


}