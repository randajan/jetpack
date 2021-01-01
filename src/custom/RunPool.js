import jet from "../jet";
import Pool from "./Pool";

class RunPool extends Pool {
    constructor(...runwith) {
        super("fce", true);
        jet.obj.prop.add(this, "with", runwith);
    }

    run(...args) {
        return jet.fce.run(this, ...this.with, ...args);
    }

    fit(...args) {
        let i = 0; args = [...this.with, ...args];

        const next = (...a)=>{
            const k = i++, l = a.length; 
            a = a.concat(args); a.splice(l, l);
            return this[k] ? this[k](next, ...a) : a[0];
        };

        return next();
    }

    classify(item) {
        const index = super.classify(item);
        if (this.pending && index >= 0 && !this.has(item)) {
            this.pending.push(item);
        }
        return index;
    }

    addAndRun(...items) {
        this.pending = [];
        this.add(...items);
        delete this.pending;
        return this.run();
    }
}

export default RunPool;