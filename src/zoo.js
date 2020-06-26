import jet from "./index";

class ArrayLike {
    constructor() { jet.obj.addProperty(this, "length", 0, true); }

    splice() { }

    has(val) {
        return this.indexOf(val) >= 0;
    }

    indexOf(val) {
        for (let i in this) { if (this[i] === val) { return Number(i); } }
        return -1;
    }
}

class Pool extends ArrayLike {

    constructor(filter, flat) {
        super();
        if (filter) { jet.obj.addProperty(this, { filter }); }
        if (flat) { jet.obj.addProperty(this, { flat }); }
    }

    classify(item) {return (!this.filter || jet.is(this.filter, item)) ? this.length : -1; }

    add(...items) {
        let c = 0;
        items.map(v => {
            if (this.flat && jet.isMapable(v)) { return c += this.add(...v); }
            let t = this.classify(v), l = this.length; if (t < 0) { return; } //not classified
            const f = this.indexOf(v), k = f >= 0; if (k && t === l) { t--; } if (t === f) { return; } //allready exist at the same place
            if (k && t > f) { for (let j = f; j < t; j++) { this[j] = this[j + 1]; } } //actual index is lower then new
            else { for (let j = (k ? f : l); j > t; j--) { this[j] = this[j - 1]; } } // actual index is higher then new or completely new
            this[t] = v; this.length += !k; c += !k;
        });
        return c;
    }

    rem(...items) {
        let c = 0;
        items.map(v => {
            let x = this.indexOf(v), l = this.length - 1; if (x < 0) { return; }
            for (let j = x; j < l; j++) { this[j] = this[j + 1]; }
            delete this[l]; this.length--; c++;
        });
        return c;
    }

    flush() {
        for (let i=this.length-1; i>=0; i--) { delete this[i]; this.length --;  }
    }

    pass(item, pool, dir) {
        let c = pool, f = dir ? c : this, t = dir ? this : c, r = f.rem(item);
        if (t.add(item) >= 0) { return true; } else if (r) { f.add(item); }
        return false;
    }

    passTo(item, pool) { return this.pass(item, pool, false); }
    passFrom(item, pool) { return this.pass(item, pool, true); }
}

class RunPool extends Pool {
    constructor(...runwith) {
        super("function", true);
        jet.obj.addProperty(this, "with", runwith);
    }

    run(...args) {
        return jet.run(this, ...this.with, ...args);
    }

    fit(...args) {
        for (let i = 0; i<this.length; i++) {
            args[0] = this[i](...this.with, ...args);
        }
        return args[0];
    }

    classify(item) {
        const index = super.classify(item);
        if (this.pending && index >= 0 && !this.has(item)) {
            this.pending.push(item);
        }
        return index;
    }

    addAndRun(...items) {
        const pending = [];
        jet.obj.addProperty(this, "pending", pending, true);
        this.add(...items);
        delete this.pending;
        return jet.run(pending, ...this.with);
    }
}

class Sort extends Pool {
    constructor(filter, flat, onclassify) {
        super(filter, flat)
        jet.obj.addProperty(this, "onclassify", new Pool("function", true));
        this.onclassify.add(onclassify);
    }

    classify(item) {
        let i = 0, k = 0, l = this.length, c = this.onclassify;
        if (super.classify(item) < 0) { return -1; } else if (!c.length) { return l; }
        for (i = 0; i < l; i++) {
            if (item === this[i]) { k = 1; continue; }
            let b = false; for (let j in c) { b = c[j](item, this[i]); if (b != null) { break; } }
            if (b) { break; }
        };
        return i - k;
    }
}

class Lexicon {

    constructor(pattern, min, max) {
        jet.obj.addProperty(this, jet.get({pattern:["object", pattern], min:["number", min, 4], max:["number", max, 10]}), null, false, true);
    }

    getRandomNext(char, notend) {
        const next = jet.get("object", this.pattern[char]);
        const remend = (notend && next[" "]);
        let rand = jet.rnd.number(0, 1-(remend ? next[" "] : 0)), cnt = 0;
        for ([char, rate] of jet.key.map(next)) {
            if ((remend && char === " ") || (cnt += rate) < rand) {continue;}
            return char;
        }
        return " ";
    }

    getRandom(min, max) {
        let result = "", char = " ";
        [min, max] = jet.get([["number", min, this.min], ["number", max, this.max]])

        while (true) {
            char = this.getRandomNext(char, result.length < min);
            if (char === " " || result.length == max) {return result;}
            result += char;
        }
    }

    mutate(str, factor) {
        var r = new Sort(null, false, function (v, k) { return v.rate > k.rate; });
        var n = str.length / 2, m = str.length * 2, f = Math.abs(100 * (factor || 1));
        while (r.length < f) {var s = this.getRandom(n, m); r.add({ word: s, rate: jet.str.levenshtein(s, str) });}
        return r[0].word;
    }

    static createPattern(...words) {
        const pattern = {};

        jet.obj.map(words, word=>{
            if (!jet.is("string", word)) {return;}
            let lChar, Char, l = word.length;
            for (let k = -1; k <= l; k++) {
                let char = (word[k] || " ");
                Char = pattern[char] = pattern[char] || {};
                if (lChar) {lChar[char] = (lChar[char] || 0) + 1;}
                lChar = Char;
            };
        }, true);

        //finalize rates
        return jet.obj.map(pattern, v=>{
            let c = 0; 
            jet.obj.map(v, v=>c+=v);
            v = jet.obj.map(v, v=>v/c);
            return v;
        });
    }

    static createFromScratch(...words) {
        return new Lexicon(Lexicon.createPattern(...words));
    }

};

export default {
    ArrayLike,
    Pool,
    RunPool,
    Sort,
    Lexicon
}