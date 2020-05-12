import jet from "./jet";

const W = window;
const D = document;
const B = D.body;
const H = D.documentElement;

export default {
    stop(ev) { ev.preventDefault(); },
    listen(bol, ele, type, handler) {
        [type, handler, bol] = jet.get([["string", type, "click"], ["function", handler], ["boolean", bol, true]]);
        const b = handler ? bol : !bol; 
        (ele || D)[(b ? "add" : "remove")+"EventListener"](type, handler||jet.event.stop);
        return _=>jet.event.listen(!bol, ele, type, handler);
    },
    hear(ele, type, handler) { return jet.event.listen(true, ele, type, handler); },
    deaf(ele, type, handler) { return jet.event.listen(false, ele, type, handler); },

    listenShift(ele, onShift) {
        let bound;
        onShift = jet.get("function", onShift);

        function listen(bol) {
            jet.event.listen(bol, D, "mousemove", shift); 
            jet.event.listen(bol, D, "mouseup", stop);
        }

        function shift(ev) {
            const parent = jet.web.getParent(ele).getBoundingClientRect();

            if (parent && parent.width && parent.height) {
                bound.parentWidth = parent.width;
                bound.parentHeight = parent.height;
                bound.x = (ev.clientX - parent.left + bound.pinX) / parent.width;
                bound.y = (ev.clientY - parent.top + bound.pinY) / parent.height;
            }

            if (onShift(ev, bound, ev.type === "mousemove") === false) { return; } 
            ele.style.left = (bound.x*100)+"%";
            ele.style.top = (bound.y*100)+"%";
            bound.lastX = bound.x;
            bound.lastY = bound.y;
            jet.event.stop(ev);
        };

        function stop(ev) {
            listen(false);
            shift(ev);
        }

        function start(ev) {
            if (ev.target !== ele) { return }
            bound = ele.getBoundingClientRect();
            bound.pinX = bound.width ? (bound.width/2 - ev.offsetX) : 0; 
            bound.pinY = bound.height ? (bound.height/2 - ev.offsetY) : 0;
            listen(true);
            shift(ev);
        }
        
        return jet.event.hear(ele, "mousedown", start);
    }
};
