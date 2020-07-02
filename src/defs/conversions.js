import jet from "../jet";

jet.to.define = function(from, to, execute) {
    const types = jet.temp.types.index;
    const tt = jet.type(to);
    if (!types[from]) {throw new Error("Can't add conversion! Type '" + from + "' wasn't defined!!!");}
    const conv = types[from].conv;
    if (tt === "array") { for (let i in to) { conv[to[i]] = execute; } }
    else if (tt === "object") { for (let i in to) { conv[i] = to[i]; } }
    else if (tt === "function") { conv["*"] = to; }
    else { conv[to] = execute; }
}

jet.to.define("string", {
    function:str=>_=>str,
    boolean:str=>str.lower() === "true",
    array:(str, comma)=>str.split(comma),
    number:(str, strict)=>Number(strict ? str : ((str.match(jet.temp.regex.num) || []).join("")).replace(",", ".")),
    object:str=>jet.obj.fromJSON(str),
    promise:str=>new Promise(ok=>ok(str)),
    error:str=>new Error(str),
    amount:(val, ...args)=>new jet.Amount(val, ...args)
});

jet.to.define("number", {
    function:num=>_=>num,
    boolean:num=>!!num,
    array:(num, comma)=>comma?[num]:Array(num),
    promise:num=>new Promise(ok=>ok(num)),
    error:num=>new Error(num),
    amount:(val, ...args)=>new jet.Amount(val, ...args),
});

jet.to.define("object", {
    function:obj=>_=>obj,
    symbol:obj=>Symbol(jet.obj.toJSON(obj)),
    boolean:obj=>jet.isFull(obj),
    number:obj=>Object.values(obj).length,
    array:obj=>Object.values(obj),
    string:obj=>jet.obj.toJSON(obj),
    promise:obj=>new Promise(ok=>ok(obj)),
    error:obj=>new Error(jet.obj.toJSON(obj))
});

jet.to.define("array", {
    function:arr=>_=>arr,
    boolean:arr=>jet.isFull(arr),
    number:arr=>arr.length,
    string:(arr, comma)=>arr.melt(comma),
    object:arr=>Object.assign({}, arr),
    promise:arr=>new Promise(ok=>ok(arr)),
    error:(arr, comma)=>arr.melt(comma||" ")
});

jet.to.define("set", {
    function:set=>_=>set,
    boolean:set=>jet.isFull(set),
    number:set=>Array.from(set).length,
    array:set=>Array.from(set),
    string:(set, comma)=>Array.from(set).melt(comma),
    object:set=>jet.obj.merge(set),
    promise:set=>new Promise(ok=>ok(set))
});


jet.to.define("function", (fce, ...args)=>fce(...args));
jet.to.define("nan", _=>undefined);