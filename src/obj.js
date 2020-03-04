import jet from "./index";

export default {
    addProperty:function(obj, property, val, writable, enumerable) { 
        if (jet.is("string", property)) {Object.defineProperty(obj, property, {value:val, writable:!!writable, enumerable:!!enumerable}); return obj;}
        var a = jet.is("array", property);
        jet.obj.map(property, function(f, i) {jet.obj.addProperty(obj, a ? f : i, a ? val : f, writable, enumerable);}, false, true);
        return obj;
    },
    toArray:function(any) {
        if (jet.is("array", any)) {return any;} else if (!jet.is("object", any) || any.length === null) {return [any];}
        return Array.from(any);
    },
    indexOf: function(obj, val) {var o = jet.get("object", obj); if (o.indexOf) {return o.indexOf(val);} for (var i in o) {if (o[i] === val) {return i;}}},
    get: function(obj, path, def) {
        let [o, pa] = jet.get([["mapable", obj], ["array", path, jet.get("string", path).split(".")]]);
        for (let p of pa) { o = o[p]; if (jet.isEmpty(o) || !jet.isMapable(o)) {return def;};}
        return o;
    },
    set: function(obj, path, val, force) {
        const pa = jet.get("array", path, jet.get("string", path).split("."));
        let o = jet.get("mapable", obj, isNaN(Number(pa[0])) ? {} : []), r = o;
        for (let [i, p] of pa.entries()) {
            let blank = o[p] == null, last = i === pa.length-1;
            if (!force && blank !== last) {return false;}
            o = o[p] = last ? val : blank ? isNaN(Number(pa[i+1])) ? {} : [] : o[p];
        };
        return r;
    },
    join: function(obj, comma, equation, lQuote, rQuote) {
        const [o, c, e, r, l] = jet.get([["mapable", obj], ["string", comma, ", "], ["string", equation], ["string", rQuote], ["string", lQuote]]);
        let n = ""; for (var i in o) {if (e || jet.isFull(o[i])) {n += (n?c:"")+((e?(l+i+l+e):"")+(r+o[i]+r));}} return n;
    },
    // clean: function(obj, any) {
    //     var o = obj, a = jet.is("array", o), g = arguments, r = 0;
    //     for (var i=1; i<g.length; i++) {var x = jet.obj.indexOf(o, g[i]); if (x != null) {if (a) {o.splice(x, 1);} else {delete o[x];} r ++;}}
    //     return r;
    // },
    // copy: function(to, from, deep, flat, filter, uniq) {
    //     var f = from, fa = jet.is("array", f), t = (!to ? (fa ? [] : {}) : to), ta = jet.is("array", t), r = filter, u = uniq;
    //     var d = deep, p = jet.is("number", d) ? d-1 : d, l = flat, n = l && jet.is("boolean", l) ? [(ta ? t.length : 0)-1] : l;
    //     for (var i in f) {
    //         var o = d && jet.is("object", f[i]), c = o ? jet.obj.copy((l?t:null), f[i], p, n, r, u) : f[i];
    //         if (!(l && o) && (!r || jet.is(r, c))) {if (u) {jet.obj.clean(t, c);} if (ta) {t.push(f[i]);} else {t[((l && fa) ? (n[0] += 1) : i)] = f[i];}}
    //     } return t;
    // },
    copy: function(obj) {
        return jet.obj.map(obj, _=>_, true);
    },
    map: function(obj, fce, deep, uncover, path) { //uncover = iterate even through non enumerable
        const [o, f, p] = jet.pull([["mapable", obj], ["function", fce], ["array", path]]), d = p.length; 
        const m = uncover ? Object.getOwnPropertyNames(o) : jet.keys(o);
        for (let k of m) {
            let v = o[k]; p[d] = k;
            o[k] = (deep && jet.isMapable(v)) ? jet.obj.map(v, f, deep, uncover, p) : f(v, k, p);
        };
        return o;
    },
    // mirror:function(to, from) {
    //     var t = jet.filter("object", to, {}), f = from, at = jet.is("array", t), af = jet.is("array", f); if (!jet.is("object", from)) {return t;}
    //     for (var i in f) {var fi = f[i]; if (jet.is("number", fi) || (!at && jet.is("string", fi))) {t[fi] = af ? Number(i) : i;}} 
    //     return t;
    // }
};