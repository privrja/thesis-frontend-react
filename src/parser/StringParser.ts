import IParser, {Accept, ParseResult, Reject} from "./IParser";

class StringParser implements IParser {

    private readonly textToMatch: string;

    constructor(textToMatch: string) {
        this.textToMatch = textToMatch;
    }

    parse(text: string): ParseResult {
        if(text.match('/^' + this.textToMatch + '/')) {
            return new Accept(this.textToMatch, text.substring(this.textToMatch.length));
        }
        return this.reject();
    }

    reject(): Reject {
        return new Reject('Not match defined string');
    }

}

export default StringParser;
