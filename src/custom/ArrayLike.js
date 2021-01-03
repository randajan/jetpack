import jet from "../jet";

class ArrayLike {
    constructor() {
        this.length = 0;
    }

    values() { return this.map(); }
    keys() { return this.map((v,i)=>i); }
    entries() { return this.map((v,i)=>[i, v]); }

    map(fce) {
        fce = jet.fce.tap(fce);
        const r = [];
        this.forEach((...a)=>r.push(fce(...a)));
        return r;
    }

    forEach(fce) {
        if (!jet.fce.is(fce)) { return; }
        for (let i = 0; i < this.length; i++) { fce(this[i], i); }
    }

    splice() { }

    has(val) {
        return this.indexOf(val) >= 0;
    }

    indexOf(val) {
        for (let i in this) { if (this[i] === val) { return Number(i); } }
        return -1;
    }
}

export default ArrayLike;