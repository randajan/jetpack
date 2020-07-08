import temp from "./temp";
import num from "./num";
import str from "./str";
import color from "./color";
import time from "./time";
import obj from "./obj";
import arr from "./arr";
import rnd from "./rnd";
import test from "./test";
import zoo from "./zoo";
import web from "./web";
import event from "./event";
import Amount from "./Amount";
import Engage from "./Engage";

const jet = {
    type:function(any, all) {
        const td = typeof any, r = all ? [] : undefined; if (any == null) { return r; }
        for (let type of temp.type.list) {
            if (!type.is || !type.is(any, td)) { continue; }
            if (r) { r.push(type.name) } else { return type.name; }
        }
        if (!r) { return td; } else { r.push(td); return r; }
    },
    to:function(type, any, ...args) {
        const typeFrom = jet.type(any), from = temp.type.index[typeFrom];
        if (type === typeFrom) { return any; }
        if (!from) { return jet.create(type); }
        const exe = from.conv[type] || from.conv["*"]; 
        return exe ? jet.to(type, exe(any, ...args), ...args) : jet.create(type, any);
    },
    isMapable:function(any) {const t = temp.type.index[jet.type(any)]; return !!(t && t.map);},
    isFull:function(any) {
        const type = jet.type(any);
        if (type === "array") { return !!any.length; }
        const map = jet.key.map(any);
        if (map) { for (let i of map) {return true;} return false; }
        return type === "boolean" || any === 0 || !!any;
    },
    isEmpty:function(any) {return !jet.isFull(any);},
    is:function(type, any, inclusive) {
        const t = typeof type;
        if (t === "function" || t === "object") {return any instanceof type;} //is instance comparing
        if (type === "mapable") {return jet.isMapable(any);}
        if (type === "empty") {return jet.isEmpty(any);}
        if (type === "full") {return jet.isFull(any);}
        return inclusive ? jet.type(any, true).includes(type) : type === jet.type(any);
    },
    create:function(type, ...args) {const t = temp.type.index[type]; return (t && t.create) ? t.create(...args) : null;},
    copy:function(any, ...args) {const t = temp.type.index[jet.type(any)]; return (t && t.copy) ? t.copy(any, ...args) : any},
    factory:function(create, copy, type, ...args) {
        const map = jet.key.map(type);
        if (map) {
            for (let [k,v] of map) {type[k] = jet.factory(create, copy, ...(jet.is("array", v) ? v : [v]));}
            return type;
        }
        for (let v of args) {if (jet.is(type, v)) {return copy ? jet.copy(v) : v;}}
        if (create) {return jet.create(type);}
    },
    filter:function(...args) {return jet.factory(false, false, ...args);},
    get:function(...args) {return jet.factory(true, false, ...args);},
    pull:function(...args) {return jet.factory(true, true, ...args);},
    untie:function(args) {
        args = jet.get("object", args);
        const keys = Object.keys(args);
        const first = args[keys[0]];
        if (!jet.isMapable(first)) {return Object.values(args);}
        const isArray = jet.is("array", first);
        return keys.map((v,k)=>jet.isFull(first[isArray?k:v]) ? first[isArray?k:v] : k > 0 ? args[v] : undefined);
    },
    key:{
        touch: function(op, any, key, val) {
            const t = temp.type.index[jet.type(any)]; 
            if (t && t[op]) {return t[op](any, key, val);}
        },
        map: function(any) {return jet.key.touch("map", any);},
        get: function(...args) {return jet.key.touch("get", ...args);},
        set: function(...args) {return jet.key.touch("set", ...args);},
        rem: function(...args) {return jet.key.touch("rem", ...args);}
    },
    run:function(any, ...args) {
        if (jet.is("function", any)) {return any(...args);}
        return jet.isMapable(any) ? jet.obj.map(any, f=>jet.run(f, ...args)) : undefined;
    },
    temp,
    num,
    str,
    color,
    time,
    obj,
    arr,
    rnd,
    test,
    web,
    event,
    Amount,
    Engage,
    ...zoo
};

export default jet;