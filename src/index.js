
import jet from "./jet";

import obj from "./native/obj.js";
import fce from "./native/fce.js";
import num from "./native/num.js";
import str from "./native/str.js";
import date from "./native/date.js";
import ele from "./native/ele.js";
import arr from "./native/arr.js";
import map from "./native/map.js";
import regex from "./native/regex.js";
import prom from "./native/prom.js";

import Complex from "./custom/Complex";
import Engage from "./custom/Engage";
import Amount from "./custom/Amount";
import ArrayLike from "./custom/ArrayLike";
import Pool from "./custom/Pool";
import RunPool from "./custom/RunPool";
import Sort from "./custom/Sort";
import Lexicon from "./custom/Lexicon";


function unBundle(Prototyp) {
    const inst = new Prototyp();
    return inst._c ? inst._c.constructor : Prototyp;
}

function rndKey(arr, min, max, sqr) { //get random element from array or string
    const l = arr.length;
    return arr[Math.floor(jet.num.rnd(jet.num.frame(min||0, 0, l), jet.num.frame(max||l, 0, l), sqr))];
};

//PRIMITIVES

jet.type.define("obj", Object, {
    rank:-6,
    is:(x,t)=>t === "object",
    copy:x=>Object.defineProperties({}, Object.getOwnPropertyDescriptors(x)),
    keys:x=>Object.keys(x),
    vals:x=>Object.values(x),
    pairs:x=>Object.entries(x),
    full:v=>{for (let i in v) {return true}; return false;}
}, obj)

jet.type.define("bol", Boolean, {
    rank:-4,
    is:(x,t)=>t === "boolean",
    create:Boolean,
    rnd:(trueRatio)=>Math.random() < (trueRatio||.5),
});

jet.type.define("num", Number, {
    rank:-4,
    is:(x,t)=>t === "number",
    create:Number,
    rnd:(min, max, sqr)=>{
        var r = Math.random(); if (sqr) { r = Math.pow(r, 2); } else if (sqr === false) { r = Math.sqrt(r); }
        return jet.num.fromRatio(r, min||0, max||min*2||1);
    },
}, num);

jet.type.define("str", String, {
    rank:-4,
    is:(x,t)=>t === "string",
    create:any=>any == null ? "" : String(any),
    rnd:new Complex(
        (min, max, sqr)=>{ //HOW TO GENERATE GREAT RANDOM STRING???
            const c = ["bcdfghjklmnpqrstvwxz", "aeiouy"], p = c[0].length/(c[0].length+c[1].length);
            const l = jet.num.rnd(Math.max(min, 2), max, sqr);
            let s = jet.bol.rnd(p), r = "";
            while (r.length < l) {r += jet.str.rnd.key(c[+(s = !s)]);}
            return r;
        },
        {
            key:rndKey
        }
    ),
}, str);

jet.type.define("symbol", Symbol, {
    rank:-4,
    is:(x,t)=>t === "symbol",
    create:Symbol,
    rnd:(...a)=>Symbol(jet.str.rnd(...a)),
});

jet.type.define("fce", Function, {
    rank:-4,
    is:(x,t)=>t === "function",
    create:Function,
    copy:x=>Object.defineProperties(({[x.name]:(...a)=>x(...a)})[x.name], Object.getOwnPropertyDescriptors(x)),
}, fce);

jet.type.define("regex", RegExp, {
    rank:-4,
    is:(x,t)=>x instanceof RegExp,
    create:RegExp,
    copy:_=>RegExp(_.source),
}, regex);

jet.type.define("date", Date, {
    rank:-4,
    is:(x,t)=>x instanceof Date,
    create:x=>!x ? new Date() : new Date(x),
    rnd:(trueRatio)=>Math.random() < (trueRatio||.5),
}, date)


//OBSTRUCT
jet.type.define("nan", Number, {
    rank:-2,
    is:(x,t)=>t === "number" && isNaN(x),
    create:_=>NaN,
});

//SPECIAL
jet.type.define("err", Error, {
    rank:-1,
    is:(x,t)=>x instanceof Error,
    rnd:(...a)=>new Error(jet.str.rnd(...a)),
});

jet.type.define("prom", Promise, {
    rank:-1,
    is:(x,t)=>x instanceof Promise,
    create:x=>new Promise(jet.fce.only(x, e=>e())),
}, prom);

jet.type.define("arr", Array, {
    rank:-1,
    is:Array.isArray,
    copy:x=>Array.from(x),
    keys:x=>x.keys(),
    vals:x=>x.values(),
    pairs:x=>x.entries(),
    full:x=>!!x.length
}, arr);

jet.type.define("ele", Element, {
    rank:-1,
    is:(x,t)=>x instanceof Element,
    create:x=>document.createElement(jet.str.tap(x, "div")),
}, ele);

const oSet = unBundle(Set);
jet.type.define("set", Set, {
    rank:-1,
    is:x=>x instanceof Set || x instanceof oSet,
    copy:x=>new Set(x),
    keys:x=>x.keys(),
    vals:x=>x.values(),
    pairs:x=>x.entries(),
    get:(x,k)=>x.has(k)?k:undefined,
    set:(x,k,v)=>x.add(v)?v:undefined,
    rem:(x,k)=>x.delete(k),
    full:x=>!!x.size
});

const oMap = unBundle(Map);
jet.type.define("map", Map, {
    rank:-1,
    is:x=>x instanceof Map || x instanceof oMap,
    copy:x=>new Map(x),
    keys:x=>x.keys(),
    vals:x=>x.values(),
    pairs:x=>x.entries(),
    get:(x,k)=>x.get(k),
    set:(x,k,v)=>x.set(k,v),
    rem:(x,k)=>x.delete(k),
}, map);


//CUSTOM
jet.type.define("complex", Complex);
jet.type.define("eng", Engage, { is:Engage.is });

jet.type.define("pool", Pool, {
    full:x=>!!x.length,
    keys:x=>x.keys(),
    vals:x=>x.values(),
    pairs:x=>x.entries(),
    set:(x,k,v)=>x.add(v),
    rem:(x,v)=>x.rem(v),
});

jet.type.define("runpool", RunPool, {
    full:x=>!!x.length,
    keys:x=>x.keys(),
    vals:x=>x.values(),
    pairs:x=>x.entries(),
    set:(x,k,v)=>x.add(v),
    rem:(x,v)=>x.rem(v),
});

jet.type.define("sort", Sort, {
    full:x=>!!x.length,
    keys:x=>x.keys(),
    vals:x=>x.values(),
    pairs:x=>x.entries(),
    set:(x,k,v)=>x.add(v),
    rem:(x,v)=>x.rem(v),
});

jet.type.define("lexicon", Lexicon, {
    full:x=>!!x.pattern,
}, Lexicon);


jet.type.define("amount", Amount, {
    is:x=>Amount.is(x),
    create:(val, unit, dec)=>Amount.is(val) ? val.convert(unit) : new Amount(val, unit, dec),
    copy:x=>new Amount(x)
}, Amount);


//import "./defs/types.js";
//import "./defs/conversions.js";
//import "./defs/prototypes.js";
//import "./defs/amounts.js";



//CONVERSIONS
jet.str.to.define({
    fce:str=>_=>str,
    bol:str=>!["0", "false", "null", "undefined", "NaN"].includes(str.toLowerCase()),
    arr:(str, comma)=>str.split(comma),
    num:(str, strict)=>Number(strict ? str : ((str.match(jet.regex.lib.num) || []).join("")).replace(",", ".")),
    obj:str=>jet.obj.json.from(str),
    prom:async str=>str,
    eng:async str=>str,
    amount:(val, ...args)=>jet.amount(val, ...args)
});

jet.num.to.define({
    fce:num=>_=>num,
    bol:num=>!!num,
    arr:(num, comma)=>comma?[num]:Array(num),
    prom:async num=>num,
    eng:async num=>num,
    amount:(val, ...args)=>jet.amount(val, ...args),
});

jet.obj.to.define({
    fce:obj=>_=>obj,
    symbol:obj=>Symbol(jet.obj.json.to(obj)),
    bol:obj=>jet.obj.is.full(obj),
    num:obj=>Object.values(obj),
    arr:obj=>Object.values(obj),
    str:obj=>jet.obj.json.to(obj),
    prom:async obj=>obj,
    eng:async obj=>obj,
    err:obj=>jet.err(jet.obj.json.to(obj)),
    regex:(obj, comma)=>jet.map.melt(obj, comma != null ? comma : "|")
});

jet.arr.to.define({
    fce:arr=>_=>arr,
    bol:arr=>jet.arr.is.full(arr),
    num:arr=>arr.length,
    str:(arr, comma)=>jet.map.melt(arr, comma),
    obj:arr=>Object.assign({}, arr),
    prom: async arr=>arr,
    eng: async arr=>arr,
    err:(arr, comma)=>jet.map.melt(arr, comma != null ? comma : " "),
    regex:(arr, comma)=>jet.map.melt(arr, comma != null ? comma : "|")
});

jet.set.to.define({
    "*":set=>Array.from(set),
    fce:set=>_=>set,
    bol:set=>jet.set.is.full(set),
    obj:set=>jet.obj.merge(set),
    prom:async set=>set,
    eng:async set=>set,
});

jet.prom.to.define({
    eng:(prom, timeout)=>jet.eng(prom, timeout)
})

jet.fce.to.define({
    "*":(fce, ...args)=>fce(...args),
    prom:async (fce, ...args)=>await fce(...args),
    eng:async (fce, ...args)=>await fce(...args),
});

jet.nan.to.define(_=>undefined);



//Amounts

Amount.define("s", "ms", 1000);
Amount.define("m", "s", 60);
Amount.define("h", "m", 60);
Amount.define("d", "h", 24);
Amount.define("w", "d", 7);
Amount.define("y", "d", 365);

Amount.define("dl", "ml", 100);
Amount.define("l", "dl", 10);
Amount.define("hl", "l", 100);

Amount.define("g", "mg", 1000);
Amount.define("kg", "g", 1000);
Amount.define("t", "kg", 1000);

Amount.define("kB", "B", 1000);
Amount.define("mB", "kB", 1000);
Amount.define("gB", "mB", 1000);
Amount.define("tB", "gB", 1000);

Amount.define("kb", "b", 1000);
Amount.define("mb", "kb", 1000);
Amount.define("gb", "mb", 1000);
Amount.define("tb", "gb", 1000);

Amount.define("cm", "mm", 10);
Amount.define("M", "cm", 100);
Amount.define("km", "M", 1000);

export default jet
export {
    Complex,
    Amount,
    Engage,
    ArrayLike,
    Pool,
    RunPool,
    Lexicon
}