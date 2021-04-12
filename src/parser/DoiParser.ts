import IParser, {Accept, ParseResult, Reject} from "./IParser";
import {ServerEnum} from "../enum/ServerEnum";
import {Reference} from "./ReferenceParser";

class DoiParser implements IParser {

    parse(text: string): ParseResult {
        if (text.match('^DOI: ')) {
            let doi = text.substring(5).split(' ');
            if (doi.length > 0) {
                return new Accept(new Reference(ServerEnum.DOI, doi[0]), text.substring(5 + doi[0].length));
            }
        }
        return this.reject();
    }

    reject(): Reject {
        return new Reject('Not match DOI: <string>');
    }

}

export default DoiParser;
