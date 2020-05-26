import jet from "./index.js";


export default {
    x: function (num1, symbol, num2) {
        const s = symbol, nums = jet.num.zoomIn(num1, num2), [n, m] = nums;
        if (s === "/") { return n/m; }
        if (s === "*") { return n*m/Math.pow(nums.zoom, 2); }
        return (s === "+" ? n + m : s === "-" ? n - m : s === "%" ? n % m : NaN) / nums.zoom;
    },
    frame: function (num, min, max) { var r = Math.min(num, jet.filter("number", max, num)); return Math.max(r, jet.filter("number", min, r)); },
    round: function (num, dec, kind) { const k = Math.pow(10, dec || 0); return Math[kind == null ? "round" : kind ? "ceil" : "floor"](num * k) / k; },
    length: function (num, bol) { var b = bol, s = String(num), l = s.length, i = s.indexOf("."), p = (i >= 0); return (b === false ? (p ? l - i - 1 : 0) : ((!p || !b) ? l : i)); },
    period: function (val, min, max) { var m = max - min; return (m + (val - min) % m) % m + min; },
    toRatio: function (num, min, max) { var x = Number(num), n = Number(min || 0), t = Number(max || 100) - n; return (x - n) / t; },
    fromRatio: function (num, min, max) { var x = Number(num), n = Number(min || 0), t = Number(max || 100) - n; return x * t + n; },
    zoomIn: function (...nums) {
        const zoom = Math.pow(10, Math.max(...nums.map(num => jet.num.length(num, false))));
        return jet.obj.addProperty(nums.map(num => Math.round(num * zoom)), "zoom", zoom);
    },
    zoomOut: function (nums) { return nums.map(num => num / nums.zoom); },
    diffusion: function (num, min, max, diffusion) { var d = num * diffusion; return jet.num.random(Math.max(min, num - d), Math.min(max, num + d)); },
    snap: function (num, step, min, max, ceil, frame) {
        var v = num, s = step, n = min, m = max, ni = (n != null), mi = (m != null), c = ceil, f = (frame !== false);
        if (v == null || s == null || s <= 0 || !(ni || mi)) { return v; } else if (f) { v = jet.num.frame(v, n, m); }
        var r = ni ? v - n : m - v; v = (r % s) ? ((ni ? n : m) + (jet.num.round(r / s, 0, c == null ? null : c === ni) * s * (ni * 2 - 1))) : v; //snap
        return (f ? (jet.num.frame(v, n, m)) : v); //frame
    },
    toHex: function (num) { var r = Number(Math.round(num)).toString(16); return r.length === 1 ? "0" + r : r; },
    toLetter: function(num, letters) {
        letters = jet.get("string", letters) || "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const len = letters.length;
        return (num >= len ? jet.num.toLetter(Math.floor(num / len) -1) : '') + letters[num % len];
    }
};