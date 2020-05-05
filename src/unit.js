import jet from "./index";

export default {
    validate: function (unit, parent) {
        const parents = jet.temp.units[unit];
        return parents && (!parent || parents[parent]) ? unit : "";
    },
    convert: function (num, inUnit, outUnit, dec) {
        num = jet.str.toNum(num);
        num = (inUnit && outUnit && jet.unit.validate(inUnit, outUnit)) ? jet.temp.units[inUnit][outUnit](num) : num;
        return dec ? jet.num.round(num, dec) : num;
    },
    define: function (unit, parent, exponent, path) {
        const units = jet.temp.units;
        const boundParent = units[parent] || (units[parent] = {});
        const boundUnit = units[unit] || (units[unit] = {});
        path = jet.get("array", path, [unit, parent]);

        if (boundParent[unit] || boundUnit[parent]) { throw "Relation between '" + unit + "' and '" + parent + "' units can't be redefined!!!"; }

        boundParent[unit] = v => jet.num.x(v, "/", exponent)
        boundUnit[parent] = v => jet.num.x(v, "*", exponent)
        boundUnit[unit] = v => v;

        for (let k in boundParent) {
            if (path.includes(k)) { continue; } else { path.push(k); }
            jet.unit.define(unit, k, boundParent[k](exponent), path);
        }
        return true;
    }
}