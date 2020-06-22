import jet from "./index";

export default {
    to:function(...args) { return jet.to("object", ...args); },
    addProperty:function(obj, property, val, writable, enumerable, overwrite) { 
        overwrite = jet.get("boolean", overwrite, true);
        if (jet.isMapable(property)) {
            const a = jet.is("array", property);
            jet.obj.map(property, (f, i)=>jet.obj.addProperty(obj, a ? f : i, a ? val : f, writable, enumerable, overwrite));
        } else if (!obj[property] || overwrite) {
            Object.defineProperty(obj, property, {value:val, writable:!!writable, configurable:!!writable, enumerable:!!enumerable});
        }
        return obj;
    },
    getProperty:function(obj, property) {
        if (!property) { property = Array.from(Object.getOwnPropertyNames(obj)); }
        if (!jet.isMapable(property)) { return obj[property]; }
        const props = {};
        jet.obj.map(property, k=>props[k]=obj[k]);
        return props;
    },
    indexOf: function(obj, val) { if (obj.indexOf) {return obj.indexOf(val);} for (let i in o) {if (o[i] === val) {return i;}}},
    get: function(obj, path, def) {
        const pa = jet.arr.to(path, ".");
        for (let p of pa) {if (obj == null || !jet.is("object", obj, true)) {return def;}; obj = obj[p];}
        return obj;
    },
    getForSet(obj, key) {
        return jet.is("object", obj, true) ? obj : isNaN(Number(key)) ? {} : [];
    },
    set: function(obj, path, val, force) {
        const pa = jet.arr.to(path, ".");
        const r = obj = jet.obj.getForSet(obj, pa[0]);
        for (let [i, p] of pa.entries()) {
            let blank = obj[p] == null, last = i === pa.length-1;
            if (!force && blank !== last) {return false;}
            obj = obj[p] = last ? val : jet.obj.getForSet(obj[p], pa[i+1]);
        };
        return r;
    },
    map: function(obj, fce, deep, path) {
        obj = jet.pull("mapable", obj);
        fce = jet.get("function", fce);
        deep = deep ? jet.get("function", deep) : false;
        path = jet.arr.to(path, ".");
        const level = path.length;

        for (let [key, val] of Array.from(jet.key.map(obj))) {
            path[level] = key;
            const pkey = path.join(".");
            val = (deep && jet.isMapable(val)) ? deep(jet.obj.map(val, fce, deep, pkey), pkey) : fce(val, pkey);
            if (val !== undefined) { jet.key.set(obj, key, val); } else { jet.key.rem(obj, key); } //aftermath
        };
        
        return obj;
    },
    push:function(to, ...objs) {
        to = jet.get("object", to);
        objs.map(obj=>jet.obj.map(obj, (v,p)=>jet.obj.set(to, p, v, true), true));
        return to;
    },
    values:function(...objs) {
        const vals = new Set();
        objs.map(obj=>jet.obj.map(obj, (v,p)=>vals.add(p), true));
        return Array.from(vals).sort((a,b)=>b.localeCompare(a));
    },
    audit:function(...objs) {
        const audit = new Set();
        objs.map(obj=>jet.obj.map(obj, (v,p)=>audt.add(p), (v,p)=>audit.add(p)));
        return Array.from(audit).sort((a,b)=>b.localeCompare(a));
    },
    reduce:function(...objs) {
        const result = {};
        objs.map(obj=>jet.obj.map(obj, (v,p)=>result[p] = v, true));
        return result;
    },
    expand:function(obj) {
        const result = {};
        jet.obj.map(obj,(v,p)=>jet.obj.set(result, p, v, true));
        return result;
    },
    match:function(to, from, fce) {
        fce = jet.get("function", fce);
        jet.obj.audit(to, from).map(path=>{
            jet.obj.set(to, path, fce(jet.obj.get(to, path), jet.obj.get(from, path), path), true);
        });
        return to;
    },
    compare: function(...objs) {
        const res = new Set();
        jet.obj.values(...objs).map(path=>{
            if (new Set(objs.map(obj=>jet.obj.get(obj, path))).size > 1) {
                const parr = path.split(".");
                parr.map((v,k)=>res.add(parr.slice(0, k+1).join(".")));
            }
        })
        return Array.from(res);
    },
    join: function(obj, comma, equation, lQuote, rQuote) {
        let [j, c, e, r, l] = jet.get(["string", ["string", comma, ","], ["string", equation], ["string", rQuote], ["string", lQuote]]);
        jet.obj.map(obj, (v,k)=>{v = jet.str.to(v); j += v ? (j?c:"")+((e?(l+k+l+e):"")+(r+v+r)) : "";});
        return j;
    },
    merge:function(...objs) { return jet.obj.expand(jet.obj.reduce(...objs)); },
    clone: function(obj, deep) { return jet.obj.map(obj, _=>_, deep); },
    fromJSON: function(json, throwErr) {
        let out;
        try { out = JSON.parse(json); } catch(e) { if (throwErr === true) { throw e } }
        return jet.filter("mapable", out);
    },
    toJSON:function(obj, prettyPrint) {
        const spacing = jet.get("number", prettyPrint === true ? 2 : prettyPrint);
        return JSON.stringify(jet.filter("mapable", obj), null, spacing);
    }
};