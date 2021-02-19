import IParser, {Accept, ParseResult, Reject} from "./IParser";
import {Reference} from "./ReferenceParser";
import {ServerEnum} from "../enum/ServerEnum";

class NorineReferenceParser implements IParser {

    parse(text: string): ParseResult {
        let match = text.match('^NOR[0-9]{5}');
        if (match && match.length > 0) {
            if (match[0] === 'NOR00000') {
                return this.reject();
            }
            return new Accept(new Reference(ServerEnum.NORINE, match[0]), text.substring(8));
        }
        return this.reject();
    }

    reject(): Reject {
        return new Reject('Not match Norine reference');
    }

}

export default NorineReferenceParser;
