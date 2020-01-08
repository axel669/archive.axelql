{
	const types = {
    	int: "int",
        string: "string",
        number: "number",
        bool: "bool",
        array: base => `[${base}]`,
        object: (...props) => `{${props.map(p => p.join(": ")).join(", ")}}`,
        nullable: base => `?${base}`,
    }
}

API
	= things:(_ Definition _)* {
    	return things.map(thing => thing[1])
    }

Definition = Query / Collection
Query
	= "query" __ name:Name __ "(" args:ArgList ")" _ "->" _ returnType:Type {
    	return {
        	type: "query",
            name,
            args,
            returnType,
        }
    }
Collection
	= "collection" __ name:Name __ "{" parts:(_ Definition _)* "}" {
    	return {
        	type: "collection",
            name,
            parts: parts.map(p => p[1]),
        }
    }

Name
	= $([a-zA-Z] [a-zA-Z0-9\-_]*)

ArgList
	= first:Arg tail:(_ "," _ Arg)* {
    	const list = [
        	first,
            ...tail.map(arg => arg[3])
        ]
        return list.reduce(
        	(args, [name, type]) => {
            	args[name] = type
                return args
            },
            {}
        )
    }
    / _ {
    	return {}
    }

Arg
	= name:Name __ type:Type {
    	return [name, type]
    }

Type
	= "?" base:BaseType {return types.nullable(base)}
    / BaseType
BaseType
	= "int" {return types.int}
    / "string" {return types.string}
    / "number" {return types.number}
    / "bool" {return types.bool}
    / "[" _ subType:Type _ "]" {
    	return types.array(subType)
    }
    / ObjectType
ObjectType
	= "{" _ props:(_ (Name __ Type / ObjectType) _)+ _ "}" {
    	return types.object(
        	...props.map(prop => {
                if (Array.isArray(prop[1])) {
                	return [prop[1][0], prop[1][2]]
                }
                return [prop[1]]
            })
        )
    }

_ "whitespace"
	= [ \t\n\r]*
__ "require whitespace"
	= [ \t\n\r]+
