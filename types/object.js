const types = require("./source.js")
const TypeMismatch = require("../error/type-mismatch")

const check = (value, props) => {
    for (const [name, type] of props) {
        type.check(value[name])
    }
}
const mask = (value, props) => props.reduce(
    (item, [name, type]) => {
        item[name] = type.mask(value[name])
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
        mask: value => mask(value, propList),
    }
}
