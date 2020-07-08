import jet from "./jet";

class AmountError extends Error {

}

class Amount {

    static validateUnit(unit, force) {
        if (jet.temp.amount.conv[unit]) { return unit; }
        if (force) { return ""; }
        throw new AmountError("Undefined Amount units '"+unit+"'"); 
    }

    static validatePair(unit, parent, force) {
        unit = Amount.validateUnit(unit, force);
        parent = Amount.validateUnit(parent, force);
        if (unit && parent && jet.temp.amount.conv[unit][parent]) { return unit; }
        if (force) { return ""; }
        throw new AmountError("Undefined Amount relation '"+unit+"' to '"+parent+"'");
    }

    static parse(any) {
        const { number, amount } = jet.temp;
        const type = jet.type(any);
        if (type === "number") { return [any, ""]; }
        if (type === "array") { return [jet.num.to(any[0]), jet.str.to(any[1])] };
        if (type === "date") { return [Number(any), "ms"]; }
        if (jet.is("object", any, true)) { return [jet.num.to(any.val), jet.str.to(any.unit)]; }
        const parse = (jet.str.to(any).match(number.match+amount.match) || [])[0];
        if (!parse) { return [jet.num.to(any), ""]; }
        const unit = (parse.match(amount.match) || [])[0];
        const val = Number((parse.split(unit)[0] || "").replace(",", "."));
        return [val, unit];
    }

    static fetch(amount, unit, dec, full) {
        let [ aval, aunit ] = Amount.parse(amount); 
        aunit = Amount.validateUnit(aunit || unit);
        if (aunit && unit && aunit !== unit && Amount.validatePair(aunit, unit)) {
            aval = jet.temp.amount.conv[aunit][unit](aval);
            aunit = unit;
        }
        if (dec) { aval = jet.num.round(aval, dec); }
        return full ? [aval, aunit] : aval
    }
    
    static define(unit, parent, exponent, path) {
        const amount = jet.temp.amount;
        const { list, conv } = amount;
        const boundParent = conv[parent] || (conv[parent] = {});
        const boundUnit = conv[unit] || (conv[unit] = {});
        path = jet.get("array", path, [unit, parent]);
        if (boundParent[unit] || boundUnit[parent]) { throw new AmountError("Relation between Amount units '" + unit + "' and '" + parent + "' can't be redefined!!!"); }

        boundParent[unit] = v => jet.num.x(v, "/", exponent)
        boundUnit[parent] = v => jet.num.x(v, "*", exponent)
        boundUnit[unit] = v => v;

        for (let k in boundParent) {
            if (path.includes(k)) { continue; } else { path.push(k); }
            Amount.define(unit, k, boundParent[k](exponent), path);
        }

        list.add(unit);
        list.add(parent);
        jet.temp.amount.match = "("+jet.obj.melt(list, "|")+")(?=[^a-zA-z])?";

        return true;
    }

    static create(val, unit, dec) {
        return jet.is(Amount, val) ? val.convert(unit) : new Amount(val, unit, dec);
    }

    constructor(val, unit, dec) {
        const parent = (jet.is(Amount, val) && Amount.validatePair(unit, val.unit)) ? val : null;
        [ val, unit ] = Amount.fetch(val, unit, dec, true);

        if (dec) { this.dec = dec; }
        jet.obj.addProperty(this, "unit", unit);

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
        const fit = [];
        jet.obj.map(jet.temp.amount.conv[this.unit], (to, unit) => {
            const num = jet.num.round(to(this.val), dec == null ? this.dec : dec);
            if (num) {fit.push([unit, jet.num.length(num)]);}
        });
        return jet.isEmpty(fit) ? this.unit : fit.sort((a, b) => a[1] - b[1])[0][0];
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
 

export default Amount;