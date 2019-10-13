import * as nzh from "nzh/cn";
export class TimeTranslator {
    static ALPHABET = {
        万: { value: 10000, unit: true },
        千: { value: 1000, unit: true },
        百: { value: 100, unit: true },
        十: { value: 10, unit: true },
        九: { value: 9, unit: false },
        八: { value: 8, unit: false },
        七: { value: 7, unit: false },
        六: { value: 6, unit: false },
        五: { value: 5, unit: false },
        四: { value: 4, unit: false },
        三: { value: 3, unit: false },
        二: { value: 2, unit: false },
        一: { value: 1, unit: false },
        元: { value: 1, unit: true },
        零: { value: 0, unit: false }
    };
    static YEAR_WORD = "年";

    prefix: string;
    year: number;

    /**
     * Assume some format:
     *      1. country(alias) + emperor name(alias) + era + year
     *      2. country(alias) + emperor name(alias) + year
     *      3. country(alias) + year
     *      4. era + year
     *      5. emperor's real name(alias) + year
     *
     * Assume format: Prefix + Year
     *
     */

    constructor(s: string) {
        this.prefix = "";
        this.year = 1;

        // check whether has Arabic Number
        const year = s.match(/[0-9]+/g);
        if (year) {
            const pos = s.indexOf(year.toString());
            this.prefix = s.substr(0, pos);
            this.year = parseInt(year[0]);
            this.year = this.year >= 1 ? this.year : 1;
            return;
        }

        // check whether has Chinese Number
        let start, end;
        for (let i = s.length - 1; i >= 0; i--) {
            if (TimeTranslator.ALPHABET[s[i]]) {
                end = end ? end : i;
            } else if (end) {
                start = start ? start : i + 1;
            }
        }
        start = start ? start : 0;
        if (start && end) {
            this.prefix = s.substr(0, start);
            this.year = nzh.decodeS(s.substr(start, end - start + 1));
            this.year = this.year >= 1 ? this.year : 1;
            return;
        }

        // No Number Found
        this.prefix = s;
    }

    static translate(prefix: string, offset: number, from: number) {
        if (from === 0) {
            return (
                prefix +
                " 在位第" +
                nzh.encodeS(offset + 1) +
                TimeTranslator.YEAR_WORD
            );
        }
        if (offset === 0) {
            return prefix + "元" + TimeTranslator.YEAR_WORD;
        }
        return prefix + nzh.encodeS(offset + from) + TimeTranslator.YEAR_WORD;
    }

    static sub(a: number, b: number): number {
        if (a * b < 0) {
            return a - b - 1;
        }
        return a - b;
    }
}
