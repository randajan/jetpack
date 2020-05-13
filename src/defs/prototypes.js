import jet from "../jet";

jet.obj.map(jet.str, f=>jet.obj.addProperty(String.prototype, f.name, function(...args) {return f(this, ...args);}, false, true, false));

jet.obj.map(jet.arr, f=>jet.obj.addProperty(Array.prototype, f.name, function(...args) {return f(this, ...args);}, false, true, false));
