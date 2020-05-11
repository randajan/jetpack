import jet from "./jet";

const W = window;
const D = document;
const B = D.body;
const H = D.documentElement;

export default {
    stop(ev) { ev.preventDefault(); },
    listen(bol, ele, type, handler) {
        [type, handler, bol] = jet.get([["string", type, "click"], ["function", handler], ["boolean", bol, true]]);
        bol = handler ? bol : !bol; 
        (ele || D)[(bol ? "add" : "remove")+"EventListener"](type, handler||jet.event.stop);
        return _=>jet.event.deaf(ele, type, handler);
    },
    hear(ele, type, handler) { return jet.event.listen(true, ele, type, handler); },
    deaf(ele, type, handler) { return jet.event.listen(false, ele, type, handler); },

    listenShift(ele, handler) {
        let bound;
        handler = jet.filter("function", handler, (state, left, top)=>{
            ele.style.top = (top*100)+"%"; 
            ele.style.left = (left*100)+"%"; 
        });

        function listen(bol) {
            jet.event.listen(bol, D, "mousemove", move); 
            jet.event.listen(bol, D, "mouseup", stop);
        }

        function step(ev, state, left, top) {
            if (handler(state, left, top, ev) !== false) { jet.event.stop(ev);}
        };

        function stop(ev) {
            listen(false);
            step(ev, "stop");
        }

        function start(ev) {
            bound = jet.web.getBound(ele); 
            bound.x = bound.width ? (bound.width/2 - ev.offsetX) : 0; 
            bound.y = bound.height ? (bound.height/2 - ev.offsetY) : 0;
            listen(true);
            step(ev, "start");
        }

        function move(ev) {
            const p = jet.web.getBound(jet.web.getParent(ele)), c = jet.web.getScroll();
            if (p.width && p.height) {
                const left = (ev.clientX + c.left - p.left + bound.x) / p.width;
                const top = (ev.clientY + c.top - p.top + bound.y) / p.height;
                step(ev, "move", left, top);
            }
        };

        return jet.event.hear(ele, "mousedown", start);
    }
};
