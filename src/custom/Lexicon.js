import jet from "../jet";

class Lexicon {

    constructor(pattern, min, max) {
        pattern = jet.obj.tap(pattern);
        min = jet.num.tap(min, 4);
        max = jet.num.tap(max, 10);
        jet.obj.prop.add(this, {pattern, min, max}, null, false, true);
    }

    getRandomNext(char, notend) {
        const next = jet.obj.tap(this.pattern[char]);
        const remend = (notend && next[" "]);
        let rand = jet.num.rnd(0, 1-(remend ? next[" "] : 0)), cnt = 0;
        for ([char, rate] of jet.type.pairs(next)) {
            if ((remend && char === " ") || (cnt += rate) < rand) {continue;}
            return char;
        }
        return " ";
    }

    getRandom(min, max) {
        let result = "", char = " ";
        min = jet.num.tap(min, this.min);
        max = jet.num.tap(max, this.max);

        while (true) {
            char = this.getRandomNext(char, result.length < min);
            if (char === " " || result.length == max) {return result;}
            result += char;
        }
    }

    mutate(str, factor) {
        var r = new Sort(null, false, (v, k)=>v.rate > k.rate);
        var n = str.length / 2, m = str.length * 2, f = Math.abs(100 * (factor || 1));
        while (r.length < f) {var s = this.getRandom(n, m); r.add({ word: s, rate: jet.str.levenshtein(s, str) });}
        return r[0].word;
    }

};

Lexicon.createPattern = (...words)=>{
    const pattern = {};

    jet.map.it(words, word=>{
        if (!jet.str.is(word)) {return;}
        let lChar, Char, l = word.length;
        for (let k = -1; k <= l; k++) {
            let char = (word[k] || " ");
            Char = pattern[char] = pattern[char] || {};
            if (lChar) {lChar[char] = (lChar[char] || 0) + 1;}
            lChar = Char;
        };
    }, true);

    //finalize rates
    return jet.map.of(pattern, v=>{
        let c = 0;
        jet.map.it(v, v=>c+=v);
        return jet.map.of(v, v=>v/c);
    });
}

Lexicon.createFromScratch = (...words)=>{
    return new Lexicon(Lexicon.createPattern(...words));
}


export default Lexicon;