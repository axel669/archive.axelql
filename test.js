const types = require("./types.js")

// const types = {
//     int: {
//         name: "int",
//         check: value => {
//             if (isInt(value) === false) {
//                 throw TypeMismatch("int", value)
//             }
//         },
//         mask: value => {
//             types.int.check(value)
//             return value
//         }
//     },
//     string: {
//         check: value => {
//             if (isString(value) === false) {
//                 throw TypeMismatch("string", value)
//             }
//         },
//         mask: value => {
//             types.string.check(value)
//             return value
//         }
//     },
//     array: baseType => {
//         const check = value => {
//             if (Array.isArray(value) === false) {
//                 throw TypeMismatch("array", value)
//             }
//         }
//     },
//     composite: (source) => {
//         const checkList = Object.entries(source)
//         const check = value => {
//             for (const [name, type] of checkList) {
//                 type(value[name])
//             }
//             return value
//         }
//         const mask = value => checkList.reduce(
//             (item, [name, type]) => {
//                 item[name] = type(value[name])
//                 return item
//             },
//             {}
//         )
//         return (value, filter) => {
//             if (filter === true) {
//                 return mask(value)
//             }
//             return check(value)
//         }
//     }
// }
// const notNull = baseType =>
//     value => {
//         if (value === null || value === undefined) {
//             throw 1
//         }
//         return baseType(value)
//     }
// const nullable = baseType =>
//     value => {
//         if (value === null || value === undefined) {
//             return null
//         }
//         return baseType(value)
//     }
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
const aql = `
test query (n int) -> int
test2 query (name string) -> ?{
    name ?string
    age ?int
    breaks ?[int]
    info ?{
        wat int
    }
}
collection {
    test query (n !number) -> !number
}
`
const aqlr = `
nested collection.test({n: 100})
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
