const types = require("./types.js")

// const schema = require("./parsers/schema.js")
// const query = require("./parsers/query.js")

const buildQueryEngine = require("./build-query-engine.js")

const aql = `
query hero (name string) -> {
    name
    type
}

heroes: hero({name: "test"}) {
    name
    age
}

collection wat {
    query test (n number) -> number
}
query inherit () -> {
    test ?string
    {
        mixin int
    }
    nested {
        wat string
    }
}

query user (email string) -> ?{
    active bool
    name string
    email string
    ids ?[string]
    origin [?{
        name string
        server string
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
`
const aqlr = `
user user({email: "cmorgan@skechers.com"})
global test2({name: "wat"}) {
    name
    age
    breaks
    info
}
`
// const test = genquery(
//     {
//         n: types.int,
//     },
//     types.array(
//         types.nullable(types.int)
//         // types.int
//     ),
//     args => [args.n ** 2, null]
// )
// const custom = genquery(
//     {
//         name: types.string,
//     },
//     types.object({
//         name: types.nullable(types.string),
//         age: types.nullable(types.int),
//         breaks: types.nullable(
//             types.array(types.int)
//         ),
//         info: types.object({
//             planet: types.string,
//             orbitDist: types.number,
//         }),
//     }),
//     (args) => ({
//         name: args.name,
//         age: 1000,
//         breaks: [1, 2, 3, 4],
//         info: {
//             planet: "Earth C137",
//             orbitDist: 1.01,
//         },
//     })
// )
// console.log(test)
// console.log(
//     execute(test, {n: 5}, {})
// )
//
// console.log(
//     execute(
//         custom,
//         {
//             name: "wat",
//         },
//         {
//             name: null,
//             breaks: null,
//             info: {
//                 // planet: null,
//                 orbitDist: null,
//             },
//         }
//     )
// )

// const watQuery = query.parse()
// console.log(watQuery)

// const watConstruct = genquery(
//     wat[1].args,
//     wat[1].returnType,
//     (args, context) => {
//         return {
//             name: args.name,
//             email: args.email,
//             id: () => Math.random().toString(16),
//         }
//     }
// )
// console.log(
//     execute(watConstruct, watQuery[0].args, watQuery[0].params, null)
// )

const wait = time => new Promise(
    resolve => setTimeout(resolve, time)
)

const genID = () => Math.random().toString(16)
const dataSource = {
    [genID()]: {
        email: "axel@axel669.net",
        name: "Axel",
        notes: "The biggest deal",
        count: {
            followers: 80,
            subscribers: 1,
        },
    },
    [genID()]: {
        email: null,
        name: "ZRealBigDeal",
        notes: "Not really a big deal",
        count: {
            followers: 0,
            subscribers: 0,
        },
    }
}
const nmatch = (a, b) => (
    a === b
    && a !== null
    && a !== undefined
)
const resolvers = {
    "math.square": ({n}) => n ** 2,
    "math.squareList": async args => {
        // await wait(1000)
        return args.numbers.map(n => n ** 2)
    },
    "math.exponent": ({info}) => info.n ** info.power,
    "createUser": args => {
        const user = {
            name: args.name,
            email: args.email,
            notes: args.notes,
        }

        const id = genID()
        dataSource[id] = user
        return {
            id,
            ...user,
        }
    },
    "user.find": args => {
        for (const [id, user] of Object.entries(dataSource)) {
            if (nmatch(user.email, args.email) || nmatch(user.name, args.name)) {
                const userResult = {id, ...user}
                // console.log(userResult)
                return userResult
            }
        }
        return null
    },
}
const thingSchema = `{
    count int
}`
const userSchema = `{
    id string
    name string
    email ?string
    notes ?string
    count {
        followers int
        subscribers int
    }
}`
const powerArgs = `{
    n number
    power number
}`
const serverSchema = `
    collection math {
        query square (n number) -> number
        query squareList (numbers [number]) -> [number]
        query exponent (info ${powerArgs}) -> number
    }
    collection user {
        query find (email ?string, name ?string) -> ?${userSchema}
    }
    mutate createUser (email string, name string) -> ${userSchema}
`

// console.log(serverSchema)

const engine = buildQueryEngine(resolvers, serverSchema)

// const stuff = makeQuerySources(resolvers, wat)

// console.log(stuff)
// console.log(watQuery)

const formatParams = params => {
    if (params === null || params === undefined) {
        return ""
    }
    if (typeof params === "string") {
        return params
    }
    const list = Array.isArray(params) ? params : Object.entries(params)
    const props = list
        .map(
            param => {
                if (Array.isArray(param)) {
                    return `${param[0]} ${formatParams(param[1])}`
                }
                return formatParams(param)
            }
        )
        .join(" ")
    return `{${props}}`
}
const makeQueryString = (parts) => {
    const mapped = Object.entries(parts).map(
        ([varName, {fn, args, params}]) =>
            `${varName}: ${fn}(${JSON.stringify(args)}) ${formatParams(params)}`
    )
    return mapped.join("\n")
}

const rq = `
    newUser: createUser({"email": "thing@thing.com", "name": "Test"}) {
        id
        email
        name
        notes
    }
`
const rq2 = `
    theBiggsetDeal: user.find({"name": "Axel"}) {
        id
        name
        notes
        // wat
        count {
            subscribers
        }
    }
    theSecondBiggsetDeal: user.find({"name": "ZRealBigDeal"}) {
        id
        name
        notes
        count {
            followers
        }
    }
    test: user.find({"name": "Test"}) {
        id
        name
    }
    number: math.square({"n": 20})
`

const numbers = Array.from(
    {length: 10},
    (_, i) => i
)
const args = {
    numbers,
}
const squareList = `
squares: math.squareList(${JSON.stringify(args)})
`

const main = async () => {
    console.log(
        await engine.mutate(rq)
    )
    console.log(
        JSON.stringify(
            await engine.query(rq2),
            null,
            2
        )
    )
    console.log(
        await engine.query(squareList)
    )
    console.log(
        await engine.query(
            makeQueryString({
                nums: {
                    fn: "math.exponent",
                    args: {
                        n: 5,
                        power: 3,
                        info: {n:0, power: 0},
                    },
                },
            })
        )
    )
}

main()
