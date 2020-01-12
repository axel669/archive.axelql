const { buildQueryEngine } = require("../index.js")

const apiSchema = `
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
`
const aqlResolvers = {
    "botSettings.load": async (args, context) => {
        const { password } = args

        console.log(password)

        return {
            exists: false,
        }
    },
    "botSettings.list": () => [
        {id: "hi", wat: "wat"}
    ]
}
const aqlAPI = buildQueryEngine(aqlResolvers, apiSchema)

const query = `
list: botSettings.list({}) {
    id
    wat
}
`

const main = async () => {
    const result = await aqlAPI.query(query, {})

    console.log(result.data)
}

main()
