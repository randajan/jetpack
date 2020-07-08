
import jet from "./jet";


export default {
    secToTime:function(sec) {
        if (!sec || !jet.is(sec, "number") || sec <= 0) {return "";}
        var t = Math.floor(sec), s = t % 60, m = (t-s) % 3600, h = (t-m-s)/3600; m /= 60;
        return (h ? (h+":"+(m < 10 ? "0" : "")) : "")+((h || m) ? m+":"+(s < 10 ? "0" : "") : "")+s;
    }
};