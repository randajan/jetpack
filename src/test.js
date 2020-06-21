import jet from "./index";


export default {
    byteCount(obj, cap) {
        const list = [];
        let s, sum = new jet.Amount(0, "kB", 2);
        cap = new jet.Amount(cap, "kB");
        jet.obj.map(obj, (v,p)=>{
            if (v != null) {
                sum.val += s = (k.length+v.length)*2/1024;
                list.push([p, new jet.Amount(s, "kB", 2).toString()]);
            }
            return v;
        }, true);
        return {load:(sum/cap)+"%", sum:sum.toString(), cap:cap.toString(), list:list.sort((r1, r2)=>r2[1]-r1[1])};
    },

    measurePerformance: function(fces, args, repeat) {
        const rep = repeat || 100,
            ladder = [],
            statis = {};
            
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