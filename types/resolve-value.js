module.exports = (value, info) =>
    (typeof value === "function") ? value(info) : value
