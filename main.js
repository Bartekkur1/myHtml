let keywords = [
    "CREATETABLE",
    "SELECT"
]
let specials = [
    "FROM",
    "WHERE",
    "*"
]
let types = [
    "int", "var"
]

// let test = "SELECT * FROM `kek` WHERE 1";
let test = "CREATE TABLE kek { id int name var(255) }";

class Lexer {
    constructor(input) {
        this.word = "";
        this.char = -1;
        this.input = input.replace(/ /g, "").split("");
        this.analysed = [];
    }

    Run() {
        let i = 0;
        this.input.forEach(element => {
            this.word += element;
            this.char += 1;
            this.quote = false;
            console.log(this.word);
            if(keywords.includes(this.word)) {
                this.analysed.push({"token": "keyword", "value": this.word});
                this.word = "";
            }
            if(specials.includes(this.word)) {
                this.analysed.push({"token": "special", "value": this.word});
                this.word = "";
            }
            if(types.includes(this.word)) {
                this.analysed.push({"token": "type", "value": this.word});
                this.word = "";
            }
            if(element == "`") {
                this.quote = true;
                if(this.word.length > 1) {
                    this.analysed.push({"token": "variable", "value": this.word});
                    this.word = "";
                    this.quote = false;
                }
            }
            if(this.word.match(/(\(|\{|\[|\)|\}|\])/)) {
                this.analysed.push({"token": "parenthesis", "value": this.word});
                this.word = "";
            }
            if(this.input[this.char+1] && 
                this.input[this.char+1].match(/(\(|\{|\[})/)) {
                this.analysed.push({"token": "variable", "value": this.word});
                this.word = "";
            }
        })
        console.log("finished");
    }
}

let kek = new Lexer(test);
kek.Run();