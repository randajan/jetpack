import Complex from "./custom/Complex";

const jet = {};

const magicMethod = ["only", "full", "tap", "pull", "is", "to", "copy", "rnd"];

function _identify(any, all, withDefinition) {
    const td = typeof any, wd = withDefinition, r = all ? [] : undefined; 
    if (any == null) { return r; }
    for (let type of jet.type.list) {
        if (!type.is(any, td)) { continue; }
        let n = wd ? type : type.name;
        if (r) { r.push(n) } else { return n; }
    }
    if (wd) { return r; } else if (!r) { return td; } else { r.push(td); return r; }
}

//0 = only, 1 = full, 2 = tap, 3 = pull
function _factory(type, mm, ...args) {
    const t = jet.type.index[type];
    if (!t) { console.warn("Unable execute '"+magicMethod[mm]+"' unknown type '"+type+"'"); return; }
    for (let a of args) {
        if (!t.is(a, typeof a) || (mm === 1 && !t.full(a))) {continue;}
        return mm === 3 ? t.copy(a) : a;
    }
    if (mm > 1) { return t.create(); }
}

function _to(type, any, ...args) {
    const t = jet.type.index[type];
    if (!t) { console.warn("Unable execute 'to'. Unknown type '"+type+"'"); return; }
    const at = jet.type.raw(any);
    if (!at) { return t.create(); }
    if (t.name === at.name) { return any; }
    const exe = at.to[type] || at.to["*"]; 
    return exe ? _to(type, exe(any, ...args), ...args) : t.create(any);
}

function _copy(any, ...args) {
    const t = jet.type.raw(any);
    if (!t) { console.warn("Unable execute 'copy' unknown type '"+type+"'"); return; }
    return t.copy(any, ...args);
}

function _toDefine(from, to, exe) {
    const type = jet.type.index;
    const tt = jet.type(to);
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

jet.type = new Complex(
    (any, all)=>_identify(any, all), 
    {
        list:[],
        index:{},
        all:any=>_identify(any, true),
        raw:any=>_identify(any, false, true),
        is:new Complex(
            (name, any, inclusive)=>{
                const t = typeof name;
                if (t === "function" || t === "object") {return any instanceof name;} //is instance comparing
                return inclusive ? jet.type.all(any).includes(name) : name === jet.type(any);
            },
            {
                kin:(name, any)=>jet.type.is(name, any, true),
                map:any=>{
                    const t = jet.type.raw(any);
                    return t ? !!t.pairs : false;
                },
                full:any=>{
                    const t = jet.type.raw(any);
                    return t ? t.full(any) : (any === false || any === 0 || !!any);
                },
            }
        ),
        to:(name, any, ...a)=>_to(name, any, ...a),
        only:(name, ...a)=>_factory(name, 0, ...a),
        full:(name, ...a)=>_factory(name, 1, ...a),
        tap:(name, ...a)=>_factory(name, 2, ...a),
        pull:(name, ...a)=>_factory(name, 3, ...a),
        copy:(any, ...a)=>_copy(any, ...a),
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
            is = is || (any=>any instanceof constructor);
            full = full || (any=>any === false || any === 0 || !!any);
            copy = copy || (any=>any);
            rnd = rnd || create;

            if (pairs) {
                get = get || ((x, k)=>x[k]);
                set = set || ((x, k, v)=>x[k] = v);
                rem = rem || ((x, k)=>delete x[k]);
            }

            jet[name] = new Complex(create, {
                is:new Complex(
                    (any, inclusive)=>inclusive ? is(any, typeof any) : jet.type.is(name, any),
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
            }, custom);

            list.push(index[name] = {
                expand:filter=>_expand(name, filter),
                rank,
                name,
                constructor,
                is,
                create,
                full,
                copy,
                keys,
                vals,
                pairs,
                get,
                set,
                rem,
                to:{}
            });

            list.sort((a,b)=>b.rank-a.rank);
            return true;
        },
    },
);

export default jet;