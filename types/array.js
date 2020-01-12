const types = require("./source.js")
const resolveValue = require("./resolve-value.js")
const TypeMismatch = require("../error/type-mismatch")

const isArray = (value, baseType) => {
    if (Array.isArray(value) === false) {
        throw TypeMismatch(`array[${baseType.name}]`, value)
    }
}
const check = (value, baseType) => {
    isArray(value, baseType)
    for (const item of value) {
        if (baseType.check(item) === false) {
            throw TypeMismatch(baseType.name, item)
        }
    }
}
const mask = async (value, baseType) => {
    isArray(value, baseType)
    const masked = await Promise.all(
        value.map(item => baseType.mask(item))
    )
    return masked
}

types.array = baseType => ({
    name: `[${baseType.name}]`,
    check: value => check(value, baseType),
    validate: (name, params) => {
        if (params !== null) {
            throw new Error(`Cannot request properties of array(${name})`)
        }
    },
    mask: async (resolver, args, context) => {
        const value = await resolveValue(resolver, args, context)
        return mask(value, baseType)
    },
})
