import jet from "../jet";
import Pool from "./Pool";

class Sort extends Pool {
    constructor(filter, flat, onClassify) {
        super(filter, flat)
        jet.obj.prop.add(this, "onClassify", new Pool("fce", true));
        this.onClassify.add(onClassify);
    }

    classify(item) {
        let i = 0, k = 0, l = this.length, c = this.onClassify;
        if (super.classify(item) < 0) { return -1; } else if (!c.length) { return l; }
        for (i = 0; i < l; i++) {
            if (item === this[i]) { k = 1; continue; }
            let b = false;
            for (let j in c) { b = c[j](item, this[i]); if (b != null) { break; } }
            if (b) { break; }
        };
        return i - k;
    }
}

export default Sort;