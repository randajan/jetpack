import jet from "./index";

class AmountError extends Error {

}

class Amount {

    static validateUnit(unit, force) {
        if (jet.temp.units[unit]) { return unit; }
        if (force) { return ""; }
        throw new AmountError("Undefined Amount units '"+unit+"'"); 
    }

    static validatePair(unit, parent, force) {
        unit = Amount.validateUnit(unit, force);
        parent = Amount.validateUnit(parent, force);
        if (unit && parent && jet.temp.units[unit][parent]) { return unit; }
        if (force) { return ""; }
        throw new AmountError("Undefined Amount relation '"+unit+"' to '"+parent+"'");
    }

    static parse(any) {
        if (jet.is("number", any)) { return [any, ""]; }
        if (jet.is("array", any)) { return [jet.num.to(any[0]), jet.str.to(any[1])] };
        if (jet.is("date", any)) { return [Number(any), "ms"]; }
        if (jet.is("object", any, true)) { return [jet.num.to(any.val), jet.str.to(any.unit)]; }
        any = jet.str.to(any);
        const val = jet.num.to(any);
        const unit = any.split(String(val))[1];
        return [val, unit];
    }

    static fetch(amount, unit, dec, full) {
        let [ aval, aunit ] = Amount.parse(amount); 
        aunit = Amount.validateUnit(aunit || unit);
        if (aunit && unit && aunit !== unit && Amount.validatePair(aunit, unit)) {
            aval = jet.temp.units[aunit][unit](aval);
            aunit = unit;
        }
        if (dec) { aval = jet.num.round(aval, dec); }
        return full ? [aval, aunit] : aval
    }
    
    static define(unit, parent, exponent, path) {
        const units = jet.temp.units;
        const boundParent = units[parent] || (units[parent] = {});
        const boundUnit = units[unit] || (units[unit] = {});
        path = jet.get("array", path, [unit, parent]);
        if (boundParent[unit] || boundUnit[parent]) { throw new AmountError("Relation between Amount units '" + unit + "' and '" + parent + "' can't be redefined!!!"); }

        boundParent[unit] = v => jet.num.x(v, "/", exponent)
        boundUnit[parent] = v => jet.num.x(v, "*", exponent)
        boundUnit[unit] = v => v;

        for (let k in boundParent) {
            if (path.includes(k)) { continue; } else { path.push(k); }
            Amount.define(unit, k, boundParent[k](exponent), path);
        }
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
        jet.obj.map(jet.temp.units[this.unit], (to, unit) => {
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