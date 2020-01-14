const types = require("./source.js")
const resolveValue = require("./resolve-value.js")
const TypeMismatch = require("../error/type-mismatch")

const isNulled = value => (
    value === null
    || value === undefined
)
const check = (value, baseType) =>
    isNulled(value) ? null : baseType.check(value)
const mask = (value, baseType, info) =>
    isNulled(value) ? null : baseType.mask(value, info)

types.nullable = baseType => ({
    name: `?${baseType.name}`,
    check: value => check(value, baseType),
    validate: (name, params) => baseType.validate(name, params),
    mask: async (item, info) => {
        const value = await resolveValue(item, info)
        return mask(value, baseType, info)
    },
    toJSON: () => ({
        baseType,
        type: "nullable",
    })
})
