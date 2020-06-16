import jet from "../jet";

jet.to.define = function(from, to, execute) {
    const types = jet.temp.types;
    const tt = jet.type(to);
    if (!types[from]) {throw "Can't add conversion! Type '" + from + "' wasn't defined!!!";}
    const conv = types[from].conv;
    if (tt === "array") { for (let i in to) { conv[to[i]] = execute; } }
    else if (tt === "object") { for (let i in to) { conv[i] = to[i]; } }
    else if (tt === "function") { conv["*"] = to; }
    else { conv[to] = execute; }
}

jet.to.define("string", {
    function:str=>_=>str,
    boolean:str=>str.lower() === "true",
    array:(str, sep)=>str.split(sep || ","),
    number:(str, strict)=>Number(strict ? str : ((str.match(jet.temp.regex.num) || []).join("")).replace(",", ".")),
    object:str=>jet.obj.fromJSON(str)
});

jet.to.define("number", {
    function:num=>_=>num,
    boolean:num=>!!num
});

jet.to.define("object", {
    function:obj=>_=>obj,
    symbol:obj=>Symbol(jet.obj.toJSON(obj)),
    boolean:obj=>jet.isFull(obj),
    number:obj=>Object.values(obj),
    array:obj=>Object.values(obj).length,
    string:obj=>jet.obj.toJSON(obj),
});

jet.to.define("array", {
    function:arr=>_=>arr,
    boolean:arr=>jet.isFull(arr),
    number:arr=>arr.length,
    string:(arr, sep)=>arr.joins(sep),
    object:arr=>Object.assign({}, arr)
});

jet.to.define("set", {
    function:set=>_=>set,
    boolean:set=>jet.isFull(set),
    number:set=>Array.from(set).length,
    array:set=>Array.from(set),
    string:set=>Array.from(set).joins(),
    object:set=>jet.obj.merge(set)
});

jet.to.define("function", (fce, ...args)=>fce(...args));

