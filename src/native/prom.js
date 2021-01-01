import jet from "../jet";

import Engage from "../custom/Engage";

export default {
    engage:(prom, timeout)=>new Engage(prom, timeout)
}