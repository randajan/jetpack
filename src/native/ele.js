import jet from "../jet.js";
import Complex from "../custom/Complex";

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
    find(query, all) {
        return all ? document.querySelectorAll(query) : document.querySelector(query);
    },
    parent(ele) {
        return jet.ele.is(ele) ? ele.parentElement || ele.parentNode : undefined;
    },
    scroll(ele) {
        const s = "scroll", c = "client";
        let w = window, h = document.documentElement, b = document.body;
        const real = (ele !== b && jet.ele.is(ele));
        if (real) { w = h = b = ele; }
        return jet.map.of({top:"Y", left:"X"}, (v, k)=>{
            let d = jet.str.capitalize(k);
            let scroll = jet.num.tap(w["page"+v+"Offset"], h[s+d], b[s+d]);
            let client = jet.num.tap(h[c+d], b[c+d]);
            return scroll-client;
        });
    },
    bound(ele, offset, client) {
        if (!jet.ele.parent(ele)) { return {}}
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
    listen:new Complex(
        (ele, type, handler, opt, append)=>{
            ele = jet.ele.only(ele) || document;
            type = jet.str.tap(type, "click");
            handler = jet.fce.tap(handler, jet.ele.listen.cut);
            append = jet.bol.tap(append, true);
            ele[(append ? "add" : "remove")+"EventListener"](type, handler, opt);
            return _=>jet.ele.listen(ele, type, handler, opt, !append);
        },
        {
            cut(ev, bubbling) {
                if (!ev) { return; }
                if (ev.preventDefault) { ev.preventDefault(); }
                if (ev.stopBubbling && bubbling) { ev.stopBubbling(); }
            },
            drift(ele, onDrag, opt) {
                ele = jet.ele.tap(ele);
                onDrag = jet.fce.tap(onDrag);
                opt = jet.obj.tap(opt);

                opt.up = jet.num.tap(opt.up, 1);
                opt.left = jet.num.tap(opt.left, 1);
                opt.right = jet.num.tap(opt.right, 1);
                opt.down = jet.num.tap(opt.down, 1);

                let { autoPick, appendState } = opt;
        
                let _b, parent = jet.ele.parent(ele);
                const bound = Object.defineProperties({}, {
                    time:{enumerable, get:_=>(_b.stopTime || new Date())-_b.startTime},
                    x:{enumerable, get:_=>_b.x, set:v=>_b.x=jet.num.to(v)},
                    y:{enumerable, get:_=>_b.y, set:v=>_b.y=jet.num.to(v)},
                    relX:{enumerable, get:_=>_b.x/_b.parent.width, set:v=>_b.x=jet.num.to(v)*_b.parent.width},
                    relY:{enumerable, get:_=>_b.y/_b.parent.height, set:v=>_b.y=jet.num.to(v)*_b.parent.height},
                    distX:{enumerable, get:_=>_b.x-_b.startX, set:v=>_b.x=_b.startX+v},
                    distY:{enumerable, get:_=>_b.y-_b.startY, set:v=>_b.y=_b.startY+v},
                    dist:{enumerable, get:_=>Math.sqrt(Math.pow(bound.distX, 2)+Math.pow(bound.distY, 2))},
                    dirX:{enumerable, get:_=>bound.distX > 0 ? "right" : "left" },
                    dirY:{enumerable, get:_=>bound.distY > 0 ? "down" : "up"},
                    dir:{enumerable, get:_=>Math.abs(bound.distX) > Math.abs(bound.distY) ? bound.dirX : bound.dirY}
                }); 
        
                DRAG.bounds.map(k=>Object.defineProperty(bound, k, {enumerable, get:_=>_b[k]}));
        
                function move(ev) {
                    if (!parent) { return; }
                    const state = ev ? DRAG.evmap[ev.type] : "init";
                    const init = (state === "start" || state === "init");
        
                    if (init) { 
                        _b = jet.ele.bound(ele);
                        _b.parent = jet.ele.bound(parent);
                    }
                    const pos = jet.map.dig(ev, "changedTouches.0", ev) || { clientX:_b.left+_b.width/2, clientY:_b.top+_b.height/2 };
        
                    if (init) {
                        _b.startTime = new Date();
                        _b.pickX = autoPick ? 0 : (_b.width/2 - (pos.clientX-_b.left)) || 0;
                        _b.pickY = autoPick ? 0 : (_b.height/2 - (pos.clientY-_b.top)) || 0;
                    }
        
                    _b.state = state;
                    _b.x = (pos.clientX - _b.parent.left + _b.pickX) || 0;
                    _b.y = (pos.clientY - _b.parent.top + _b.pickY) || 0;
        
                    if (init) { _b.prevX = _b.startX = _b.x; _b.prevY = _b.startY = _b.y; }
                    
                    if (state === "stop") { _b.stopTime = new Date(); }
                    if (state === "stop" || state === "start") {
                        DRAG.evlist.map(ev=>[
                            jet.ele.listen(document, ev, move, null, state === "start"),
                            DRAG.evmap[ev] === "move" ? jet.ele.listen(ele, ev, null, null, state === "start") : null
                        ]);
                    } 
                    if (state === "stop" || state === "move") {
                        bound.distX = bound.distX*opt[bound.dirX];
                        bound.distY = bound.distY*opt[bound.dirY];
                    }
                    if (appendState) {
                        if (state === "move") { ele.setAttribute("data-drift", [bound.dirY, bound.dirX].join(" ")); }
                        else { ele.removeAttribute("data-drift"); }
                    }
                    
                    onDrag(ev, bound);
                    _b.prevX = _b.x; _b.prevY = _b.y;
                };
        
                const cleanUp = ["mousedown", "touchstart"].map(k=>[
                    jet.ele.listen(ele, k, move, {pasive:false}),
                    autoPick ? jet.ele.listen(parent, k, move, {pasive:false}) : null,
                ]);
        
                move();
                return _=>jet.fce.run(cleanUp);
            },
            drag(ele, onShift, opt) {
                opt = jet.obj.tap(opt);
                ele = jet.ele.tap(ele);
                onShift = jet.fce.tap(onShift);

                let { initX, initY, absolute, autoReset } = opt;
        
                function set(x, y) {
                    ele.style.left = absolute ? x+"px" : (x*100)+"%";
                    ele.style.top = absolute ? y+"px" : (y*100)+"%";
                }
        
                set(jet.num.to(initX), jet.num.to(initY));
        
                return jet.ele.listen.drift(ele, (ev, bound)=>{
                    onShift(ev, bound);
                    if (bound.state === "move") { jet.ele.listen.cut(ev); }
                    if (bound.state === "stop" && autoReset) { set(initX, initY); }
                    else { set(absolute ? bound.x : bound.relX, absolute ? bound.y : bound.relY); }
                }, opt)
            },
            swipe(ele, onSwipe, opt) {
                opt = jet.obj.tap(opt);

                onSwipe = jet.fce.tap(onSwipe);

                opt.autoReset = true;
                opt.autoPick = false;
                opt.up = jet.num.tap(opt.up);
                opt.left = jet.num.tap(opt.left);
                opt.right = jet.num.tap(opt.right);
                opt.down = jet.num.tap(opt.down);
                opt.minDist = jet.num.tap(opt.minDist, 50);
                opt.maxTime = jet.num.tap(opt.maxTime, 500);

                let { minDist, maxTime } = opt;

                return jet.ele.listen.drag(ele, (ev, bound)=>{
                    const { state, time, dist } = bound;
                    if (state === "stop" && time < maxTime && dist > minDist) { onSwipe(ev, bound); }
                }, opt);
            }
        }
    )
};
