import IParser, {Accept, ParseResult, Reject} from "./IParser";
import {ServerEnum} from "../enum/ServerEnum";

class ServerNumParser implements  IParser {

    parse(text: string): ParseResult {
        if (text.match('^CSID: ')) {
            return new Accept(ServerEnum.PUBCHEM, text.substring(6));
        }
        if (text.match('^CID: ')) {
            return new Accept(ServerEnum.CHEMSPIDER, text.substring(5));
        }
        return this.reject();
    }

    reject(): Reject {
        return new Reject('Not match CSID: | CID: ');
    }

}

export default ServerNumParser;
