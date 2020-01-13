const types = require("./source.js")
const resolveValue = require("./resolve-value.js")
const TypeMismatch = require("../error/type-mismatch")

const isNulled = value => (
    value === null
    || value === undefined
)
const check = (value, baseType) =>
    isNulled(value) ? null : baseType.check(value)
const mask = (value, baseType, args, params, context) =>
    isNulled(value) ? null : baseType.mask(value, args, params, context)

types.nullable = baseType => ({
    name: `?${baseType.name}`,
    check: value => check(value, baseType),
    validate: (name, params) => baseType.validate(name, params),
    mask: async (resolver, args, params, context) => {
        const value = await resolveValue(resolver, args, context)
        return mask(value, baseType, args, params, context)
    },
    toJSON: () => ({
        baseType,
        type: "nullable",
    })
})
