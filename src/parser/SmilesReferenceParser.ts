import IParser, {Accept, ParseResult, Reject} from "./IParser";
import StringParser from "./StringParser";
import SmilesParser from "./SmilesParser";
import {Reference} from "./ReferenceParser";
import ServerNumReferenceParser from "./ServerNumReferenceParser";
import PdbReferenceParser from "./PdbReferenceParser";
import NorineReferenceParser from "./NorineReferenceParser";

class SmilesReferenceParser implements IParser {

    parse(text: string): ParseResult {
        let smilesParser = new SmilesParser();
        let smilesResult = smilesParser.parse(text);
        if (smilesResult.isAccepted()) {
            let textParser = new StringParser(' in ');
            let textResult = textParser.parse(smilesResult.getReminder());
            if (!textResult.isAccepted()) {
                return this.reject();
            }
            let serverNumParser = new ServerNumReferenceParser();
            let serverNumResult = serverNumParser.parse(textResult.getReminder());
            if (serverNumResult.isAccepted()) {
                return new Accept(new Reference(serverNumResult.getResult().source, serverNumResult.getResult().identifier, smilesResult.getResult()), serverNumResult.getReminder());
            }
            let pdbParser = new PdbReferenceParser();
            let pdbResult = pdbParser.parse(textResult.getReminder());
            if (pdbResult.isAccepted()) {
                return new Accept(new Reference(pdbResult.getResult().source, pdbResult.getResult().identifier, smilesResult.getResult()), pdbResult.getReminder());
            }
            let norineParser = new NorineReferenceParser();
            let norineResult = norineParser.parse(textResult.getReminder());
            if (norineResult.isAccepted()) {
                return new Accept(new Reference(norineResult.getResult().source, norineResult.getResult().identifier, smilesResult.getResult()), norineResult.getReminder());
            }
        }
        return this.reject();
    }

    reject(): Reject {
        return new Reject('not match SMILES: <smiles>');
    }

}

export default SmilesReferenceParser;
