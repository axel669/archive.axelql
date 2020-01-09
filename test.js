const types = require("./types.js")

const schema = require("./parsers/schema.js")
const query = require("./parsers/query.js")

const genquery = (args, returnType, resolver) => {
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
const test = genquery(
    {
        n: types.int,
    },
    types.array(
        types.nullable(types.int)
        // types.int
    ),
    args => [args.n ** 2, null]
)
const custom = genquery(
    {
        name: types.string,
    },
    types.object({
        name: types.nullable(types.string),
        age: types.nullable(types.int),
        breaks: types.nullable(
            types.array(types.int)
        ),
        info: types.object({
            planet: types.string,
            orbitDist: types.number,
        }),
    }),
    (args) => ({
        name: args.name,
        age: 1000,
        breaks: [1, 2, 3, 4],
        info: {
            planet: "Earth C137",
            orbitDist: 1.01,
        },
    })
)
const checkArgs = (expected, given) => {
    for (const [name, type] of expected) {
        // console.log(name, type, given[name])
        type.check(given[name])
    }
}
const execute = (source, args, params, context) => {
    const errors = []
    try {
        checkArgs(source.args, args)
        // const value = source.resolver(args)
        return source.returnType.mask(source.resolver, args, params, context)
    }
    catch (err) {
        console.error(err)
    }
}
// console.log(test)
console.log(
    execute(test, {n: 5}, {})
)

console.log(
    execute(
        custom,
        {
            name: "wat",
        },
        {
            name: null,
            breaks: null,
            info: {
                // planet: null,
                orbitDist: null,
            },
        }
    )
)

const wat = schema.parse(`
    collection math {
        query square (n number) -> number
    }
    mutate createUser (email string, name string) -> {
        id string
        name string
        email string
    }
`)
const watQuery = query.parse(`
    newUser: createUser({"email": "axel@axel669.net", "name": "Axel"}) {
        id
        email
    }
`)
console.log(watQuery)

const watConstruct = genquery(
    wat[1].args,
    wat[1].returnType,
    (args, context) => {
        return {
            name: args.name,
            email: args.email,
            id: () => Math.random().toString(16),
        }
    }
)
console.log(
    execute(watConstruct, watQuery[0].args, watQuery[0].params, null)
)

const resolvers = {
    "math.square": ({n}) => n ** 2,
    "createUser": args => {
        return {
            name: args.name,
            email: args.email,
            id: () => Math.random().toString(16),
        }
    },
}
const concatName = (parent, name) =>
    [parent, name]
        .filter(part => part !== null)
        .join(".")
const addResponse = (resolvers, target, parent, info) => {
    const name = concatName(parent, info.name)
    target[name] = genquery(
        info.args,
        info.returnType,
        resolvers[name]
    )
}
const addCollection = (resolvers, query, mutate, parent, info) => {
    const name = concatName(parent, info.name)

    for (const part of info.parts) {
        addItem(resolvers, query, mutate, name, part)
    }
}
const addItem = (resolvers, query, mutate, parent, info) => {
    if (info.type === "collection") {
        return addCollection(resolvers, query, mutate, parent, info)
    }
    if (info.type === "query") {
        return addResponse(resolvers, query, parent, info)
    }
    addResponse(resolvers, mutate, parent, info)
}
const makeQuerySources = (resolvers, source) => {
    const query = {}
    const mutate = {}

    for (const entry of source) {
        addItem(resolvers, query, mutate, null, entry)
    }

    return {query, mutate}
}

const stuff = makeQuerySources(resolvers, wat)

console.log(stuff)
console.log(watQuery)
