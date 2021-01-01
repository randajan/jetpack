import jet from "../jet";

export default {
    swap: function(arr, to, from) {//swap position of two items in array
        arr = jet.arr.tap(arr); 
        arr[to] = arr.splice(from, 1, arr[to])[0]; 
        return arr;
    }, 
    shuffle: function(arr) {//shuffle whole array
        arr = jet.arr.tap(arr); 
        for (var i = arr.length - 1; i > 0; i--) {jet.arr.swap(arr, Math.floor(Math.random() * (i + 1)), i);} return arr;
    },
    clean: function(arr, rekey, handler) {
        arr = jet.arr.tap(arr);
        handler = jet.fce.tap(handler, v=>v!=null?v:undefined);
        return rekey !== false ? arr.filter(handler) : jet.map.of(arr, handler);
    },
};