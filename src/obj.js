import jet from "./index";

export default {
    to:function(any) { return jet.to("object", any); },
    addProperty:function(obj, property, val, writable, enumerable, overwrite) { 
        overwrite = jet.get("boolean", overwrite, true);
        if (jet.isMapable(property)) {
            const a = jet.is("array", property);
            jet.obj.map(property, (f, i)=>jet.obj.addProperty(obj, a ? f : i, a ? val : f, writable, enumerable, overwrite), false, true);
        } else if (!obj[property] || overwrite) {
            Object.defineProperty(obj, property, {value:val, writable:!!writable, configurable:!!writable, enumerable:!!enumerable});
        }
        return obj;
    },
    getProperty:function(obj, property) {
        if (!property) {return Object.getOwnPropertyNames(obj).map(k=>[k, obj[k]]);}
        if (!jet.isMapable(property)) {return obj[property];}
        return jet.obj.map(property, k=>[k, obj[k]]);
    },
    indexOf: function(obj, val) {var o = jet.get("object", obj); if (o.indexOf) {return o.indexOf(val);} for (var i in o) {if (o[i] === val) {return i;}}},
    get: function(obj, path, def) {
        const pa = jet.filter("array", path) || jet.str.to(path).split(".");
        for (let p of pa) {if (obj == null || !jet.is("object", obj, true)) {return def;}; obj = obj[p];}
        return obj;
    },
    getForSet(obj, key) {
        return jet.is("object", obj, true) ? obj : isNaN(Number(key)) ? {} : [];
    },
    set: function(obj, path, val, force) {
        const pa = jet.filter("array", path) || jet.str.to(path).split(".");
        const r = obj = jet.obj.getForSet(obj, pa[0]);
        for (let [i, p] of pa.entries()) {
            let blank = obj[p] == null, last = i === pa.length-1;
            if (!force && blank !== last) {return false;}
            obj = obj[p] = last ? val : jet.obj.getForSet(obj[p], pa[i+1]);
        };
        return r;
    },
    join: function(obj, comma, equation, lQuote, rQuote) {
        let [j, c, e, r, l] = jet.get(["string", ["string", comma, ","], ["string", equation], ["string", rQuote], ["string", lQuote]]);
        jet.obj.map(obj, (v,k)=>{v = jet.str.to(v); j += v ? (j?c:"")+((e?(l+k+l+e):"")+(r+v+r)) : "";});
        return j;
    },
    merge: function(...objs) {
        let result;
        objs.map(obj=>jet.obj.map(obj, (v,k,p)=>result = jet.obj.set(result, p, v, true), true));
        return result;
    },
    compare: function(obj, mutant, deep, full) {
        const list = new Set();
        const map = jet.obj.map(mutant, (v, k, p)=>{
            if (v === jet.obj.get(obj, p)) { return; }
            if (!full) { let cng = ""; for (let q of p) { list.add(cng += (cng ? "." : "")+q); } }
            return v;
        }, deep);
        return full ? map : Array.from(list);
    },
    clone: function(obj, deep) {
        return jet.obj.map(obj, _=>_, deep);
    },
    map: function(obj, fce, deep, uncover, path) { //uncover = iterate even through non enumerable
        const [o, f, p] = jet.pull([["mapable", obj], ["function", fce], ["array", path]]), d = p.length; 
        const map = uncover ? jet.obj.getProperty(o) : Array.from(jet.key.map(o));

        for (let [k, v] of map) {
            p[d] = k;
            v = (deep && jet.isMapable(v)) ? jet.obj.map(v, f, deep, uncover, p) : f(v, k, p);
            if (v !== undefined) {jet.key.set(o, k, v);} else {jet.key.rem(o, k);}
        };
        
        return o;
    },
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