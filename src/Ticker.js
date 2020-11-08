import jet from "./jet";

let GID = 0;


class Ticker {
    static $$jettype = Symbol("ticker");
  
    static is(instance) { return instance && instance.$$jettype === Ticker.$$jettype; } 
  
    constructor(callback, ...ticks) {
        const enumerable = true;
        const _priv = {
            id:GID++,
            pending:true,
            state:"waiting",
            start:undefined,
            end:undefined,
            duration:0,
            tick:0,
            last:ticks.length-1
        };

        const desc = jet.obj.map(_priv, (v,k)=>({enumerable, get:_=>_priv[k]}));

        desc.timein = { enumerable, get:_=>this.start ? Math.max(0, jet.get("date", _priv.end)-this.start) : 0};

        desc.progres = { enumerable, get:_=>jet.num.frame(this.timein/this.duration, 0, 1)};

        let timers;
        ticks = ticks.map(ms=>_priv.duration += jet.num.to(ms));

        const next = (tick, cancel)=>{
            if (!_priv.pending) { return false; }
            if (cancel) { timers.map(clearTimeout); }
            _priv.pending = (!cancel && tick < _priv.last);
            _priv.state = cancel ? "cancel" : _priv.pending ? "running" : "done";
            _priv.tick = tick;

            jet.run(callback, this);

            if (!_priv.pending) { _priv.end = new Date(); }
            return true;
        };

        desc.cancel = { value:_=>next(_priv.tick, true) }

        jet.obj.addProperty(this, "$$jettype", Ticker.$$jettype);
        Object.defineProperties(this, desc);
        console.log(ticks);
        _priv.start = new Date();
        timers = ticks.map((ms,tick)=>setTimeout(_=>next(tick), ms));
        console.log(timers);
    }
  
  
  
  }

export default Ticker;