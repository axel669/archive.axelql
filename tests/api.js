const { buildQueryEngine } = require("../index.js")

const apiSchema = `
    collection botSettings {
        query load (password string) -> {
            exists bool
            name ?string
            token ?string
            channel ?string
        }
    }
`
const aqlResolvers = {
    "botSettings.load": async (args, context) => {
        const { password } = args

        console.log(password)

        return {
            exists: false,
        }
    }
}
const aqlAPI = buildQueryEngine(aqlResolvers, apiSchema)

const query = `
botSettings: botSettings.load({"password": "test"}) {
    exists
    name
    token
    channel
}
`

const main = async () => {
    const result = await aqlAPI.query(query, {})

    console.log(result)
}

main()
