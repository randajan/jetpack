
function define(o, d, writable) {
    if (!d) { return; }
    for (let i in d) {
        if (o[i]) { continue; }
        Object.defineProperty(o, i, {value:d[i], writable, enumerable:true});
    }
}


class Complex extends Function {

    constructor(fce, fix, temp) {
        super();
        const self = fce.bind();
        define(self, fix, false);
        define(self, temp, true);
        return Object.setPrototypeOf(self, new.target.prototype);
    }
}

export default Complex;