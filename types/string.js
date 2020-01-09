const types = require("./source.js")
const TypeMismatch = require("../error/type-mismatch")

const isString = value => typeof value === "string"

const check = value => {
    if (isString(value) === false) {
        throw TypeMismatch("string", value)
    }
}

types.string = {
    name: "string",
    check,
    mask: (resolver, args) => {
        const value = (typeof resolver === "function")
            ? resolver(args)
            : resolver
        check(value)
        return value
    },
}
