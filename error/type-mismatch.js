const {toString} = Object.prototype
const givenTypeName = value => toString.call(value)
const TypeMismatch = (expected, value) => new Error(
    `expected ${expected} but got ${givenTypeName(value)}`
)

module.exports = TypeMismatch
