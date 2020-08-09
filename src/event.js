import jet from "./jet";

const W = window;
const D = document;
const B = D.body;
const H = D.documentElement;

const enumerable = true;
const DRAG = {
    evmap:{ mousedown:"start", touchstart:"start", mouseup:"stop", touchend:"stop", mousemove:"move", touchmove:"move" },
    evlist:["mousemove", "touchmove", "mouseup", "touchend"],
    bounds:[ 
        "state", "left", "right", "top", "bottom", "width", "height", "parent",
        "pickX", "pickY", "startX", "startY", "lastX", "lastY"
    ]
}

export default {
    stop(ev, bubbling) {
        if (!ev) { return; }
        if (ev.preventDefault) {ev.preventDefault();}
        if (ev.stopBubbling && bubbling) {ev.stopBubbling();}
    },
    listen(bol, ele, type, handler, opt) {
        [type, handler, bol] = jet.get([["string", type, "click"], ["function", handler], ["boolean", bol, true]]);
        const b = handler ? bol : !bol; 
        (ele || D)[(b ? "add" : "remove")+"EventListener"](type, handler||jet.event.stop, opt);
        return _=>jet.event.listen(!bol, ele, type, handler);
    },
    hear(ele, type, handler, opt) { return jet.event.listen(true, ele, type, handler, opt); },
    deaf(ele, type, handler, opt) { return jet.event.listen(false, ele, type, handler, opt); },

    listenDrag(ele, onDrag) {
        [ele, onDrag] = jet.get([["element", ele], ["function", onDrag]]);
        
        let _b, parent;
        const bound = Object.defineProperties({}, {
            time:{enumerable, get:_=>(_b.stopTime || new Date())-_b.startTime},
            x:{enumerable, get:_=>_b.x, set:v=>_b.x=jet.num.to(v)},
            y:{enumerable, get:_=>_b.y, set:v=>_b.y=jet.num.to(v)},
            relX:{enumerable, get:_=>_b.x/_b.parent.width, set:v=>_b.x=jet.num.to(v)*_b.parent.width},
            relY:{enumerable, get:_=>_b.y/_b.parent.height, set:v=>_b.y=jet.num.to(v)*_b.parent.height},
            distX:{enumerable, get:_=>_b.x-_b.startX},
            distY:{enumerable, get:_=>_b.y-_b.startY},
            dist:{enumerable, get:_=>Math.sqrt(Math.pow(bound.distX, 2)+Math.pow(bound.distY, 2))},
            dirX:{enumerable, get:_=>bound.distX > 0 ? "right" : "left" },
            dirY:{enumerable, get:_=>bound.distY > 0 ? "down" : "up"},
            dir:{enumerable, get:_=>Math.abs(bound.distX) > Math.abs(bound.distY) ? bound.dirX : bound.dirY}
        }); 

        DRAG.bounds.map(k=>Object.defineProperty(bound, k, {enumerable, get:_=>_b[k]}));

        function move(ev) {
            const state = ev ? DRAG.evmap[ev.type] : "init";
            const init = (state === "start" || state === "init");

            if (init) { parent = jet.web.getParent(ele); }
            if (!parent) { return; }
            if (init) { _b = jet.web.getBound(ele); }

            const pb = _b.parent = jet.web.getBound(parent);
            const pos = jet.obj.get(ev, "changedTouches.0", ev) || { clientX:_b.left, clientY:_b.top };
            
            if (init) {
                _b.startTime = new Date();
                _b.pickX = (_b.width/2 - (pos.clientX-_b.left)) || 0;
                _b.pickY = (_b.height/2 - (pos.clientY-_b.top)) || 0;
            }

            _b.state = state;
            _b.x = (pos.clientX - pb.left + _b.pickX) || 0;
            _b.y = (pos.clientY - pb.top + _b.pickY) || 0;

            if (init) { _b.prevX = _b.startX = _b.x; _b.prevY = _b.startY = _b.y; }
            if (state === "stop") { _b.stopTime = new Date(); }
            if (state !== "move") { DRAG.evlist.map(ev=>jet.event.listen(state === "start", D, ev, move)); }

            onDrag(ev, bound);
            _b.prevX = _b.x; _b.prevY = _b.y;
        };

        const cleanUp = ["mousedown", "touchstart"].map(k=>jet.event.hear(ele, k, move, {pasive:false}));
        move();
        return _=>jet.run(cleanUp);
    },
    listenShift(ele, onShift, initX, initY, absolute) {
        [ele, onShift] = jet.get([["element", ele], ["function", onShift]]);

        function set(x, y) {
            ele.style.left = absolute ? x+"px" : (x*100)+"%";
            ele.style.top = absolute ? y+"px" : (y*100)+"%";
        }

        set(jet.num.to(initX), jet.num.to(initY));

        return jet.event.listenDrag(ele, (ev, bound)=>{
            jet.event.stop(ev);
            onShift(ev, bound);
            set(absolute ? bound.x : bound.relX, absolute ? bound.y : bound.relY);
        }, true)
    },
    listenSwipe(ele, onSwipe, allowDir, minDist, maxTime) {
        [onSwipe, minDist, maxTime] = jet.get([["function", onSwipe], ["number", minDist, 150], ["number", maxTime, 500]]);
        allowDir = jet.arr.wrap(allowDir);
        return jet.event.listenDrag(ele, (ev, bound)=>{
            const { state, time, dist, dir } = bound;
            jet.event.stop(ev);
            if (state !== "stop" || time > maxTime || dist < minDist || (allowDir.length && !allowDir.includes(dir))) { return; }
            onSwipe(ev, bound);
        });
    }
};
