const types = require("./source.js")
const resolveValue = require("./resolve-value.js")
const TypeMismatch = require("../error/type-mismatch")

const check = value => {
    if (typeof value !== "boolean") {
        throw TypeMismatch("bool", value)
    }
}
const validate = (name, params) => {
    if (params !== null) {
        throw new Error(`Cannot request properties of bool(${name})`)
    }
}
const mask = async (item, info) => {
    const value = await resolveValue(item, info)
    check(value)
    return value
}

types.bool = {
    name: "bool",
    check,
    validate,
    mask,
    toJSON: () => ({type: "bool"})
}
