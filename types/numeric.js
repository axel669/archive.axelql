const types = require("./source.js")
const resolveValue = require("./resolve-value.js")
const TypeMismatch = require("../error/type-mismatch")

const isInt = value => (
    typeof value === "number"
    && (value % 1) === 0
)
const checkInt = value => {
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
    check: checkInt,
    validate: (name, params) => {
        if (params !== null) {
            throw new Error(`Cannot request properties of int(${name})`)
        }
    },
    mask: async (resolver, args, context) => {
        const value = await resolveValue(resolver, args, context)
        checkInt(value)
        return value
    },
    toJSON: () => ({type: "int"}),
}
types.number = {
    name: "number",
    check: checkNumber,
    validate: (name, params) => {
        if (params !== null) {
            throw new Error(`Cannot request properties of number(${name})`)
        }
    },
    mask: async (resolver, args, context) => {
        const value = await resolveValue(resolver, args, context)
        checkNumber(value)
        return value
    },
    toJSON: () => ({type: "number"}),
}
