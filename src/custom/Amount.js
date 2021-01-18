import jet from "../jet";

import Sort from "./Sort";

const temp = {
    index:{}
}

class Amount {

    static is(instance) { return instance instanceof Amount; } 

    constructor(val, unit, dec) {
        const parent = (Amount.is(val) && Amount.validatePair(unit, val.unit)) ? val : null;
        [ val, unit ] = Amount.fetch(val, unit, dec, true);

        this.dec = dec;
        jet.obj.prop.add(this, "unit", unit);

        Object.defineProperties(this, {
            val: {
                get: _ => parent ? parent.valueOf(this.unit) : val,
                set: _ => {
                    if (parent) { parent.val = Amount.fetch(_, this.unit, null, true); }
                    else { val = Amount.fetch(_, this.unit); }
                }
            }
        });

    }

    fit(dec) {
        const fit = new Sort("arr", false, (a,b)=>a[1] < b[1]);
        dec = jet.num.only(dec, this.dec);
        const rd = jet.num.is(dec);
        jet.map.it(temp.index[this.unit], (to, unit) => {
            let num = to(this.val);
            if (rd) { num = jet.num.round(num, dec); }
            if (num) {fit.add([unit, jet.num.len(num), num]);}
        });
        return fit.length ? fit[0][0] : this.unit;
    }

    convert(unit, dec, stickThis) {
        if (!Amount.validatePair(this.unit, unit)) { return }
        if (!unit) {unit = this.fit(dec);}
        return new Amount(stickThis ? this : this.valueOf(unit), unit, dec == null ? this.dec : dec);
    }

    valueOf(unit, dec) { 
        return Amount.fetch(this, unit, dec == null ? this.dec : dec); 
    }

    toString(unit, dec) {
        unit = unit || this.fit(dec); 
        return this.valueOf(unit, dec)+(Amount.validateUnit(unit, this.unit) || this.unit);
    }

    toJSON() { return this.toString(); }


}

Amount.validateUnit = (unit, force)=>{
    if (temp.index[unit]) { return unit; }
    if (force) { return ""; }
    //console.warn("Undefined amount units '"+unit+"'");
}

Amount.validatePair = (unit, parent, force)=>{
    unit = Amount.validateUnit(unit, force);
    parent = Amount.validateUnit(parent, force);
    if (unit && parent && temp.index[unit][parent]) { return unit; }
    if (force) { return ""; }
    //console.warn("Undefined amount relation '"+unit+"' to '"+parent+"'");
}

Amount.parse = (any)=>{
    const type = jet.type(any);
    if (type === "number") { return [any, ""]; }
    if (type === "array") { return [jet.num.to(any[0]), jet.str.to(any[1])] };
    if (type === "date") { return [Number(any), "ms"]; }
    if (jet.obj.is(any, true)) { return [jet.num.to(any.val), jet.str.to(any.unit)]; }
    const parse = (jet.str.to(any).match(jet.regex.strip(jet.regex.lib.num)+temp.match) || [])[0];
    if (!parse) { return [jet.num.to(any), ""]; }
    const unit = (parse.match(temp.match) || [])[0];
    const val = Number((parse.split(unit)[0] || "").replace(",", "."));
    return [val, unit];
}

Amount.fetch = (amount, unit, dec, full)=>{
    let [ aval, aunit ] = Amount.parse(amount); 
    aunit = Amount.validateUnit(aunit || unit);
    if (aunit && unit && aunit !== unit && Amount.validatePair(aunit, unit)) {
        aval = temp.index[aunit][unit](aval);
        aunit = unit;
    }
    if (jet.num.is(dec)) { aval = jet.num.round(aval, dec); }
    return full ? [aval, aunit] : aval
}

Amount.define = (unit, parent, exponent, path)=>{
    const index = temp.index
    const boundParent = index[parent] || (index[parent] = {});
    const boundUnit = index[unit] || (index[unit] = {});
    path = jet.arr.tap(path, [unit, parent]);
    if (boundParent[unit] || boundUnit[parent]) { throw new Error("Relation between amount units '" + unit + "' and '" + parent + "' can't be redefined!!!"); }

    boundParent[unit] = v => jet.num.x(v, "/", exponent)
    boundUnit[parent] = v => jet.num.x(v, "*", exponent)
    boundUnit[unit] = v => v;

    for (let k in boundParent) {
        if (path.includes(k)) { continue; } else { path.push(k); }
        Amount.define(unit, k, boundParent[k](exponent), path);
    }

    const list = temp.list = temp.list || new Sort("str", true, (a,b)=>a.length > b.length);

    list.add(unit);
    list.add(parent);

    temp.match = "("+jet.map.melt(list, "|")+")(?=[^a-zA-z])?";

    return true;
}
 

export default Amount;