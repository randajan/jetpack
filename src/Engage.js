import jet from "./jet";

class Engage extends Promise {

    static $$jettype = Symbol("engage");
    static states = ["waiting", "pending", "result", "error", "cancel", "timeout"];

    static is(instance) { return instance && instance.$$jettype === Engage.$$jettype; }

    constructor(exe, timeout, parent) {

        const enumerable = true
        const _priv = {
            parent,
            timeout,
            state:"pending",
            create:new Date(),
            start:undefined,
            end:undefined,
            error:undefined,
            result:undefined
        };

        const desc = jet.obj.map(_priv, (v,k)=>({enumerable, get:_=>_priv[k]}));

        desc.state = { enumerable, get:_=> (parent && parent.is("pending") && _priv.state === "pending") ? "waiting" : _priv.state }
        desc.start = { enumerable, get:_=>
            !parent ? _priv.create : 
            parent.is("pending") ? undefined : 
            parent.end > _priv.create ? parent.end : _priv.create
        }

        desc.timein = { enumerable, get:_=>this.start ? Math.max(0, jet.get("date", _priv.end)-this.start) : 0};

        super((resolve, reject)=>{
            let tid;

            desc.break = { value:(state, data)=>{
                if (_priv.state !== "pending") { return false; }
                if (!Engage.states.includes(state)) { return false; }
                _priv.state = state;
                _priv.end = new Date();
                clearInterval(tid);
                if (state === "result") { _priv[state] = data; resolve(data); }
                else if (state === "error") { _priv[state] = data; reject(data); }
                else { resolve(); }
                return true;
            } }

            desc.cancel = { value:_=>this.break("cancel") }
            desc.throw = { value:error=>this.break("error", error) }
            desc.resolve = { value:result=>this.break("result", result) }
            
            const status = Object.defineProperties({}, desc);

            if (timeout) { tid = setInterval(_=>{if (status.timein > status.timeout) { this.break("timeout"); }} , 100); }

            if (jet.is("function", exe)) { return exe(status); }
            if (jet.is("promise", exe) || Engage.is(exe)) { exe.then(status.resolve, status.throw); }
            
        });

        jet.obj.addProperty(this, "$$jettype", Engage.$$jettype);
        Object.defineProperties(this, desc);

        const _then = this.then.bind(this);
        const _finally = this.finally.bind(this);
        const _catch = this.catch.bind(this);
        jet.obj.addProperty(this, {
            is:state=>this.state === state,
            catch:(oncatch, timeout)=>{
                let child;
                return child = new Engage(_catch(_=>oncatch(child)), timeout, this)
            },
            finally:(onfinally, timeout)=>{
                let child;
                return child = new Engage(_finally(_=>onfinally(child)), timeout, this)
            },
            then:(onresolve, onreject, timeout)=>{
                let child;
                const exe = _=>jet.run(this.is("result") ? onresolve : onreject, child);
                return child = new Engage(_then(exe, exe), timeout, this);
            },
        });
    }
}


export default Engage;