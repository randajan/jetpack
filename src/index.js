import jet from "./jet";

jet.type.define = function(priority, name, body, create, copy, map, get, set, rem) {
    const types = jet.temp.types;
    if (types[name]) {console.log(name, "type name is allready taken!!!"); return false;}
    if (map) {
        get = get || ((_, k)=>_[k]);
        set = set || ((_, k, v)=>_[k] = v);
        rem = rem || ((_, k)=>delete _[k]);
    }
    return !!(types[name] = {priority, name, body, create, copy, map, get, set, rem});
};

jet.type.define(-3, "mapable", null, (...a)=>new Array(...a), _=>jet.copy(_)); //map is hardcoded special type

jet.type.define(-2, "object", Object, (...a)=>new Object(...a), _=>Object.defineProperties({}, Object.getOwnPropertyDescriptors(_)), _=>Object.entries(_));
jet.type.define(-2, "function", Function, (...a)=>new Function(...a), _=>Object.defineProperties(({[_.name]:(...a)=>_(...a)})[_.name], Object.getOwnPropertyDescriptors(_)));
jet.type.define(-1, "array", Array, (...a)=>new Array(...a), _=>Array.from(_), _=>_.entries());
jet.type.define(-1, "boolean", Boolean, Boolean);
jet.type.define(-1, "string", String, String);
jet.type.define(-1, "number", Number, Number);
jet.type.define(-1, "symbol", Symbol, Symbol);
jet.type.define(-1, "regexp", RegExp, RegExp, _=>RegExp(_.source));
jet.type.define(-1, "element", Element);

jet.type.define(-1, "set", Set, (...a)=>new Set(...a), _=>new Set(_), _=>_.entries(), (_,k)=>_.has(k)?k:undefined, (_,k,v)=>_.delete(k)?_.add(v):undefined, (_,k)=>_.delete(k));
jet.type.define(-1, "map", Map, (...a)=>new Map(...a), _=>new Map(_));

/*EXTEND STRING PROTOTYPE*/

jet.obj.map(jet.str, f=>jet.obj.addProperty(String.prototype, f.name, function(...args) {return f(this, ...args);}));

export default jet;
