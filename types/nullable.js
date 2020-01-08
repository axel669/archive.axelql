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
    mask: value => mask(value, baseType),
})
