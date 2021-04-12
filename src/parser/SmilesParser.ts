import IParser, {Accept, ParseResult, Reject} from "./IParser";

class SmilesParser implements IParser {

    parse(text: string): ParseResult {
        let match = text.match('^\\S+');
        if (match && match.length > 0) {
            return new Accept(match[0], text.substring(match[0].length));
        }
        return this.reject();
    }

    reject(): Reject {
        return new Reject('Not match SMILES');
    }

}

export default SmilesParser;
