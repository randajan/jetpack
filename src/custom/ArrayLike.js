
function pack(arl, keys, vals) {
    const pack = [];
    for (let i = 0; i < arl.length; i++) { pack.push(keys === vals ? [i, arl[i]] : keys ? i : arl[i]); }
    return pack;
}


class ArrayLike {
    constructor() {
        this.length = 0;
    }

    values() { return pack(this, false, true); }
    keys() { return pack(this, true, false); }
    entries() { return pack(this); }

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