import jet from "./index";

export default {
    addProperty:function(obj, property, val, writable, enumerable, overwrite) { 
        overwrite = jet.get("boolean", overwrite, true);
        if (jet.isMapable(property)) {
            const a = jet.is("array", property);
            jet.obj.map(property, (f, i)=>jet.obj.addProperty(obj, a ? f : i, a ? val : f, writable, enumerable, overwrite), false, true);
        } else if (!obj[property] || overwrite) {
            Object.defineProperty(obj, property, {value:val, writable:!!writable, enumerable:!!enumerable});
        }
        return obj;
    },
    getProperty:function(obj, property) {
        if (!property) {return Object.getOwnPropertyNames(obj).map(k=>[k, obj[k]]);}
        if (!jet.isMapable(property)) {return obj[property];}
        return jet.obj.map(property, k=>[k, obj[k]]);
    },
    toArray:function(any) {
        if (any == null) {return [];}
        if (jet.is("array", any)) {return any;}
        if (jet.is("object", any)) {return Object.values(any);}
        if (jet.is("set", any)) {return Array.from(any);}
        if (!jet.isMapable(any)) {return [any];}
        const result = []; 
        jet.obj.map(any, v=>a.push(v));
        return result;
    },
    toStr: function(any) {return jet.isFull(any) ? String(any) : "";},
    indexOf: function(obj, val) {var o = jet.get("object", obj); if (o.indexOf) {return o.indexOf(val);} for (var i in o) {if (o[i] === val) {return i;}}},
    get: function(obj, path, def) {
        let [o, pa] = jet.get([["mapable", obj], ["array", path, jet.get("string", path).split(".")]]);
        for (let p of pa) {if (jet.isEmpty(o) || !jet.isMapable(o)) {return def;}; o = o[p];}
        return o;
    },
    set: function(obj, path, val, force) {
        const pa = jet.get("array", path, jet.get("string", path).split("."));
        let o = jet.get("mapable", obj, isNaN(Number(pa[0])) ? {} : []), r = o;
        for (let [i, p] of pa.entries()) {
            let blank = o[p] == null, last = i === pa.length-1;
            if (!force && blank !== last) {return false;}
            o = o[p] = last ? val : !jet.isMapable(o[p]) ? isNaN(Number(pa[i+1])) ? {} : [] : o[p];
        };
        return r;
    },
    join: function(obj, comma, equation, lQuote, rQuote) {
        let [j, c, e, r, l] = jet.get(["string", ["string", comma, ", "], ["string", equation], ["string", rQuote], ["string", lQuote]]);
        jet.obj.map(obj, (v,k)=>{v = jet.obj.toStr(v); j += v ? (j?c:"")+((e?(l+k+l+e):"")+(r+v+r)) : "";});
        return j;
    },
    merge: function(...objs) {
        let result;
        objs.map(obj=>jet.obj.map(obj, (v,k,p)=>result = jet.obj.set(result, p, v, true), true));
        return result;
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
    }
};