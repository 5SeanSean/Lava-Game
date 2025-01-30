export function textToRGB(colorName) {
    const colors = {
        "black": [0, 0, 0],
        "red": [255, 0, 0],
        "green": [0, 255, 0],
        "yellow": [255, 255, 0],
        "blue": [0, 0, 255],
        "magenta": [255, 0, 255],
        "cyan": [0, 255, 255],
        "white": [255, 255, 255],
        "darkred": [139, 0, 0],
        "brown": [165, 42, 42],
        "purple": [128, 0, 128],
        "pink": [255, 192, 203],
        "orange": [255, 165, 0],
        "darkorange": [255, 140, 0],
        "gold": [255, 215, 0],
        "lightyellow": [255, 255, 224],
        "lightgreen": [144, 238, 144],
        "lightblue": [173, 216, 230],
        "lightpink": [255, 182, 193],
        "lightgray": [211, 211, 211],
        "lightcyan": [224, 255, 255],
        "lightmagenta": [238, 130, 238],
        "darkgray": [169, 169, 169],
        "darkcyan": [0, 139, 139],
        "darkblue": [0, 0, 139],
        "darkmagenta": [139, 0, 139],
        "darkgreen": [0, 100, 0],
        "darkpink": [199, 21, 133],
        "darkbrown": [101, 67, 33],
        "darkpurple": [139, 0, 139],
        "darkorange": [255, 140, 0],
        "darkgoldenrod": [184, 134, 11],
        "darkkhaki": [189, 183, 107],
        "darkslategray": [47, 79, 79],
        "darkslateblue": [72, 61, 139],
        "darkseagreen": [106, 140, 140],
        "darkturquoise": [0, 206, 209],
        "darkviolet": [148, 0, 211],
        "deeppink": [255, 20, 147],
        "deepskyblue": [0, 191, 255],
        "dodgerblue": [30, 144, 255],
        "firebrick": [178, 34, 34],
        "floralwhite": [255, 250, 240],
        "forestgreen": [34, 139, 34],
        "gainsboro": [220, 220, 220],
        "ghostwhite": [248, 248, 255],
        "gold": [255, 215, 0],
        "goldenrod": [218, 165, 32],
        "greenyellow": [173, 255, 47],
        "honeydew": [240, 255, 240],
        "hotpink": [255, 105, 180],
        "indianred": [205, 92, 92],
    };
    const colorRGB = Object.entries(colors).find(([key]) => key.toLowerCase() === colorName.toLowerCase());

    if (colorRGB) {
        const [colorName, rgb] = colorRGB;
        const [r, g, b] = rgb;
        return [r, g, b];
    } else {
        return colorName;
    }
    
}