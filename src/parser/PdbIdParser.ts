import IParser, {Accept, ParseResult, Reject} from "./IParser";

class PdbIdParser implements IParser {

    parse(text: string): ParseResult {
        if (text.match('^[A-Z0-9]{4}')) {
            return new Accept(text.substring(0, 4), text.substring(4));
        }
        if (text.match('^[A-Z0-9]{3}')) {
            return new Accept(text.substring(0, 3), text.substring(3));
        }
        return this.reject();
    }

    reject(): Reject {
        return new Reject('Not match PDB ID');
    }

}

export default PdbIdParser;
