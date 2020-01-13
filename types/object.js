const types = require("./source.js")
const resolveValue = require("./resolve-value.js")
const TypeMismatch = require("../error/type-mismatch")

const check = (value, props, map) => {
    if (typeof value !== "object") {
        throw TypeMismatch("object", value)
    }
    for (const given of Object.keys(value)) {
        if (map[given] === undefined) {
            throw new Error(`Argument should not contain ${given}`)
        }
    }
    for (const [name, type] of props) {
        type.check(value[name])
    }
}
const validate = (propMap, name, params) => {
    if (params === null) {
        throw new Error(`${name} must have properties queried.`)
    }
    for (const [name, type] of Object.entries(params)) {
        if (propMap[name] === undefined) {
            throw new Error(`Cannot request property ${name}`)
        }
        propMap[name].validate(name, type)
    }
}
const mask = async (value, props, args, params, context) => {
    const item = {}
    for (const [name, type] of props) {
        if (params[name] !== undefined) {
            item[name] = await type.mask(value[name], args, params[name], context)
        }
    }

    return item
}

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
    const propMap = propList.reduce(
        (map, [name, type]) => {
            map[name] = type
            return map
        },
        {}
    )
    return {
        name: "object",
        check: value => check(value, propList, propMap),
        validate: (name, params) => validate(propMap, name, params),
        mask: async (resolver, args, params, context) => {
            const value = await resolveValue(resolver, args, context)
            return mask(value, propList, args, params, context)
        },
        toJSON: () => ({
            type: "object",
            props: propList,
        })
    }
}
