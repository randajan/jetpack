import jet from "../jet";

export default {
    run:function(any, ...args) {
        if (jet.fce.is(any)) { return any(...args); }
        return jet.map.it(any, f=>jet.fce.run(f, ...args));
    },
    measure:function(fces, args, repeat) {
        const rep = repeat || 100, ladder = [], statis = {};
            
        for (var i=1; i<=rep; i++) { 
            for (let fce of fces) {
                let stat = statis[fce.name];
                    
                if (!stat) {
                    statis[fce.name] = stat = {fce:fce.name, runtimeAvg:0, runtimeSum:0};
                    ladder.push(stat);
                };
                
                let now = performance.now();
                let result = fce.apply(this, args);
                let runtime = performance.now()-now;
                    
                stat.runtimeSum += runtime;
                stat.runtimeAvg = stat.runtimeSum / i;
            };
        };
        
        ladder.sort((a,b) => a.runtimeSum-b.runtimeSum);
        const best = ladder[0];
        
        for (let stat of ladder) {
            let factor = stat.runtimeSum / best.runtimeSum - 1;
            if (factor > 0) {
                stat.slowFactor = "+" + (Math.round(factor * 10000) / 100) + "%";
            }		
        }
    
        return {repeated:rep, ladder}
    }
}