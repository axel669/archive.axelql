// const types = require("./types.js")
const {buildQueryEngine} = require("./index.js")

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


const engine = buildQueryEngine(resolvers, serverSchema)

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
                        // n: 5,
                        // power: 3,
                        info: {n:0, power: 0},
                    },
                },
            })
        )
    )
}

main()
