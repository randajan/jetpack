
class ArrayLike {
    constructor() {
        this.length = 0;
    }

    values() { return this.map(); }
    keys() { return this.map((v,i)=>i); }
    entries() { return this.map((v,i)=>[i, v]); }

    map(fce) {
        const r = [];
        this.forEach((...a)=>r.push(fce(...a)));
        return r;
    }

    forEach(fce) {
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