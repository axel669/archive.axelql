const types = require("./source.js")
const TypeMismatch = require("../error/type-mismatch")

const isNulled = value => (
    value === null
    || value === undefined
)
const check = (value, baseType) =>
    isNulled(value) ? null : baseType.check(value)
const mask = (value, baseType) =>
    isNulled(value) ? null : baseType.mask(value)

types.nullable = baseType => ({
    name: `?${baseType.name}`,
    check: value => check(value, baseType),
    mask: (resolver, args) => {
        const value = (typeof resolver === "function")
            ? resolver(args)
            : resolver
        return mask(value, baseType)
    },
})
