import jet from "./jet";

const W = window;
const D = document;
const B = D.body;
const H = D.documentElement;

export default {
    stop(ev, bubbling) {
        if (!ev) { return; }
        if (ev.preventDefault) {ev.preventDefault();}
        if (ev.stopBubbling && bubbling) {ev.stopBubbling();}
    },
    listen(bol, ele, type, handler) {
        [type, handler, bol] = jet.get([["string", type, "click"], ["function", handler], ["boolean", bol, true]]);
        const b = handler ? bol : !bol; 
        (ele || D)[(b ? "add" : "remove")+"EventListener"](type, handler||jet.event.stop);
        return _=>jet.event.listen(!bol, ele, type, handler);
    },
    hear(ele, type, handler) { return jet.event.listen(true, ele, type, handler); },
    deaf(ele, type, handler) { return jet.event.listen(false, ele, type, handler); },

    listenShift(ele, onShift, bound) {
        [ele, onShift, bound] = jet.get([["element", ele], ["function", onShift], ["object", bound]]);
        const evmap = {"mousedown":"start", "mouseup":"stop", "mousemove":"shift"}
        let parent;
        
        function listen(bol) { ["mousemove", "mouseup"].map(ev=>jet.event.listen(bol, D, ev, shift)); }
        function pick(x, y) { bound.pickX = x || 0; bound.pickY = y || 0; }
        function move(x, y) { bound.x = x || 0; bound.y = y || 0; }
        function dimension(width, height) { bound.parentWidth = width || 0; bound.parentHeight = height || 0; }

        function start(ev) {
            parent = jet.web.getParent(ele);
            if (!parent || (ev && ev.target !== ele)) { return; }
            bound = {...bound, ...ele.getBoundingClientRect()};
            if (ev) { pick(bound.width/2 - ev.offsetX, bound.height/2 - ev.offsetY); }
            shift(ev);
        }

        function shift(ev) {
            const pb = parent.getBoundingClientRect();
            const state = ev ? evmap[ev.type] : "stop";

            dimension(pb.width, pb.height);
            if (ev) { move((ev.clientX - pb.left + bound.pickX) / pb.width, (ev.clientY - pb.top + bound.pickY) / pb.height); }

            if (state !== "shift") { listen(state === "start"); }
            if (onShift(ev, bound, state) === false) { return; } 

            ele.style.left = (bound.x*100)+"%";
            ele.style.top = (bound.y*100)+"%";

            bound.lastX = bound.x;
            bound.lastY = bound.y;

            jet.event.stop(ev);
        };
        
        if (bound) { start(); }
        return jet.event.hear(ele, "mousedown", start);
    }
};
