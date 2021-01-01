import jet from "../jet.js";

import Complex from "../custom/Complex";

function touch(any, op, ...args) {
    const t = jet.type.raw(any);
    if (t && t[op]) { return t[op](any, ...args); }
}

function getForKey(any, key) { return jet.type.is.map(any) ? any : jet.str.isNumeric(key) ? [] : {}; }

function audit(includeMapable, ...any) {
    const audit = new Set();
    any.map(a=>jet.map.it(a, (v,p)=>audit.add(p), includeMapable ? (v,p)=>audit.add(p) : true));
    return Array.from(audit).sort((a,b)=>b.localeCompare(a));
}

function map(any, fce, deep, path, collect) {
    const t = jet.type.raw(any); 
    if (!t || !t.pairs) { return; }

    fce = jet.fce.tap(fce);
    deep = deep ? jet.fce.tap(deep) : false;
    path = jet.arr.to(path, ".");
    const level = path.length;
    let result = collect ? t.create() : 0;

    for (let [key, val] of t.pairs(any)) {
        path[level] = key;
        const pkey = path.join(".");
        val = (deep && jet.type.is.map(val)) ? deep(map(val, fce, deep, pkey, collect), pkey) : fce(val, pkey);
        if (!collect) { result += (val || 1); }
        else if (val !== undefined) { t.set(result, key, val); } //aftermath
    };
    
    return result;
}


export default {
    keys:any=>touch(any, "keys"),
    vals:any=>touch(any, "vals"),
    pairs:any=>touch(any, "pairs"),
    get:(any, key)=>touch(any, "get", key),
    set:(any, key, val)=>touch(any, "set", key, val),
    rem:(any, key)=>touch(any, "rem", key),

    it:(any, fce, deep, path)=>map(any, fce, deep, path, false),
    of:(any, fce, deep, path)=>map(any, fce, deep, path, true),

    dig: function(any, path, def) {
        const pa = jet.str.to(path, ".").split(".");
        for (let p of pa) { if (null == (any = jet.map.get(any, p))) { return def; }}
        return any;
    },
    put: function(any, path, val, force) {
        force = jet.bol.tap(force, true);
        const pa = jet.str.to(path, ".").split("."), pb = [];
        const r = any = getForKey(any, pa[0]);

        for (let [i, p] of pa.entries()) {
            if (val == null) { pb[pa.length-1-i] = [any, p]; } //backpath
            if (!force && any[p] != null && !jet.type.is.map(any[p])) { return r; }
            else if (i !== pa.length-1) { any = jet.map.set(any, p, getForKey(any[p], pa[i+1]));}
            else if (val == null) { jet.map.rem(any, p);}
            else { jet.map.set(any, p, val);}
        };

        for (let [any, p] of pb) {
            if (jet.type.is.full(any[p])) { break; }
            else { jet.map.rem(any, p); }
        };
        return r;
    },
    deflate:function(...any) {
        const result = {};
        any.map(a=>jet.map.it(a, (v,p)=>result[p] = v, true));
        return result;
    },
    inflate:function(any) {
        const result = {};
        jet.map.it(any, (v,p)=>jet.map.put(result, p, v, true));
        return result;
    },
    merge:function(...any) { return jet.map.inflate(jet.map.deflate(...any)); },
    clone:function(any, deep) { return jet.map.of(any, _=>_, deep); },
    audit:new Complex(
        (...any)=>audit(false, ...any),
        {
            full:(...any)=>audit(true, ...any),
        }
    ),
    match:function(to, from, fce) {
        fce = jet.fce.tap(fce);
        audit(true, to, from).map(path=>{
            jet.map.put(to, path, fce(jet.map.dig(to, path), jet.map.dig(from, path), path), true);
        });
        return to;
    },
    compare: function(...any) {
        const res = new Set();
        audit(false, ...any).map(path=>{
            if (new Set(any.map(a=>jet.map.dig(a, path))).size > 1) {
                const parr = path.split(".");
                parr.map((v,k)=>res.add(parr.slice(0, k+1).join(".")));
            }
        })
        return Array.from(res);
    },
    melt(any, comma) {
        let j = "", c = jet.str.to(comma);
        return jet.map.it(any, v=>{
            v = jet.map.melt(v, c);
            j += v ? (j?c:"")+v : "";
        }) === undefined ? jet.str.to(any, c) : j
    },
}