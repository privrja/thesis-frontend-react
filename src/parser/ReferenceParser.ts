import IParser, {ParseResult, Reject} from "./IParser";
import {ServerEnum} from "../enum/ServerEnum";
import ServerNumReferenceParser from "./ServerNumReferenceParser";
import PdbReferenceParser from "./PdbReferenceParser";
import SmilesReferenceParser from "./SmilesReferenceParser";
import NorineReferenceParser from "./NorineReferenceParser";
import DoiParser from "./DoiParser";
import LmfaParser from "./LmfaParser";
import CoconutParser from "./CoconutParser";

export class Reference {
    source: ServerEnum | null = null;
    identifier: string | null = null;
    smiles: string | null = null;

    constructor(source: ServerEnum | null, identifier: string | null, smiles: string | null = null) {
        this.source = source;
        this.identifier = identifier;
        this.smiles = smiles;
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

        let doiParser = new DoiParser();
        let doiResult = doiParser.parse(text);
        if (doiResult.isAccepted()) {
            return doiResult;
        }

        let lmfaParser = new LmfaParser();
        let lfmaResult = lmfaParser.parse(text);
        if (lfmaResult.isAccepted()) {
            return lfmaResult;
        }

        let coconutParser = new CoconutParser();
        let coconutResult = coconutParser.parse(text);
        if (coconutResult.isAccepted()) {
            return coconutResult;
        }

        return this.reject();
    }

    reject(): Reject {
        return new Reject('Not match Reference');
    }

}

export default ReferenceParser;
