const { buildQueryEngine } = require("../index.js")

const wait = time => new Promise(
    resolve => setTimeout(resolve, time)
)

const apiSchema = /* GraphQL */`
    collection botSettings {
        mutate load (password string) -> {
            exists bool
            name ?string
            token ?string
            channel ?string
        }

        mutate list () -> [{
            id string
            wat string
        }]
    }

    query power (n number, exp number) -> number
`
const aqlResolvers = {
    "botSettings.load": async (args, context) => {
        const { password } = args
        console.log(context)

        context.pw = password

        // await wait(500)

        // console.log(password)

        return {
            exists: password === "wat",
            name: async (args, context) => {
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
    # name
}
`

const main = async () => {
    const result = await aqlAPI.mutate(query, {})

    console.log(
        JSON.stringify(
            result.data,
            null,
            2
        )
    )

    console.log(aqlAPI.schema)
}

main()
