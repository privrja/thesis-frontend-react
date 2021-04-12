import IParser, {Accept, ParseResult, Reject} from "./IParser";

class AtomParser implements IParser {

    parse(text: string): ParseResult {
        if (text.match('^[A-Z][a-z]')) {
            return new Accept(text.substring(0, 2), text.substring(2));
        }
        if (text.match('^[A-Z]')) {
            return new Accept(text.substring(0,1), text.substring(1));
        }
        return this.reject();
    }

    reject(): Reject {
        return new Reject('Not Atom');
    }


}

export default AtomParser ;
