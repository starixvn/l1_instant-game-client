const numberWithCommas = (number, toFixed = 2, noZeroSuffix = true) => {
    if (number) {
        const result = parseFloat(number).toFixed(toFixed).toString().split(".");
        result[0] = result[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");

        if (noZeroSuffix) {
            return +result[1] !== 0 ? result.join(".") : result[0];
        } else {
            return result.join(".");
        }
    }
    return "0";
};

const nFormatter = (num, digits = 0) => {
    const si = [
        { value: 1, symbol: "" },
        { value: 1e3, symbol: "K" },
        { value: 1e6, symbol: "M" },
        { value: 1e9, symbol: "G" },
        { value: 1e12, symbol: "T" },
        { value: 1e15, symbol: "P" },
        { value: 1e18, symbol: "E" }
    ];
    const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
    let i;
    for (i = si.length - 1; i > 0; i--) {
        if (num >= si[i].value) {
            break;
        }
    }
    if (num < 1e3) {
        return `${num}`;
    }
    return (num / si[i].value).toFixed(digits).replace(rx, "$1") + si[i].symbol;
};

const getOnlyNumberInString = (t: string) => {
    const e = t.match(/\d+/g);

    return e ? e.join("") : "";
};

const numberPad = (number: any, length: number) => {
    let str = `${number}`;

    while (str.length < length) {
        str = `0${str}`;
    }

    return str;
};

const numberTo = (obj, start, end, duration, currency = false) => {
    clearInterval(obj.timer);
    const range = end - (parseFloat(obj.string.replace(/,/g, "")) || 0);
    const minTimer = 50;
    let stepTime = Math.abs(Math.floor(duration / range));
    stepTime = Math.max(stepTime, minTimer);
    const startTime = new Date().getTime();
    const endTime = startTime + duration;

    obj.timer = setInterval(function () {
        if (!!obj.node) {
            const now = new Date().getTime();
            const remaining = Math.max((endTime - now) / duration, 0);
            const value = (end - remaining * range) >> 0;
            obj.string = currency ? numberWithCommas(value) : value;
            if (value === end) {
                clearInterval(obj.timer);
            }
        } else {
            clearInterval(obj.timer);
        }
    }, stepTime);
};

const zeroPad = (num: number, places: number) => {
    const zero = places - num.toString().length + 1;
    return Array(+(zero > 0 && zero)).join("0") + num;
};

export { numberWithCommas, getOnlyNumberInString, numberPad, numberTo, zeroPad, nFormatter };
