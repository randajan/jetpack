import Complex from "./custom/Complex";

const jet = {};

const magicMethod = ["only", "full", "tap", "pull", "is", "to", "copy", "rnd"];

function _i(any) {
    const t = typeof any;
    return (t === "function" || t === "object");
}
function _io(name, any) { return any instanceof name; } //is instance comparing
function _iu(any) { return (any === false || any === 0 || !!any)}

function _id(any, all, withDefinition) {
    const td = typeof any, wd = withDefinition, r = all ? [] : undefined; 
    if (any == null) { return r; }
    for (let t of jet.type.list) {
        if (!t.is(any, td)) { continue; }
        let n = wd ? t : t.name;
        if (r) { r.push(n) } else { return n; }
    }
    if (wd) { return r; } else if (!r) { return td; } else { r.push(td); return r; }
}

function _is(name, any, inclusive) {
    return _i(name) ? _io(name, any) : inclusive ? _id(any, true).includes(name) : name === _id(any);
}

function _touch(any, op, ...args) {
    const t = _id(any, false, true);
    if (t && t[op]) { return t[op](any, ...args); }
}

//0 = only, 1 = full, 2 = tap, 3 = pull
function _factory(name, mm, ...args) {
    const n = _i(name);
    const t = jet.type.index[name];
    if (n && mm > 0) { console.warn("Unable execute '"+magicMethod[mm]+"' - unavailable for constructors"); return; }
    if (!n && !t) { console.warn("Unable execute '"+magicMethod[mm]+"' - unknown type '"+name+"'"); return; }
    for (let a of args) {
        if (!n) {
            const at = _id(a, false, true);
            if (at && at.name === name && (mm !== 1 || at.full(a))) { return mm === 3 ? at.copy(a) : a; }
        }
        else if (_io(name, a)) { return a; }
    }
    if (mm > 1) { return t.create(); }
}

function _to(type, any, ...args) {
    const t = jet.type.index[type];
    if (!t) { console.warn("Unable execute 'to'. Unknown type '"+type+"'"); return; }
    const at = _id(any, false, true);
    if (!at) { return t.create(); }
    if (t.name === at.name) { return any; }
    const exe = at.to[type] || at.to["*"]; 
    return exe ? _to(type, exe(any, ...args), ...args) : t.create(any);
}

function _copy(any, ...args) {
    const t = _id(any, false, true);
    if (!t) { console.warn("Unable execute 'copy' unknown type '"+type+"'"); return; }
    return t.copy(any, ...args);
}

function _toDefine(from, to, exe) {
    const type = jet.type.index;
    const tt = _id(to);
    if (!type[from]) {throw new Error("Can't add conversion! Type '" + from + "' wasn't defined!!!");}
    const conv = type[from].to;
    if (tt === "arr") { for (let i in to) { conv[to[i]] = exe; } }
    else if (tt === "obj") { for (let i in to) { conv[i] = to[i]; } }
    else if (tt === "fce") { conv["*"] = to; }
    else { conv[to] = exe; }
}

function _expand(type, filter) {
    const t = jet.type.index[type]; if (!t) { return; }
    const p = t.constructor.prototype;
    const c = jet[type];

    for (let i in c) {
        if (p[i] || magicMethod.includes(i) || (filter && !filter.includes(i))) {continue;}
        Object.defineProperty(p, i, {
            enumerable:false,
            writable:false,
            value:typeof c[i] === "function" ? function(...a) { return c[i](this, ...a); } : c[i]
        });
    }
}

function _rndKey(arr, min, max, sqr) { //get random element from array or string
    if (!arr) { return; }
    arr = Array.from(arr);
    const l = arr.length;
    return arr[Math.floor(jet.num.rnd(jet.num.frame(min||0, 0, l), jet.num.frame(max||l, 0, l), sqr))];
};

jet.type = new Complex(
    (any, all)=>_id(any, all), 
    {
        list:[],
        index:{},
        all:any=>_id(any, true),
        raw:any=>_id(any, false, true),
        is:new Complex(
            _is,
            {
                kin:(name, any)=>_is(name, any, true),
                map:any=>{
                    const t = jet.type.raw(any);
                    return t ? !!t.pairs : false;
                },
                full:any=>{
                    const t = jet.type.raw(any);
                    return t ? t.full(any) : _iu(any);
                },
            }
        ),
        to:(name, any, ...a)=>_to(name, any, ...a),
        only:(name, ...a)=>_factory(name, 0, ...a),
        full:(name, ...a)=>_factory(name, 1, ...a),
        tap:(name, ...a)=>_factory(name, 2, ...a),
        pull:(name, ...a)=>_factory(name, 3, ...a),
        copy:(any, ...a)=>_copy(any, ...a),
        keys:any=>_touch(any, "keys"),
        vals:any=>_touch(any, "vals"),
        pairs:any=>_touch(any, "pairs"),
        key:new Complex(
            (any, key)=>_touch(any, "get", key),
            {
                set:(any, key, val)=>_touch(any, "set", key, val),
                rem:(any, key)=>_touch(any, "rem", key),
                rnd:(any, min, max, sqr)=>{
                    const t = jet.type.raw(any);
                    if (t.vals) { any = t.vals(any); } else if (typeof any !== "string") { return; }
                    return _rndKey(any, min, max, sqr);
                }
            }
        ),
        define:(name, constructor, opt, custom)=>{
            const { list, index } = jet.type;
            let { rank, create, is, full, copy, rnd, keys, vals, pairs, get, set, rem } = (opt || {});

            const err = "Jet type '" + name + "'";
            if (index[name]) {throw new Error(err+" is allready defined!!!");}
            if (jet[name]) {throw new Error(err+" is reserved!!!");}
            if (!constructor) {throw new Error(err+" missing constructor!!!");}
            if ((keys || vals || pairs) && !(keys && vals && pairs)) {throw new Error(err+" keys, vals or pairs missing!!!");}

            rank = rank || 0;
            create = create || ((...a)=>new constructor(...a));
            is = is || (any=>_io(constructor, any));
            full = full || _iu;
            copy = copy || (any=>any);
            rnd = rnd || create;

            const fix = {
                is:new Complex(
                    (any, inclusive)=>inclusive ? is(any, typeof any) : _is(name, any),
                    {
                        kin:any=>is(any, typeof any),
                        full:any=>is(any, typeof any) ? full(any) : false
                    }
                ),
                to:new Complex(
                    (any, ...a)=>_to(name, any, ...a),
                    {
                        define:(to, exe)=>_toDefine(name, to, exe)
                    }
                ),
                only:(...a)=>_factory(name, 0, ...a),
                full:(...a)=>_factory(name, 1, ...a),
                tap:(...a)=>_factory(name, 2, ...a),
                pull:(...a)=>_factory(name, 3, ...a),
                copy:(any, ...a)=>is(any, typeof any) ? copy(any, ...a) : undefined,
                rnd
            };

            if (pairs) {
                get = get || ((x, k)=>x[k]);
                set = set || ((x, k, v)=>x[k] = v);
                rem = rem || ((x, k)=>delete x[k]);

                fix.keys = any=>is(any, typeof any) ? keys(any) : undefined
                fix.vals = any=>is(any, typeof any) ? vals(any) : undefined
                fix.pairs = any=>is(any, typeof any) ? pairs(any) : undefined
                fix.key = new Complex(
                    (any, key)=>is(any, typeof any) ? get(any, key) : undefined,
                    {
                        set:(any, key, val)=>is(any, typeof any) ? set(any, key, val) : undefined,
                        rem:(any, key)=>is(any, typeof any) ? rem(any, key) : undefined,
                        rnd:(any, min, max, sqr)=>is(any, typeof any) ? _rndKey(vals(any), min, max, sqr) : undefined,
                    }
                );
            }

            list.push(index[name] = {
                rank, name, constructor, is, create, full, copy, keys, vals, pairs, get, set, rem,
                expand:filter=>_expand(name, filter), to:{}
            });

            list.sort((a,b)=>b.rank-a.rank);

            return jet[name] = new Complex(create, fix, custom);
        },
    },
);

export default jet;