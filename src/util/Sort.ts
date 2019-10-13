export function sortSortedArrays(
    values,
    biggerThan,
    condition = (e, result) => true
) {
    const pointer = values.map(e => 0);
    const result = [];
    let e;

    do {
        e = pointer.reduce((prev, cur, i) => {
            if (cur < values[i].length) {
                if (prev !== null) {
                    return biggerThan(
                        values[i][cur],
                        values[prev][pointer[prev]]
                    )
                        ? i
                        : prev;
                } else {
                    return i;
                }
            }
            return prev;
        }, null);

        if (e !== null) {
            if (condition(values[e][pointer[e]], result)) {
                result.push(values[e][pointer[e]]);
            }
            pointer[e]++;
        }
    } while (e !== null);
    return result;
}

export class SortedHashMap {
    data = [];
    size = 10;
    biggerThan;
    getKey;

    constructor(sortedData = [], getKey: Function, biggerThan: Function, size) {
        this.getKey = getKey;
        this.biggerThan = biggerThan;
        this.size = size;
        this.setData(sortedData);
    }

    setData(multiSortedData) {
        const set = new Set();
        let i = 0;
        this.data = sortSortedArrays(multiSortedData, this.biggerThan, e => {
            if (set.has(this.getKey(e)) || i >= this.size) {
                return false;
            }
            i++;
            set.add(this.getKey(e));
            return true;
        });
    }
}
