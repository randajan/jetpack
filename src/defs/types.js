import jet from "../jet";

jet.type.define = function(priority, name, is, create, copy, map, get, set, rem) {
    const types = jet.temp.types;
    if (types[name]) {throw "Type '" + name + "' can't be redefined!!!";}
    if (map) {
        get = get || ((_, k)=>_[k]);
        set = set || ((_, k, v)=>_[k] = v);
        rem = rem || ((_, k)=>delete _[k]);
    }
    return !!(types[name] = {priority, name, is, create, copy, map, get, set, rem, conv:{}});
};

jet.type.define(-3, "mapable", null, (...a)=>new Array(...a), _=>jet.copy(_)); //map is hardcoded special type

jet.type.define(-2, "object", _=>_ instanceof Object, (...a)=>new Object(...a), _=>Object.defineProperties({}, Object.getOwnPropertyDescriptors(_)), _=>Object.entries(_));
jet.type.define(-2, "function", _=>_ instanceof Function, (...a)=>new Function(...a), _=>Object.defineProperties(({[_.name]:(...a)=>_(...a)})[_.name], Object.getOwnPropertyDescriptors(_)));
jet.type.define(-1, "array", _=>_ instanceof Array, (...a)=>new Array(...a), _=>Array.from(_), _=>_.entries());
jet.type.define(-1, "boolean", _=>_ instanceof Boolean, Boolean);
jet.type.define(-1, "string", _=>_ instanceof String, any=>any == null ? "" : String(any));
jet.type.define(-1, "number", _=>_ instanceof Number, Number);
jet.type.define(-1, "symbol", _=>_ instanceof Symbol, Symbol);
jet.type.define(-1, "regexp", _=>_ instanceof RegExp, RegExp, _=>RegExp(_.source));
jet.type.define(-1, "date", _=>_ instanceof Date, Date, Date);
jet.type.define(-1, "promise", _=>_ instanceof Promise, _=>new Promise(jet.get("function", _, _=>_())));
jet.type.define(-1, "element", _=>_ instanceof Element);

jet.type.define(-1, "set", _=>_ instanceof Set, (...a)=>new Set(...a), _=>new Set(_), _=>_.entries(), (_,k)=>_.has(k)?k:undefined, (_,k,v)=>_.delete(k)?_.add(v):undefined, (_,k)=>_.delete(k));
jet.type.define(-1, "map", _=>_ instanceof Map, (...a)=>new Map(...a), _=>new Map(_));