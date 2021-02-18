import IParser, {ParseResult, Reject} from "./IParser";
import {ServerEnum} from "../enum/ServerEnum";
import ServerNumReferenceParser from "./ServerNumReferenceParser";
import PdbReferenceParser from "./PdbReferenceParser";
import SmilesReferenceParser from "./SmilesReferenceParser";
import NorineReferenceParser from "./NorineReferenceParser";

export class Reference {
    source: ServerEnum | null = ServerEnum.PUBCHEM;
    identifier: number | null = null;

    constructor(source: ServerEnum | null, identifier: number | null) {
        this.source = source;
        this.identifier = identifier;
    }
}

class ReferenceParser implements IParser {

    parse(text: string): ParseResult {
        let serverNumParser = new ServerNumReferenceParser();
        let serverNumResult = serverNumParser.parse(text);
        if (serverNumResult.isAccepted()) {
            return serverNumResult;
        }
        let pdbParser = new PdbReferenceParser();
        let pdbResult = pdbParser.parse(text);
        if (pdbResult.isAccepted()) {
            return pdbResult;
        }

        let smilesParser = new SmilesReferenceParser();
        let smilesResult = smilesParser.parse(text);
        if (smilesResult.isAccepted()) {
            return smilesResult;
        }

        let norineParser = new NorineReferenceParser();
        let norineResult = norineParser.parse(text);
        if (norineResult.isAccepted()) {
            return norineResult;
        }
        return this.reject();
    }

    reject(): Reject {
        return new Reject('Not match Reference');
    }

}

export default ReferenceParser;
