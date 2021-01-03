import jet from "../jet.js";

import Complex from "../custom/Complex";

function getForKey(any, key) { return jet.type.is.map(any) ? any : jet.str.isNumeric(key) ? [] : {}; }

function _audit(includeMapable, ...any) {
    const audit = new Set();
    any.map(a=>jet.map.it(a, (v,p)=>audit.add(p), includeMapable ? (v,p)=>audit.add(p) : true));
    return Array.from(audit).sort((a,b)=>b.localeCompare(a));
}

function _map(any, fce, deep, flat, path) {
    const t = jet.type.raw(any);
    flat = flat ? jet.arr.tap(flat) : null;
    if (!t || !t.pairs) { return flat || any; }

    fce = jet.fce.tap(fce);
    path = jet.arr.to(path, ".");
    const dd = jet.fce.is(deep);
    const level = path.length;
    const res = flat || t.create();
    
    for (let [key, val] of t.pairs(any)) {
        path[level] = key;
        const pkey = path.join(".");
        const dp = deep && jet.type.is.map(val);
        val = dp ? _map(val, fce, deep, flat, pkey) : fce(val, pkey);
        if (dp && dd) { val = deep(val, pkey); }
        if (val === undefined) { continue; }
        if (!flat) { t.set(res, key, val); } else if (!dp) { flat.push(val); } //aftermath
    };
    
    return res;
}


export default {

    it:(any, fce, deep)=>_map(any, fce, deep, true),
    of:(any, fce, deep)=>_map(any, fce, deep),

    dig: function(any, path, def) {
        const pa = jet.str.to(path, ".").split(".");
        for (let p of pa) { if (null == (any = jet.type.key(any, p))) { return def; }}
        return any;
    },
    put: function(any, path, val, force) {
        force = jet.bol.tap(force, true);
        const pa = jet.str.to(path, ".").split("."), pb = [];
        const r = any = getForKey(any, pa[0]);

        for (let [i, p] of pa.entries()) {
            if (val == null) { pb[pa.length-1-i] = [any, p]; } //backpath
            if (!force && any[p] != null && !jet.type.is.map(any[p])) { return r; }
            else if (i !== pa.length-1) { any = jet.type.key.set(any, p, getForKey(any[p], pa[i+1]));}
            else if (val == null) { jet.type.key.rem(any, p);}
            else { jet.type.key.set(any, p, val);}
        };

        for (let [any, p] of pb) {
            if (jet.type.is.full(any[p])) { break; }
            else { jet.type.key.rem(any, p); }
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
        (...any)=>_audit(false, ...any),
        {
            full:(...any)=>_audit(true, ...any),
        }
    ),
    match:function(to, from, fce) {
        fce = jet.fce.tap(fce);
        _audit(true, to, from).map(path=>{
            jet.map.put(to, path, fce(jet.map.dig(to, path), jet.map.dig(from, path), path), true);
        });
        return to;
    },
    compare: function(...any) {
        const res = new Set();
        _audit(false, ...any).map(path=>{
            if (new Set(any.map(a=>jet.map.dig(a, path))).size > 1) {
                const parr = path.split(".");
                parr.map((v,k)=>res.add(parr.slice(0, k+1).join(".")));
            }
        })
        return Array.from(res);
    },
    melt(any, comma) {
        let j = "", c = jet.str.to(comma);
        if (!jet.type.is.map(any)) { return jet.str.to(any, c); }
        jet.map.it(any, v=>{ v = jet.map.melt(v, c); j += v ? (j?c:"")+v : "";});
        return j;
    },
}