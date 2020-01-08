const types = require("./types.js")

const query = (args, returnType, resolver) => {
    return {
        resolver,
        args: Object.entries(args),
        argNames: new Set(
            Object.keys(args)
        ),
        returnType,
    }
}
const otherNested = `
{
    why bool
}
`
const baseType = `
{
    planet ?string
    ${otherNested}
}
`
const aql = `
query user (email string, withOrigins ?bool) -> {
    name string
    email string
    ids ?[string]
    origin [{
        name string
        server string
        ${baseType}
    }]
}
query test (n int) -> int
query test2 (name string) -> ?{
    name ?string
    age ?int
    breaks ?[int]
    info ?{
        wat int
    }
}
collection wat {
    query test (n number) -> number
}
`
const aqlr = `
user user({email: "cmorgan@skechers.com"
global test2({name: "wat"}) {
    name
    age
    breaks
    info
}
`
console.log(types)
const test = query(
    {
        n: types.int,
    },
    types.array(
        types.nullable(types.int)
        // types.int
    ),
    args => [args.n ** 2, null]
)
const custom = query(
    {
        name: types.string,
    },
    types.object({
        name: types.nullable(types.string),
        age: types.int,
        breaks: types.nullable(
            types.array(types.int)
        ),
        info: types.nullable(
            types.array(types.string)
        ),
    }),
    (args) => ({
        name: args.name,
        // age: 1000,
        breaks: [1, 2, 3, 4],
    })
)
const checkArgs = (expected, given) => {
    for (const [name, type] of expected) {
        // console.log(name, type, given[name])
        type.check(given[name])
    }
}
const execute = (source, args) => {
    const errors = []
    try {
        checkArgs(source.args, args)
        const value = source.resolver(args)
        return source.returnType.mask(value)
    }
    catch (err) {
        console.error(err)
    }
}
console.log(test)
console.log(
    execute(test, {n: 5})
)

console.log(
    execute(
        custom,
        {
            name: "wat",
        }
    )
)
