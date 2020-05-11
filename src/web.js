import jet from "./jet";

const W = window;
const D = document;
const B = D.body;
const H = D.documentElement;

export default {
    getParent(ele) {
        return jet.is("element", ele) ? ele.parentElement || ele.parentNode : undefined;
    },
    getScroll(ele) {
        const s = "scroll", c = "client";
        const real = (ele !== B && jet.is("element", ele));
        let w = W, h = H, b = B;
        if (real) { w = h = b = ele; }
        return jet.obj.map({top:"Y", left:"X"}, (v, k)=>{
            let d = jet.str.capitalize(k);
            let scroll = jet.get("number", w["page"+v+"Offset"], h[s+d], b[s+d]);
            let client = jet.get("number", h[c+d], b[c+d]);
            return scroll-client;
        });
    },
    getBound(ele) {
        if (!jet.web.getParent(ele)) { return {}}
        const bound = ele.getBoundingClientRect(); 
        const scroll = jet.web.getScroll();
        return {
            top:bound.top+scroll.top,
            left:bound.left+scroll.left,
            width:bound.width,
            height:bound.height
        }
    }
};
