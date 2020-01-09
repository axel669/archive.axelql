const types = require("./source.js")
const TypeMismatch = require("../error/type-mismatch")

const isInt = value => (
    typeof value === "number"
    && (value % 1) === 0
)
const check = value => {
    if (isInt(value) === false) {
        throw TypeMismatch("int", value)
    }
}

const isNumber = value => typeof value === "number"
const checkNumber = value => {
    if (isNumber(value) === false) {
        throw TypeMismatch("number", value)
    }
}

types.int = {
    name: "int",
    check,
    mask: (resolver, args) => {
        const value = (typeof resolver === "function")
            ? resolver(args)
            : resolver
        check(value)
        return value
    },
}
types.number = {
    name: "number",
    check: checkNumber,
    mask: (resolver, args) => {
        const value = (typeof resolver === "function")
            ? resolver(args)
            : resolver
        checkNumber(value)
        return value
    },
}
