import jet from "../jet";

jet.to.define = function(from, to, execute) {
    const type = jet.temp.type.index;
    const tt = jet.type(to);
    if (!type[from]) {throw new Error("Can't add conversion! Type '" + from + "' wasn't defined!!!");}
    const conv = type[from].conv;
    if (tt === "array") { for (let i in to) { conv[to[i]] = execute; } }
    else if (tt === "object") { for (let i in to) { conv[i] = to[i]; } }
    else if (tt === "function") { conv["*"] = to; }
    else { conv[to] = execute; }
}

jet.to.define("string", {
    function:str=>_=>str,
    boolean:str=>!["0", "false", "null", "undefined", "NaN"].includes(str.lower()),
    array:(str, comma)=>str.split(comma),
    number:(str, strict)=>Number(strict ? str : ((str.match(jet.temp.regex.num) || []).join("")).replace(",", ".")),
    object:str=>jet.obj.fromJSON(str),
    promise:async str=>str,
    engage:async str=>str,
    error:str=>new Error(str),
    amount:(val, ...args)=>new jet.Amount(val, ...args)
});

jet.to.define("number", {
    function:num=>_=>num,
    boolean:num=>!!num,
    array:(num, comma)=>comma?[num]:Array(num),
    promise:async num=>num,
    engage:async num=>num,
    error:num=>new Error(num),
    amount:(val, ...args)=>new jet.Amount(val, ...args),
});

jet.to.define("object", {
    function:obj=>_=>obj,
    symbol:obj=>Symbol(jet.obj.toJSON(obj)),
    boolean:obj=>jet.isFull(obj),
    number:obj=>Object.values(obj),
    array:obj=>Object.values(obj),
    string:obj=>jet.obj.toJSON(obj),
    promise:async obj=>obj,
    engage:async obj=>obj,
    error:obj=>new Error(jet.obj.toJSON(obj)),
    regexp:(obj,comma)=>jet.obj.melt(obj, comma != null ? comma : "|")
});

jet.to.define("array", {
    function:arr=>_=>arr,
    boolean:arr=>jet.isFull(arr),
    number:arr=>arr.length,
    string:(arr, comma)=>arr.melt(comma),
    object:arr=>Object.assign({}, arr),
    promise: async arr=>arr,
    engage: async arr=>arr,
    error:(arr, comma)=>arr.melt(comma != null ? comma : " "),
    regexp:(arr, comma)=>arr.melt(comma != null ? comma : "|")
});

jet.to.define("set", {
    "*":set=>Array.from(set),
    function:set=>_=>set,
    boolean:set=>jet.isFull(set),
    object:set=>jet.obj.merge(set),
    promise:async set=>set,
    engage:async set=>set,
});

jet.to.define("promise", {
    engage:(prom, timeout)=>new jet.Engage(prom, timeout)
})

jet.to.define("function", {
    "*":(fce, ...args)=>fce(...args),
    promise:async (fce, ...args)=>await fce(...args),
    engage:async (fce, ...args)=>await fce(...args)
});
jet.to.define("nan", _=>undefined);