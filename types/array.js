const types = require("./source.js")
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
const mask = (value, baseType) => {
    isArray(value, baseType)
    return value.map(item => baseType.mask(item))
}

types.array = baseType => ({
    name: `[${baseType.name}]`,
    check: value => check(value, baseType),
    mask: (resolver, args) => {
        const value = (typeof resolver === "function")
            ? resolver(args)
            : resolver
        return mask(value, baseType)
    },
})
