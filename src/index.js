import temp from "./temp";
import num from "./num";
import str from "./str";
import color from "./color";
import time from "./time";
import obj from "./obj";
import arr from "./arr";
import rnd from "./rnd";
import test from "./test";

const jet = {

    type:function(any, all) {
        if (any == null) {return;}
        let types = temp.types, td = typeof any, r = [types[td]||{priority:-3, name:td}];
        for (let n in types) {let t = types[n]; if (n !== td && t.body && any instanceof t.body) {r.push(t);}}
        r = r.sort((a,b)=>b.priority-a.priority).map(_=>_.name);
        return all ? r : r[0];
    },
    isMapable:function(any) {const t = jet.temp.types[jet.type(any)]; return !!(t && t.keys);},
    isEmpty:function(any) {
        const a = typeof any;
        if (!jet.isMapable(any)) {return a !== "boolean" && any !== 0 && !any;}
        for (let i in any) {return false;} return true;
    },
    isFull:function(any) {return !jet.isEmpty(any);},
    is:function(type, any, inclusive) { //special recognize "array", "element", "empty", "full", "mapable"
        const t = typeof type;
        if (t === "function" || t === "object") {return any instanceof type;} //is object comparing?
        if (type === "mapable") {return jet.isMapable(any);}
        if (type === "empty") {return jet.isEmpty(any);}
        if (type === "full") {return jet.isFull(any);}
        return inclusive ? jet.type(any, true).includes(type) : type === jet.type(any);
    },
    create:function(type, ...args) {const t = jet.temp.types[type]; return (t && t.create) ? t.create(...args) : null;},
    copy:function(any) {const t = temp.types[jet.type(any)]; return (t && t.copy) ? t.copy(any) : any},
    factory:function(create, copy, type, ...args) {
        if (jet.isMapable(type)) {
            for (let i in type) {type[i] = jet.factory(create, copy, ...type[i]);}
            return type;
        }
        for (let v of args) {if (jet.is(type, v)) {return copy ? jet.copy(v) : v;}}
        if (create) {return jet.create(type);}
    },
    filter:function(...args) {return jet.factory(false, false, ...args);},
    get:function(...args) {return jet.factory(true, false, ...args);},
    pull:function(...args) {return jet.factory(true, true, ...args);},

    keys:function(any) {const t = jet.temp.types[jet.type(any)]; return (t && t.keys) ? t.keys(any) : null;},
    run:function(any, ...args) {
        if (jet.is("function", any)) {return any(...args);}
        return jet.obj.map(any, f=>console.log(f), true);
    },
    temp,
    num,
    str,
    color,
    time,
    obj,
    arr,
    rnd,
    test
};

jet.type.define = function(priority, name, body, create, copy, keys) {
    const types = jet.temp.types;
    if (types[name]) {console.log(name, "type name is allready taken!!!"); return false;}
    return !!(types[name] = {priority, name, body, create, copy, keys});
};

jet.type.define(-3, "mapable", null, (...a)=>new Array(...a), _=>jet.copy(_)); //map is hardcoded special type

jet.type.define(-2, "object", Object, (...a)=>new Object(...a), _=>Object.assign({}, _), _=>Object.keys(_));
jet.type.define(-1, "array", Array, (...a)=>new Array(...a), _=>Array.from(_), _=>_.keys());
jet.type.define(-1, "boolean", Boolean, Boolean);
jet.type.define(-1, "string", String, String);
jet.type.define(-1, "number", Number, Number);
jet.type.define(-1, "symbol", Symbol, Symbol);
jet.type.define(-1, "regexp", RegExp, RegExp, _=>RegExp(_.source));
jet.type.define(-1, "element", Element);
jet.type.define(-1, "function", Function, (...a)=>new Function(...a), _=>(...a)=>_(...a));

jet.type.define(-1, "set", Set, (...a)=>new Set(...a), _=>new Set(_));
jet.type.define(-1, "map", Map, (...a)=>new Map(...a), _=>new Map(_));

/*EXTEND STRING PROTOTYPE*/

jet.obj.map(str, f=>jet.obj.addProperty(String.prototype, f.name, function(...args) {return f(this, ...args);}));

export default jet;
export {temp, num, str, color, time, obj, arr, rnd, test};
