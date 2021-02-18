import IParser, {Accept, ParseResult, Reject} from "./IParser";

class NatParser implements IParser {

    parse(text: string): ParseResult {
        let match = text.match('^[1-9][0-9]*');
        if (match && match.length > 0) {
            return new Accept(match[0], text.substring(match[0].length));
        }
        return this.reject();
    }

    reject(): Reject {
        return new Reject('Not match positive number');
    }

}

export default NatParser;
