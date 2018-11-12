let keywords = [
    "CREATETABLE",
    "SELECT"
]
let specials = [
    "FROM",
    "WHERE",
    "*",
    "UNSIGNED",
    "unsigned",
    "AUTO_INCREMENT",
    "auto_increment",
    "PRIMARYKEY",
    "primarykey",
    "NOTNULL",
    "notnull",
    "DEFAULT",
    "default"
]
let types = [
    "smallint", "char", "CHAR",
    "DOUBLE", "double",
    "INT", "VARCHAR", "TIMESTAMP",
    "int", "varchar", "timestamp",
]

// let test = "SELECT * FROM `kek` WHERE 1";
// let test = "CREATE TABLE kek { id int name var(255) }";
// let test = "CREATE TABLE MyGuests (\
//     id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,\
//     firstname VARCHAR(30) NOT NULL,\
//     lastname VARCHAR(30) NOT NULL,\
//     email VARCHAR(50),\
//     reg_date TIMESTAMP\
//     )";
// let test = "CREATE TABLE example ( id smallint unsigned not null auto_increment, name varchar(20) not null, constraint pk_example primary key (id) );"
// let test = "DELETE * FROM `users` WHERE `name` = 'kekus'"

class Lexer {
    constructor(input) {
        this.word = "";
        this.char = -1;
        this.input = input.replace(/ /g, "").split("");
        this.analysed = [];
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
            console.log(this.word);
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
        console.log("finished");
        console.log(this.analysed);
    }
}

let kek = new Lexer(test);
kek.Run();