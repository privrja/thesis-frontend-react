import IParser, {Accept, ParseResult, Reject} from "./IParser";

class ZeroParser implements IParser {

    parse(text: string): ParseResult {
        if (text.match('^0')) {
            return new Accept(0, text.substring(1));
        }
        return this.reject();
    }

    reject(): Reject {
        return new Reject('Not mach Zero');
    }

}

export default ZeroParser;
