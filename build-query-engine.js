const schema = require("./parsers/schema.js")
const query = require("./parsers/query.js")

const compileHandler = (args, returnType, resolver) => ({
    resolver,
    args: Object.entries(args),
    argNames: new Set(
        Object.keys(args)
    ),
    returnType,
})

const concatName = (parent, name) =>
    [parent, name]
        .filter(part => part !== null)
        .join(".")
const addResponse = (resolvers, target, parent, info) => {
    const name = concatName(parent, info.name)
    if (resolvers[name] === undefined) {
        throw new Error(`No resolver defined for ${name}`)
    }
    target[name] = compileHandler(
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
const compileQuerySources = (resolvers, source) => {
    const query = {}
    const mutate = {}

    for (const entry of source) {
        addItem(resolvers, query, mutate, null, entry)
    }

    return {query, mutate}
}

const checkArgs = (expected, named, given) => {
    for (const givenName of Object.keys(given)) {
        if (named.has(givenName) === false) {
            throw new Error(`${givenName} is not a valid argument.`)
        }
    }
    for (const [name, type] of expected) {
        type.check(given[name])
    }
}
const execute = (source, args, params, context) => {
    checkArgs(source.args, source.argNames, args)
    return source.returnType.mask(source.resolver, args, params, context)
}

const validate = (queryList, source) => {
    for (const query of queryList) {
        const info = source[query.func]
        if (info === undefined) {
            throw new Error(`No resolver found for ${query.func}`)
        }
        info.returnType.validate(`${query.func}()`, query.params)
    }
}
const processRequest = async (queryString, source, context) => {
    const parsedQuery = query.parse(queryString)

    validate(parsedQuery, source)

    const result = {
        data: {},
        errors: {},
    }
    for (const query of parsedQuery) {
        try {
            result.data[query.name] = await execute(
                source[query.func],
                query.args,
                query.params,
                context
            )
        }
        catch (error) {
            result.errors[query.name] = {
                message: error.message,
                stack: error.stack,
            }
        }
    }

    return result
}

const tryMod = (func, mod) => {
    try {
        return func()
    }
    catch (error) {
        throw mod(error)
    }
}
const stripComments = str =>
    str.replace(/(#|\/\/)[^\n]*/g, "")
const buildQueryEngine = (resolvers, schemaText) => {
    const schemaSource = tryMod(
        () => schema.parse(
            stripComments(schemaText)
        ),
        error => {
            if (error.location !== undefined) {
                const {message, location} = error
                const {start} = location
                const locString = `line ${start.line} col ${start.column}`
                error.message = `Schema parse error at ${locString} - ${message}`
            }
            console.log(error)
            return error
        }
    )
    const engine = compileQuerySources(resolvers, schemaSource)

    return {
        query: (queryString, context) => processRequest(
            stripComments(queryString),
            engine.query,
            context
        ),
        mutate: (queryString, context) => processRequest(
            stripComments(queryString),
            engine.mutate,
            context
        ),
    }
}

module.exports = buildQueryEngine
