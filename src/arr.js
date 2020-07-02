import jet from "./index";


export default {
    to:function(...args) { return jet.to("array", ...args); },
    wrap:function(any, sep) { //obsolete
        const type = jet.type(any);
        if (any == null) {return [];}
        if (type === "array") {return any;}
        if (type === "object") {return Object.values(any);}
        if (type === "set") {return Array.from(any);}
        if (type === "string" && sep) { return any.split(sep);}
        if (!jet.isMapable(any)) {return [any];}
        const result = []; 
        jet.obj.map(any, v=>a.push(v));
        return result;
    },
    swap: function(arr, to, from) {//swap position of two items in array
        arr = jet.get("array", arr); 
        arr[to] = arr.splice(from, 1, arr[to])[0]; 
        return arr;
    }, 
    // move: function(arrTo, arrFrom, val, dir) {jet.arr.remove(dir?arrTo:arrFrom, val); return jet.arr.push(dir?arrFrom:arrTo, val, true);}, //move item from array to array
    shuffle: function(arr) {//shuffle whole array
        arr = jet.get("array", arr); 
        for (var i = arr.length - 1; i > 0; i--) {jet.arr.swap(arr, Math.floor(Math.random() * (i + 1)), i);} return arr;
    }, 
    // sort: function(arr, path, dir) { //sort array by path and direction
    //     var d = (dir*2-1)||1; return (arr && arr.sort) ? arr.sort(function(a, b) {console.log(a, path, jet.obj.get(a, path, 0));  return d*(jet.obj.get(b, path, 0) - jet.obj.get(a, path, 0));}) : arr;
    // },
    clean: function(arr, rekey, handler) {
        [arr, handler, rekey] = jet.get([["array", arr], ["function", handler, v=>v!=null?v:undefined], ["boolean", rekey, true]]);
        return rekey ? arr.filter(handler) : jet.obj.map(arr, handler);
    },
    joins: function(...args) { //obsolete
        return jet.obj.join(...args);
    },
    melt: function(...args) {
        return jet.obj.melt(...args);
    }
};