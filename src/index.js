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
    isMap:function(any) {const t = jet.temp.types[jet.type(any)]; return !!(t && t.mapable);},
    isEmpty:function(any) {
        const a = typeof any;
        if (!jet.isMap(any)) {return a !== "boolean" && any !== 0 && !any;}
        for (let i in any) {return false;} return true;
    },
    isFull:function(any) {return !jet.isEmpty(any);},
    is:function(type, any, inclusive) { //special recognize "array", "element", "empty", "full", "map"
        const t = typeof type;
        if (t === "function" || t === "object") {return any instanceof type;} //is object comparing?
        if (type === "map") {return jet.isMap(any);}
        if (type === "empty") {return jet.isEmpty(any);}
        if (type === "full") {return jet.isFull(any);}
        return inclusive ? jet.type(any, true).includes(type) : type === jet.type(any);
    },
    create:function(type, ...args) {const t = jet.temp.types[type]; return (t && t.create) ? t.create(...args) : null;},
    copy:function(any) {const t = temp.types[jet.type(any)]; return (t && t.copy) ? t.copy(any) : any},
    factory:function(create, copy, type, ...args) {
        if (jet.isMap(type)) {
            for (let i in type) {type[i] = jet.factory(create, copy, ...type[i]);}
            return type;
        }
        for (let v of args) {if (jet.is(type, v)) {return copy ? jet.copy(v) : v;}}
        if (create) {return jet.create(type);}
    },
    filter:function(...args) {return jet.factory(false, false, ...args);},
    get:function(...args) {return jet.factory(true, false, ...args);},
    pull:function(...args) {return jet.factory(true, true, ...args);},

    run:function(f, ...args) {
        if (jet.isMap(f)) {let c = 0; for (let i in f) {c += jet.run(f[i], ...args);} return c;}
        if (jet.is("function", f)) { f(...args); return true;} else {return false;}
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

jet.type.define = function(priority, name, body, create, copy, mapable) {
    const types = jet.temp.types;
    if (types[name]) {console.log(name, "type name is allready taken!!!"); return false;}
    return !!(types[name] = {priority, name, body, create, copy, mapable});
};

jet.type.define(-3, "map", null, (...a)=>new Array(...a), _=>jet.copy(_), true); //map is hardcoded special type

jet.type.define(-2, "object", Object, (...a)=>new Object(...a), _=>Object.assign({}, _), true);
jet.type.define(-1, "array", Array, (...a)=>new Array(...a), _=>Array.from(_), true);
jet.type.define(-1, "boolean", Boolean, Boolean);
jet.type.define(-1, "string", String, String);
jet.type.define(-1, "number", Number, Number);
jet.type.define(-1, "symbol", Symbol, Symbol);
jet.type.define(-1, "regexp", RegExp, RegExp, _=>RegExp(_.source));
jet.type.define(-1, "element", Element);
jet.type.define(-1, "function", Function, _=>new Function, _=>(...a)=>_(...a));

/*EXTEND STRING PROTOTYPE*/

jet.obj.map(str, f=>jet.obj.addProperty(String.prototype, f.name, function(...args) {return f(this, ...args);}));

export default jet;
export {temp, num, str, color, time, obj, arr, rnd, test};
