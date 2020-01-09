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
	= name:Name _ ":" _ func:Name "(" args:JSONObject ")" _ params:RequestParams? {
    	return {
        	name,
            func,
            params,
            args: JSON.parse(args),
        }
    }

RequestParams
	= "{" _ params:(Name __ RequestParams? _)+ "}" {
    	return params.map(
        	param => {
            	if (param[2] === null) {
                	return param[0]
                }
                return [param[0], param[2]]
            }
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

_ "whitespace"
	= [ \t\n\r]*
__ "require whitespace"
	= [ \t\n\r]+
