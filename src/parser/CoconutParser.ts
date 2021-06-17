import IParser, {Accept, ParseResult, Reject} from "./IParser";
import {Reference} from "./ReferenceParser";
import {ServerEnum} from "../enum/ServerEnum";

class CoconutParser implements IParser {

    parse(text: string): ParseResult {
        if (text.match('^CNP[0-9]{7}')) {
            return new Accept(new Reference(ServerEnum.COCONUT, text.substring(0, 10)), text.substring(10));
        }
        return this.reject();
    }

    reject(): Reject {
        return new Reject('Not match CNP<number>');
    }

}

export default CoconutParser;
