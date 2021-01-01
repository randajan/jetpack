import jet from "../jet";
import Amount from "../custom/Amount";
import Sort from "../custom/Sort";

export default {
    prop:{
        add:function(obj, property, val, writable, enumerable, overwrite) { 
            overwrite = jet.bol.tap(overwrite, true);
            if (jet.type.is.map(property)) {
                jet.map.it(property, (f, i)=>{
                    const n = jet.str.isNumeric(i);
                    jet.obj.prop.add(obj, n ? f : i, n ? val : f, writable, enumerable, overwrite)
                });
            } else if (!obj[property] || overwrite) {
                Object.defineProperty(obj, property, {value:val, writable:!!writable, configurable:!!writable, enumerable:!!enumerable});
            }
            return obj;
        },
        get:function(obj, property) {
            if (!property) { property = Array.from(Object.getOwnPropertyNames(obj)); }
            if (!jet.type.is.map(property)) { return obj[property]; }
            const props = {};
            jet.map.it(property, k=>props[k]=obj[k]);
            return props;
        }
    },
    json:{
        from:function(json, throwErr) {
            if (jet.type.is.map(json)) { return json; }
            try { return JSON.parse(jet.str.to(json)); } catch(e) { if (throwErr === true) { throw e } }
        },
        to:function(obj, prettyPrint) {
            const spacing = jet.num.only(prettyPrint === true ? 2 : prettyPrint);
            return JSON.stringify(jet.type.is.map(obj) ? obj : {}, null, spacing);
        }
    },
    measure(obj, cap) {
        const sort = new Sort("arr", false, (a,b)=>a[1]>b[1])
        const sum = new Amount(0, "kB", 2);
        cap = new Amount(cap, "kB");
        jet.map.it(obj, (v,p)=>{
            if (v == null) { return; }
            let s = (p.split(".").pop().length + (jet.bol.is(s) ? 1 : String(v).length))*2/1024;
            sort.add([p, s]);
            sum.val += s;
        }, true);
        const audit = [];
        jet.map.it(sort, v=>audit.push([
            v[0],
            new Amount(v[1], "kB").toString(null, 2),
            jet.num.round(v[1]/sum*100, 2)+"%"
        ]))
        return {
            load:jet.num.round(sum/cap*100, 2)+"%",
            sum:sum.toString(null, 2),
            cap:cap.toString(null, 2),
            audit
        };
    }
};