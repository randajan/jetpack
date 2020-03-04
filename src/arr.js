import jet from "./index";


export default {
    swap: function(arr, to, from) {arr[to] = arr.splice(from, 1, arr[to])[0]; return arr;}, //swap position of two items in array
    // move: function(arrTo, arrFrom, val, dir) {jet.arr.remove(dir?arrTo:arrFrom, val); return jet.arr.push(dir?arrFrom:arrTo, val, true);}, //move item from array to array
    shuffle: function(arr) {for (var i = arr.length - 1; i > 0; i--) {jet.arr.swap(arr, Math.floor(Math.random() * (i + 1)), i);} return arr;}, //shuffle whole array
    // sort: function(arr, path, dir) { //sort array by path and direction
    //     var d = (dir*2-1)||1; return (arr && arr.sort) ? arr.sort(function(a, b) {console.log(a, path, jet.obj.get(a, path, 0));  return d*(jet.obj.get(b, path, 0) - jet.obj.get(a, path, 0));}) : arr;
    // },
    clean: function(arr, rekey) {
        [arr, rekey] = jet.get([["array", arr], ["boolean", rekey, true]]);
        for (let i=arr.length-1; i>=0; i--) {
            if (arr[i] == null) {arr.splice(i, 1);} else if (!rekey) {break;}
        }
        return arr;
    }
};