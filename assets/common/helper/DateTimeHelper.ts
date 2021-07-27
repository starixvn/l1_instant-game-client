import * as moment from "moment";

const getStringDateByTime = (t) => {
    return moment(new Date(t)).format("HH:mm DD/MM/YYYY");
};

const formatDateTime = (t) => {
    return moment(new Date(t)).format("HH:mm:ss DD/MM/YYYY");
};

const getStringHourByTime = (t) => {
    return moment(new Date(t)).format("HH:mm:ss");
};

export { getStringDateByTime, formatDateTime, getStringHourByTime };
