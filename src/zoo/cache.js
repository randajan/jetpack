
import jr from "./jrLib";

export default jr.cache = new class Cache {
	constructor(defaultTimeout) {
        this.addProperty({
            check:this.check,
            get:this.get,
            set:this.set,
            setDefault:this.setDefault,
            toString:this.toString,
            clear:this.clear,
            _defaults:{}, 
            _timeouts:{}, 
            _defaultTimeout:defaultTimeout||-1
        });
    }
    check(path) {
        var timeout = jr.obj.get(this._timeouts, path, 0);
        return (timeout < 0 || (new Date() < timeout));
    }
    get(path, skipCheck) {
        var def = jr.obj.get(this._defaults, path);
        if (jr.is(def, "function")) {
            def = def(path);}
        else if (jr.is(def, "object")) {
            def = jr.obj.copy(null, def, true);
        }

        return (skipCheck || this.check(path)) ? jr.obj.get(this, path, def) : def
    }
    set(path, value, timeout) {
        var t = jr.str.toNum(timeout == null ? this._defaultTimeout : timeout);
        jr.obj.set(this._timeouts, path, (t > 0 ? (new Date((new Date())-0+t)) : t));
        return jr.obj.set(this, path, value, true);
    }
    setDefault(path, value) {
        return jr.obj.set(this._defaults, path, value, true);
    }
    clear(path) {
        return jr.obj.set(this, path, null, true);
    }
    toString() {
        return jr.obj.join(this, ",\n", "=", "", '"');
    }
}