import IParser, {Accept, ParseResult, Reject} from "./IParser";
import {ServerEnum} from "../enum/ServerEnum";

class ServerNumParser implements  IParser {

    parse(text: string): ParseResult {
        if (text.match('^CSID: ')) {
            return new Accept(ServerEnum.CHEMSPIDER, text.substring(6));
        }
        if (text.match('^CID: ')) {
            return new Accept(ServerEnum.PUBCHEM, text.substring(5));
        }
        if (text.match('^CHEBI: ')) {
            return new Accept(ServerEnum.CHEBI, text.substring(7));
        }
        if (text.match("^SB: ")) {
            return new Accept(ServerEnum.SIDEROPHORE_BASE, text.substring(4))
        }
        return this.reject();
    }

    reject(): Reject {
        return new Reject('Not match CSID: | CID: | SB: ');
    }

}

export default ServerNumParser;
