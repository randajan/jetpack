
import jet from "../jet";


export default {
    rnd:_=>Array(3).fill().map(_=>jet.num.toHex(jet.num.round(jet.rnd.number(0,255,false)))).join(""),
    rgbToHex: function(r,g,b,a) {return "#"+(jet.num.toHex(r)+jet.num.toHex(g)+jet.num.toHex(b)+(a?jet.num.toHex(a):""));},
};