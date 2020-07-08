
import jet from "./jet";


export default {
    rgbToHex: function(r,g,b,a) {return "#"+(jet.num.toHex(r)+jet.num.toHex(g)+jet.num.toHex(b)+(a?jet.num.toHex(a):""));},
};