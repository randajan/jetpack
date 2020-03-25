import jet from "./index";

export default {
    get: function(type, ...args) {const gen = jet.rnd[type]; return jet.get(type, gen ? gen(...args) : null);},
    boolean: function(trueRatio) {return Math.random() < (trueRatio||.5);},
    number: function (min, max, sqr) {
        var r = Math.random(); if (sqr) { r = Math.pow(r, 2); } else if (sqr === false) { r = Math.sqrt(r); }
        return jet.num.fromRatio(r, min||0, max||1);
    },
    index: function(arr, min, max, sqr) { //get random element from array or string
        const l = arr.length;
        return arr[Math.floor(jet.rnd.number(jet.num.frame(min||0, 0, l), jet.num.frame(max||l, 0, l), sqr))];
    },
    string: function(min, max, sqr) { //HOW TO GENERATE GREAT RANDOM STRING???
        const c = [jet.temp.consonant, jet.temp.vowels], p = c[0].length/(c[0].length+c[1].length);
        const l = jet.rnd.number(Math.max(min, 2), max, sqr);
        let s = jet.rnd.boolean(p), r = "";
        while (r.length < l) {r += jet.rnd.index(c[+(s = !s)]);}
        return r;
    },
    color: function() {
        return Array(3).fill().map(_=>jet.num.toHex(jet.num.round(jet.rnd.number(0,255,false)))).join("");
    }

}