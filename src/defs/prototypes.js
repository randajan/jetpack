import jet from "../jet";

jet.obj.map(jet.str, f=>jet.obj.addProperty(String.prototype, f.name, function(...args) {return f(this, ...args);}, false, false, false));

jet.obj.map(jet.arr, f=>jet.obj.addProperty(Array.prototype, f.name, function(...args) {return f(this, ...args);}, false, false, false));

jet.obj.addProperty(Promise.prototype, "engage", function(timeout) { return new jet.Engage(this, timeout); });