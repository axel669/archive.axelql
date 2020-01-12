Input
	= queries:(_ (Request / Variable) _)+ {
    	return queries.map(q => q[1])
    }

Variable
	= name:Name _ "=" _ value:JSON {
    	return {
        	name,
            value,
        }
    }

Request
	= name:Name _ ":" _ func:FunctionName "(" args:JSONObject ")" _ params:RequestParams? {
    	return {
        	name,
            func,
            params,
            args: JSON.parse(args),
        }
    }

RequestParams
	= "{" _ params:(Name (__ RequestParams)? _)+ "}" {
    	return params.reduce(
        	(p, [name, subParams]) => {
            	p[name] = subParams && subParams[1]
                return p
            },
        	{}
        )
	}

JSON
	= JSONObject
    / JSONArray
    / JSONString
    / JSONNumber
    / JSONNull
    / JSONBool
JSONObject
	= $("{" _ (JSONObjectEntry _ ("," _ JSONObjectEntry _)*)? "}")
JSONObjectEntry = JSONString _ ":" _ JSON
JSONArray
	= $("[" _ (JSON _ ("," _ JSON _)*)? "]")
JSONString
	= $('"' ([^"])* '"')
JSONNumber
	= $([0-9]+ ("." [0-9]+)? (("e" / "E") [0-9]+)?)
JSONNull = "null"
JSONBool = "true" / "false"

Name
	= $([a-zA-Z] [a-zA-Z0-9\-_]*)
FunctionName
	= $(Name ("." Name)*)

_ "whitespace"
	= [ \t\n\r]*
__ "require whitespace"
	= [ \t\n\r]+
