const types = require("./source.js")
const TypeMismatch = require("../error/type-mismatch")

const check = (value, props) => {
    for (const [name, type] of props) {
        type.check(value[name])
    }
}
const mask = (value, props, args, params) => props.reduce(
    (item, [name, type]) => {
        if (params[name] !== undefined) {
            item[name] = type.mask(value[name], args, params[name])
        }
        return item
    },
    {}
)

types.object = (...props) => {
    const propList = props.reduce(
        (list, prop) => {
            if (Array.isArray(prop) === true) {
                return [
                    ...list,
                    prop
                ]
            }
            return [
                ...list,
                ...Object.entries(prop),
            ]
        },
        []
    )
    // const props = Object.entries(collection)
    return {
        name: "object",
        check: value => check(value, propList),
        mask: (resolver, args, params, context) => {
            const value = (typeof resolver === "function")
                ? resolver(args, context)
                : resolver
            return mask(value, propList, args, params, context)
        },
    }
}
