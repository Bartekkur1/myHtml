let keywords = [
    "CREATE",
    "TABLE",
    "SELECT",
    "FROM",
    "WHERE",
    "*"
]
let specials = [
    "UNSIGNED",
    "unsigned",
    "AUTO_INCREMENT",
    "auto_increment",
    "PRIMARYKEY",
    "primarykey",
    "NOTNULL",
    "notnull",
    "DEFAULT",
    "default",
    "and",
    "AND"
]
let types = [
    "INT", "VARCHAR", "TIMESTAMP",
    "smallint", "char", "CHAR",
    "DOUBLE", "double",
    "int", "varchar", "timestamp",
]

let tables = [];

class Row {
    constructor(object) {
        this.name = object.name;
        this.type = object.type;
        this.size = object.size;
        this.specials = object.specials;
        this.values = [];
    }

    addValue(value) {
        this.values.push(value);
    }
}

class Table {
    constructor(name) {
        this.name = name;
        this.rows = [];
    }

    addRow(row) {
        this.rows.push(row);
    }
}

class Select{
    constructor(object) {
        this.what = object.what;
        this.from = object.from;
        this.where = object.where;
    }
}

class Lexer {
    constructor() {
        this.word = "";
        this.char = -1;
        this.analysed = [];
    }

    Input(input) {
        this.analysed = [];
        this.input = input.replace(/ /g, "").split("");
    }

    NewToken(token, value = null) {
        if(!value) {
            this.analysed.push({"token": token, "value": this.word});
            this.word = "";
        } else {
            this.analysed.push({"token": token, "value": value});
            this.word = "";
        }
    }

    Run() {
        let i = 0;
        this.input.forEach(element => {
            this.word += element;
            this.char += 1;
            this.quote = false;
            this.string = false;
            if(keywords.includes(this.word)) {
                this.NewToken("keyword");
            }
            if(specials.includes(this.word)) {
                this.NewToken("special")
            }
            types.forEach(type => {
                if(this.word.match(type)) {
                    this.NewToken("name", this.word.split(type)[0]);
                    this.NewToken("type", type);
                }
            })
            specials.forEach(special => {
                if(this.word.includes(special)) {
                    this.NewToken("name", this.word.split(special)[0]);
                    this.NewToken("special", special);
                }
            })
            if(this.word.match(/[0-9]/) && !this.quote && !this.string) {
                if(this.input[this.char + 1]) {
                    if(!this.input[this.char + 1].match(/[0-9]/)) {
                        this.NewToken("number");
                    }
                } else {
                    this.NewToken("number");
                }
            }
            if(element == "'") {
                this.string = true;
                if(this.word.length > 1) {
                    this.NewToken("string");
                    this.string = false;
                }
            }
            if(element == "`") {
                this.quote = true;
                if(this.word.length > 1) {
                    this.NewToken("variable");
                    this.quote = false;
                }
            }
            if(this.word.match(/(\,|\=|\<|\>)/)) {
                this.NewToken("special char");
            }
            if(this.word.match(/(\(|\{|\[|\)|\}|\|])/)) {
                this.NewToken("parenthesis");
            }
            if(this.input[this.char+1] && 
                this.input[this.char+1].match(/(\(|\{|\[})/) &&
                this.word.length > 0) {
                this.NewToken("variable");
            }
        })
    }
}

class Parser {
    constructor(analysedInput) {
        this.token = 0;
        this.Table;
        this.Select;
    }

    Input(input) {
        this.token = 0;
        this.input = input;
    }

    NextToken(amount) {
        if(amount)
            this.token += amount;
        else 
            this.token++;
        if(this.token < this.input.length)
            return true;
        else
            return false;
    }

    GetToken(position) {
        if(position != null) {
            if(position <= this.input.length && this.input[position]) {
                return this.input[position];
            } else {
                return null;
            }
        } else {
            return this.input[this.token];
        }
    }

    RequireToken(token, value) {
        if(value) {
            if(this.GetToken().value == value &&
            this.GetToken().token == token) {
                return true;
            } else
                return false;
        } else {
            if(this.GetToken().token == token) {
                return true;
            }
            else
                return false;
        }
    }

    TryCreateTable() {
        if(this.RequireToken("keyword", "CREATE")) {
            this.NextToken();
            if(this.RequireToken("keyword", "TABLE")) {
                this.NextToken();
                if(this.RequireToken("variable")) {
                    this.Table = new Table(this.GetToken().value);
                    this.NextToken();
                }
                if(this.RequireToken("parenthesis", "(")) {
                    let newRow = {};
                    newRow.specials = [];
                    while(this.NextToken()) {
                        if(this.RequireToken("name")) {
                            newRow["name"] = this.GetToken().value;
                        }
                        if(this.RequireToken("type")) {
                            newRow["type"] = this.GetToken().value;
                        }
                        if(this.RequireToken("special")) {
                            newRow["specials"].push(this.GetToken().value);
                        }
                        if(this.RequireToken("number")) {
                            newRow["size"] = this.GetToken().value;
                        }
                        if(this.RequireToken("special char", ",")) {
                            let row = new Row(newRow);
                            this.Table.addRow(row);
                            newRow = {};
                            newRow.specials = [];
                        }
                        if(!this.GetToken(this.token + 1)) {
                            console.log("pushing table");
                            tables.push(this.Table);
                            return true;
                        }
                    }
                }
            }
        }
    }

    TrySelect() {
        if(this.RequireToken("keyword", "SELECT")) {
            this.NextToken();
            let selectObject = {};
            selectObject.what = [];
            selectObject.where = [];
            if(this.RequireToken("keyword", "*")) {
                selectObject["what"].push("*");
            } else if(this.RequireToken("variable")) {
                selectObject["what"].push(this.GetToken().value);
                while(this.GetToken(this.token + 1).token == "special char") {
                    this.NextToken(2);
                    selectObject["what"].push(this.GetToken().value);
                }
                this.NextToken();
            }
            if(this.RequireToken("keyword", "FROM")) {
                this.NextToken();
                if(this.RequireToken("variable")) {
                    selectObject["from"] = this.GetToken().value;
                }
                this.NextToken();
            }
            if(this.RequireToken("keyword", "WHERE")) {
                while(this.NextToken()) {
                    let where = {};
                    if(this.GetToken().token == "variable") {
                        where["variable"] = this.GetToken().value;
                        this.NextToken();
                        if(this.RequireToken("special char")) {
                            where["special char"] = this.GetToken().value;
                            this.NextToken();
                            if(this.RequireToken("string") || this.RequireToken("number")) {
                                where[this.GetToken().token] = this.GetToken().value;
                            }                    
                        }
                        selectObject["where"].push(where);
                    }
                }
            }
            console.log(selectObject);
            tables.forEach(table => {
                if("`" + table.name + "`" == selectObject["from"]) {
                    table.rows.forEach(row => {
                        console.log(row.values);
                    })
                } else {
                    console.log("table not found");                    
                }
            })
            return true;
        }
    }

    TryInsert() {

    }

    Run() {
        this.TryCreateTable();
        this.TrySelect();
    }
}


// let 
let test = "CREATE TABLE kek ( id int, name varchar(255))";

let lexer = new Lexer();
let parser = new Parser();

lexer.Input(test);
lexer.Run();
parser.Input(lexer.analysed);
parser.Run();

console.log(lexer.analysed);

test = "SELECT `id`, `name` FROM `kek` WHERE `name` = 'maximus'";

lexer.Input(test);
lexer.Run();
parser.Input(lexer.analysed);
parser.Run();

console.log(lexer.analysed);