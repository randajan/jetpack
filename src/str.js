
import jet from "./index";


export default {
    to:function(any) { return jet.to("string", any); },
    lower: function (str) { return jet.str.to(str).toLowerCase() },
    upper: function (str) { return jet.str.to(str).toUpperCase() },
    capitalize: function (str) { str = jet.str.to(str); return str.charAt(0).upper() + str.slice(1); }, //first letter upcase,
    delone: function (str) {
        let r = "", { to, from } = jet.temp.clean;
        for (let v of jet.str.to(str)) { let x = from.indexOf(v); r += (x >= 0 ? to[x] : v); }
        return r;
    },
    efface: function (str, remove) { return jet.str.to(str).replace(remove, "").replace(/[\s\n\r]+/g, " ").trim(); },
    simplify: function (str, remove) { return jet.str.to(str).efface(remove).lower().delone(); },
    sort: function (...strs) {
        return strs.map(v => { const s = jet.str.to(v), d = s.delone(), l = d.lower(); return {l, d, s} })
            .sort((m1, m2) => {
                for (let i=0; true; i++) {
                    for (let k in m1) {
                        let c1 = m1[k].charCodeAt(i) || 0, c2 = m2[k].charCodeAt(i) || 0;
                        if (c1 !== c2 || !c1) { return c1 - c2; }
                    }
                }
            })
            .map(m=>m.s);
    },
    fight: function(...strs) {return jet.str.sort(...strs)[0];},
    carret: function (str, pos) { const l = jet.str.to(str).length; return jet.num.frame(jet.get("number", pos, l), 0, l); },
    splice: function (str, index, howmany, ...strs) {
        str = jet.str.to(str);
        const s = str.carret(index), m = jet.num.frame(howmany, 0, str.length-s); 
        return str.slice(0, s) + jet.obj.join(strs, "") + str.slice(s+m);
    },
    hide: function (str, pat, whitespace) {
        if (!str) { return str; } var r = "", s = str, p = jet.temp.hide[pat] || pat || "•", w = (whitespace === false);
        for (var i = 0; i < str.length; i++) { r += (w && (s[i] === "\n" || s[i] === " ")) ? s[i] : p.length - 1 ? jet.rnd.index(p) : p; } return r;
    },
    levenshtein: function (s0, s1, blend) {
        var s = ((blend === false) ? [s0, s1] : [s0.simplify(blend), s1.simplify(blend)]); if (s[0] === s[1]) { return 1; } else if (!s[0] || !s[1]) { return 0; }
        var l = [s[0].length, s[1].length], c = []; if (l[1] > l[0]) { l.reverse(); s.reverse(); }
        for (var i = 0; i <= l[0]; i++) {
            var oV = i; for (var j = 0; j <= l[1]; j++) {
                if (i === 0) { c[j] = j; } else if (j > 0) {
                    var nV = c[j - 1];
                    if (s[0].charAt(i - 1) !== s[1].charAt(j - 1)) { nV = Math.min(Math.min(nV, oV), c[j]) + 1; } c[j - 1] = oV; oV = nV;
                }
            } if (i > 0) { c[l[1]] = oV; }
        }
        return (l[0] - c[l[1]]) / parseFloat(l[0]);
    },
    mutate: function (str, factor) {
        var r = [], n = str.length / 2, m = str.length * 2, f = Math.abs(1000 * (factor || 1));
        while (r.length < f) { var s = jet.rnd.string(n, m); r.push([s, jet.str.levenshtein(s, str)]); }
        return r.sort(function (a, b) { return b[1] - a[1]; })[0][0];
    },
};