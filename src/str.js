
import jet from "./index";


export default {
    delone: function(str) {var s = String(str), r = "", m = jet.temp.clean, t = m.to, f = m.from; for (var i=0; i < s.length; i++) {var v = s[i], x = f.indexOf(v); r += (x >= 0 ? t[x] : v);} return r;},
    efface: function(str, remove) {return String(str).replace(remove, "").replace(/[\s\n\r]+/g, " ").trim();},
    simplify: function(str, remove) {return String(str).efface(remove).toLowerCase().delone();},
    toNum: function(str, strict) {return (str == null || jet.is("number", str)) ? str : Number(strict ? str : (String(str).match(jet.regex.num)||[]).join("").replace(",", "."));},
    carret: function(str, val) {const l = str.length; return jet.num.frame(jet.get("number", val, l), 0, l);},
    insert: function(str, val, start, end) {var s = str.carret(start||0), e = Math.max(s, str.carret(end)); return str.slice(0, s) + val + str.slice(e);}, //insert in string
    capitalize: function(str) {if (!str) {return str;}; return str.charAt(0).toUpperCase() + str.slice(1);}, //first letter upcase,
    hide: function(str, pat, whitespace) {
        if (!str) {return str;} var r = "", s = str, p = jet.temp.hide[pat] || pat || "•", w = (whitespace === false);
        for (var i=0; i < str.length; i++)  {r += (w && (s[i] === "\n" || s[i] === " ")) ? s[i] : p.length-1 ? jet.rnd.index(p) : p;} return r;
    },
    fight: function(s0, s1, bol) {
        var i = 0, s = [String(s0), String(s1)]; for (var j in s) {var l = s[j].toLowerCase(), c = l.clean(); s[j] = {v:s[j], q:[c, l, s[j]], r:(bol ? s[j] : (j === 0))};} //create compare card
        if (!s[0].v) {return s[1].r;} else if (!s[1].v || s[0].v === s[1].v) {return s[0].r;} // in case exit
        while (true) {for (var y in s[0].q) {var r0 = s[0].q[y].charCodeAt(i), r1 = s[1].q[y].charCodeAt(i); if (r0 !== r1) {return (!r0 || r0 > r1) ? s[1].r : (!r1 || r1 > r0) ? s[0].r : null;}} i++;}
    },
    levenshtein: function(s0, s1, blend) {
        var s = ((blend === false) ? [s0, s1] : [s0.blend(blend), s1.blend(blend)]); if (s[0] === s[1]) {return 1;} else if (!s[0] || !s[1]) {return 0;}
        var l = [s[0].length, s[1].length], c = []; if (l[1] > l[0]) {l.reverse(); s.reverse();} 
        for (var i = 0; i <= l[0]; i++) {var oV = i; for (var j = 0; j <= l[1]; j++) {if (i === 0) {c[j] = j;} else if (j > 0) {var nV = c[j - 1]; 
        if (s[0].charAt(i - 1) !== s[1].charAt(j - 1)) {nV = Math.min(Math.min(nV, oV), c[j]) + 1;} c[j - 1] = oV; oV = nV;}} if (i > 0) {c[l[1]] = oV;}}
        return (l[0] - c[l[1]]) / parseFloat(l[0]);
    },
    mutate: function(str, factor) {
        var r = [], n = str.length/2, m = str.length*2, f = Math.abs(10000*(factor||1));
        while (r.length < f) {var s = jet.rnd.string(n, m); r.push([s, jet.str.levenshtein(s, str)]);}
        return r.sort(function(a, b) {return b[1]-a[1]; })[0][0];
    },
};