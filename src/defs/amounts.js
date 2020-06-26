import jet from "../jet";

jet.Amount.define("s", "ms", 1000);
jet.Amount.define("m", "s", 60);
jet.Amount.define("h", "m", 60);
jet.Amount.define("d", "h", 24);
jet.Amount.define("w", "d", 7);
jet.Amount.define("y", "d", 365);

jet.Amount.define("dl", "ml", 100);
jet.Amount.define("l", "dl", 10);
jet.Amount.define("hl", "l", 100);

jet.Amount.define("g", "mg", 1000);
jet.Amount.define("kg", "g", 1000);
jet.Amount.define("t", "kg", 1000);

jet.Amount.define("kB", "B", 1000);
jet.Amount.define("mB", "kB", 1000);
jet.Amount.define("gB", "mB", 1000);
jet.Amount.define("tB", "gB", 1000);

jet.Amount.define("kb", "b", 1000);
jet.Amount.define("mb", "kb", 1000);
jet.Amount.define("gb", "mb", 1000);
jet.Amount.define("tb", "gb", 1000);

jet.Amount.define("cm", "mm", 10);
jet.Amount.define("M", "cm", 100);
jet.Amount.define("km", "M", 1000);
