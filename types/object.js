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

types.object = collection => {
    const props = Object.entries(collection)
    return {
        name: "object",
        check: value => check(value, props),
        mask: value => mask(value, props),
    }
}
