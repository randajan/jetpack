import jet from "../jet";

let GID = 0;

class Engage extends Promise {

    static $$jettype = Symbol("engage");
    static states = ["waiting", "running", "result", "error", "cancel", "timeout"];

    static is(instance) { return instance && instance.$$jettype === Engage.$$jettype; }

    constructor(exe, timeout, parent) {
        parent = Engage.is(parent) ? parent : undefined;
        const enumerable = true
        const _priv = {
            id:GID++,
            parent,
            timeout,
            pending:true,
            state:"running",
            create:jet.date(),
            start:undefined,
            end:undefined,
            error:undefined,
            result:undefined,
            msg:{}
        };

        const desc = jet.map.of(_priv, (v,k)=>({enumerable, get:_=>_priv[k]}));

        desc.state = { enumerable, get:_=> {
            return (parent && parent.pending && _priv.pending) ? "waiting" : _priv.state
        } }
        desc.msg = { enumerable, get:_=>jet.str.to(_priv.msg[this.state], this) }

        desc.start = { enumerable, get:_=>
            !parent ? _priv.create : 
            parent.pending ? undefined : 
            parent.end > _priv.create ? parent.end : _priv.create
        }
        desc.timein = { enumerable, get:_=>this.start ? Math.max(0, jet.date.tap(_priv.end)-this.start) : 0};

        super((resolve, reject)=>{
            let tid;

            desc.break = { value:(state, data)=>{
                if (!_priv.pending) { return false; }
                if (!Engage.states.includes(state)) { return false; }
                _priv.pending = false;
                _priv.state = state;
                _priv.end = jet.date();
                clearInterval(tid);
                if (state === "result") { _priv[state] = data; resolve(data); }
                else if (state === "error") { _priv[state] = data; reject(data); }
                else { resolve(); }
                return true;
            } }

            desc.cancel = { value:_=>status.break("cancel") }
            desc.throw = { value:error=>status.break("error", error) }
            desc.resolve = { value:result=>status.break("result", result) }
            
            const status = Object.defineProperties({}, desc);

            if (timeout) { tid = setInterval(_=>{if (status.timein > status.timeout) { status.break("timeout"); }} , 100); }

            if (jet.fce.is(exe)) { exe(status); }
            else if (jet.prom.is(exe)) { exe.then(status.resolve, status.throw); }
            else { status.resolve(exe); }

        });

        jet.obj.prop.add(this, "$$jettype", Engage.$$jettype);
        Object.defineProperties(this, desc);

        const _then = this.then.bind(this);
        
        jet.obj.prop.add(this, {
            is:state=>this.state === state,
            catch:(oncatch, timeout)=>{
                let child;
                return child = new Engage(_then(undefined, err=>oncatch(err, child)), timeout);
            },
            finally:(onfinally, timeout)=>{
                let child;
                return child = new Engage(_then(_=>onfinally(child), _=>onfinally(child)), timeout, this);
            },
            then:(onresolve, onreject, timeout)=>{
                let child;
                const exe = res=>jet.fce.run(this.is("result") ? onresolve : onreject, res, child);
                return child = new Engage(_then(exe, exe), timeout, this);
            },
            echo:(state, msg)=>{
                if (jet.obj.is(state)) { jet.map.it(state, (v,k)=>this.echo(k,v)); }
                else if (jet.fce.is(state)) {Engage.states.map(k=>this.echo(k, state)); }
                else if (Engage.states.includes(state)) { _priv.msg[state] = msg; }
                return this;
            }
        });

    }
}


export default Engage;