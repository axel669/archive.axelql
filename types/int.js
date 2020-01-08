const types = require("./source.js")
const TypeMismatch = require("../error/type-mismatch")

const isInt = value => (
    typeof value === "number"
    && (value % 1) === 0
)
const check = value => {
    if (isInt(value) === false) {
        throw TypeMismatch("int", value)
    }
}

types.int = {
    name: "int",
    check,
    mask: value => {
        check(value)
        return value
    },
}
