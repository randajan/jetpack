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
    getBound(ele, offset, client) {
        if (!jet.web.getParent(ele)) { return {}}
        const t = client ? "client" : offset ? "offset" : null;
        const r = t ? null : ele.getBoundingClientRect();
        const width = r ? r.width : ele[t+"Width"];
        const height = r ? r.height : ele[t+"Height"];
        const left = r ? r.left : ele[t+"Left"] - ele.scrollLeft;
        const top = r ? r.top : ele[t+"Top"] - ele.scrollTop;
        const right = r ? r.right : left + width;
        const bottom = r ? r.bottom : top + height;
        return { width, height, left, top, right, bottom }
    },
};
