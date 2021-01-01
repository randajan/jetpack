
class Complex extends Function {

    constructor(fce, fix, temp) {
        super();
        const self = fce.bind();
        if (fix) {for (let i in fix) { Object.defineProperty(self, i, {value:fix[i], writable:false, enumerable:true}); }}
        if (temp) {for (let i in temp) { Object.defineProperty(self, i, {value:temp[i], writable:true, enumerable:true}); }}
        return Object.setPrototypeOf(self, new.target.prototype);
    }
}

export default Complex;