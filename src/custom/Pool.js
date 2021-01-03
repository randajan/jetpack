import jet from "../jet";
import ArrayLike from "./ArrayLike";


class Pool extends ArrayLike {

    constructor(filter, flat) {
        super();
        jet.obj.prop.add(this, { filter, flat });
    }

    classify(item) {return (!this.filter || jet.type.is(this.filter, item)) ? this.length : -1; }

    add(...items) {
        let c = 0;
        items.map(v => {
            if (this.flat && jet.type.is.map(v)) { return c += this.add(...jet.type.vals(v)); }
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

export default Pool;