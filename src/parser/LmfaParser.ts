import IParser, {Accept, ParseResult, Reject} from "./IParser";
import {Reference} from "./ReferenceParser";
import {ServerEnum} from "../enum/ServerEnum";

class LmfaParser implements IParser {

    parse(text: string): ParseResult {
        if (text.match('^LMFA[0-9]{8}')) {
            return new Accept(new Reference(ServerEnum.LIPID_MAPS, text.substring(5, 8)), text.substring(12));
        }
        return this.reject();
    }

    reject(): Reject {
        return new Reject('Not match LMFA<number>');
    }

}

export default LmfaParser;
