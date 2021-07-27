const getLowercaseObjectKeys = (data) => {
    return Object.keys(data).reduce((keys, key) => {
        keys[key.toLowerCase()] = key;
        return keys;
    }, {});
};

export { getLowercaseObjectKeys };
