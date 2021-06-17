import IParser, {Accept, ParseResult, Reject} from "./IParser";
import {Reference} from "./ReferenceParser";
import {ServerEnum} from "../enum/ServerEnum";

class NPAtlasParser implements IParser {

    parse(text: string): ParseResult {
        if (text.match('^NPA[0-9]{6}')) {
            return new Accept(new Reference(ServerEnum.NP_ATLAS, text.substring(0, 9)), text.substring(9));
        }
        return this.reject();
    }

    reject(): Reject {
        return new Reject('Not match NPA<number>');
    }

}

export default NPAtlasParser;
