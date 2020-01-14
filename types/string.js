const types = require("./source.js")
const resolveValue = require("./resolve-value.js")
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
    validate: (name, params) => {
        if (params !== null) {
            throw new Error(`Cannot request properties of string(${name})`)
        }
    },
    mask: async (item, info) => {
        const value = await resolveValue(item, info)
        check(value)
        return value
    },
    toJSON: () => ({type: "string"}),
}
