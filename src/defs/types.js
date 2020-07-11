import jet from "../jet";

function unBundle(Prototyp) {
    const inst = new Prototyp();
    return inst._c ? inst._c.constructor : Prototyp;
}

jet.type.define = function(priority, name, is, create, copy, map, get, set, rem) {
    const { list, index } = jet.temp.type;
    if (index[name]) {throw new Error("Type '" + name + "' can't be redefined!!!");}
    if (map) {
        get = get || ((_, k)=>_[k]);
        set = set || ((_, k, v)=>_[k] = v);
        rem = rem || ((_, k)=>delete _[k]);
    }
    list.push(index[name] = {priority, name, is, create, copy, map, get, set, rem, conv:{}});
    list.sort((a,b)=>b.priority-a.priority);
};

jet.type.define(-9, "mapable", null, (...a)=>new Array(...a), _=>jet.copy(_)); //map is hardcoded special type
jet.type.define(-3, "object", (v,t)=>t === "object", (...a)=>new Object(...a), _=>Object.defineProperties({}, Object.getOwnPropertyDescriptors(_)), _=>Object.entries(_));

jet.type.define(-2, "function", (v,t)=>t === "function", (...a)=>new Function(...a), _=>Object.defineProperties(({[_.name]:(...a)=>_(...a)})[_.name], Object.getOwnPropertyDescriptors(_)));
jet.type.define(-2, "number", (v,t)=>t === "number", Number);
jet.type.define(-2, "nan", (v,t)=>t === "number" && isNaN(v), _=>NaN);
jet.type.define(-2, "boolean", (v,t)=>t === "boolean", Boolean);
jet.type.define(-2, "string", (v,t)=>t === "string", any=>any == null ? "" : String(any));
jet.type.define(-2, "symbol", (v,t)=>t === "symbol", Symbol);
jet.type.define(-2, "regexp", _=>_ instanceof RegExp, RegExp, _=>RegExp(_.source));
jet.type.define(-2, "date", _=>_ instanceof Date, _=>!_ ? new Date() : new Date(_));

jet.type.define(-1, "promise", _=>_ instanceof Promise, _=>new Promise(jet.get("function", _, _=>_())));
jet.type.define(-1, "error", _=>_ instanceof Error, (...a)=>new Error(...a))
jet.type.define(-1, "array", Array.isArray, (...a)=>new Array(...a), _=>Array.from(_), _=>_.entries());
jet.type.define(-1, "element", _=>_ instanceof Element);

const oSet = unBundle(Set);
jet.type.define(-1, "set", _=>_ instanceof Set || _ instanceof oSet, (...a)=>new Set(...a), _=>new Set(_), _=>_.entries(), (_,k)=>_.has(k)?k:undefined, (_,k,v)=>_.add(v)?v:undefined, (_,k)=>_.delete(k));

const oMap = unBundle(Map);
jet.type.define(-1, "map", _=>_ instanceof Map || _ instanceof oMap, (...a)=>new Map(...a), _=>new Map(_));

jet.type.define(0, "amount", jet.Amount.is, (...a)=>new jet.Amount(...a), _=>new jet.Amount(_));

jet.type.define(0, "engage", jet.Engage.is, (...a)=>new jet.Engage(...a));