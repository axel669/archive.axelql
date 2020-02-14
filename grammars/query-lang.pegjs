{
	const variables = arguments[2] || {}
}

Input
	= requests:(_ Request _)+ {
		return requests.map(req => req[1])
	}

Request
	= name:Name _ ":" _ func:FunctionName "(" args:JSONArgs ")" _ params:RequestParams? {
    	return {
        	name,
            func,
            params,
            args,
        }
    }

Variable
	= "$" name:Name {
    	return {name}
    }

RequestParams
	= "{" _ params:(Name (__ RequestParams)? _)+ "}" {
    	return Object.freeze(
			params.reduce(
				(p, [name, subParams]) => {
					p[name] = subParams && subParams[1]
					return p
				},
				{}
			)
		)
	}

JSONArgs
	= JSON
	/ JSONEntries

JSON
	= JSONObject
    / JSONArray
    / JSONString
    / JSONNumber
    / JSONNull
    / JSONBool
	/ JSONVariable
JSONObject
	= "{" _ "}" {
		return {}
	}
	/ "{" _ value:JSONEntries "}" {return value}
JSONEntries
	= head:JSONObjectEntry _ tail:("," _ JSONObjectEntry _)* {
		return [head, ...tail.map(t => t[2])].reduce(
			(obj, {name, value}) => {
				obj[name] = value
				return obj
			},
			{}
		)
	}
JSONObjectEntry
	= name:(JSONString / Name) _ ":" _ value:JSON {
		return {name, value}
	}
JSONArray
	= "[" _ "]" {
		return []
	}
	/ "[" _ head:JSON _ tail:("," _ JSON _)* "]" {
		return [
			head,
			...tail.map(t => t[2])
		]
	}
JSONString
	= json:$('"' ([^"])* '"') {
		return JSON.parse(json)
	}
JSONNumber
	= json:$([0-9]+ ("." [0-9]+)? (("e" / "E") [0-9]+)?) {
		return JSON.parse(json)
	}
JSONNull = "null" {return null}
JSONBool =
	value:("true" / "false") {
		return value === "true"
	}
JSONVariable
	= "$" name:Name {
		return variables[name]
	}

Name
	= $([a-zA-Z] [a-zA-Z0-9\-_]*)
FunctionName
	= $(Name ("." Name)*)

_ "whitespace"
	= [ \t\n\r]*
__ "require whitespace"
	= [ \t\n\r]+
