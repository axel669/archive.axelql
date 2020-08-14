const {buildQueryEngine} = require("../index.js")

const wait = time => new Promise(
    resolve => setTimeout(resolve, time)
)

const apiSchema = /* GraphQL */`
    collection botSettings {
        query load (password string) -> {
            exists bool
            name ?string
            token ?string
            channel ?string
        }

        query list () -> [{
            id string
            wat string
        }]
    }

    query power (n number, exp number) -> number
`
const aqlResolvers = {
    "botSettings.load": async ({args, context, params}) => {
        const { password } = args
        // console.log(context)
        params.test = "wat"
        // console.log(params)

        context.pw = password

        // await wait(500)

        // console.log(password)

        return {
            exists: password === "wat",
            name: async ({args, context}) => {
                // await wait(500)
                return context.pw
            }
        }
    },
    "botSettings.list": () => [
        {id: "hi", wat: "wat"}
    ],
    power: ({n, exp}) => n ** exp,
}
const aqlAPI = buildQueryEngine(aqlResolvers, apiSchema)

const query = /* GraphQL */`
first: botSettings.load({"password": "wat"}) {
    exists
    name
}
second: botSettings.load({"password": "notwat"}) {
    exists
    name
}
third: botSettings.load($test) {
    exists
    name
}
fourth: botSettings.load(password: $pw) {
    exists
    name
}
`

const main = async () => {
    console.time("speed")
    const result = await aqlAPI.query(
        query,
        {
            test: {password: "wat"},
            pw: "notwat",
        },
        {}
    )
    console.timeEnd("speed")

    console.log(
        JSON.stringify(
            result,
            null,
            2
        )
    )

    console.log(JSON.stringify(aqlAPI.schema, null, 2))
}

main()
