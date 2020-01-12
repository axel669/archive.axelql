module.exports = (value, args, context) =>
    (typeof value === "function") ? value(args, context) : value
