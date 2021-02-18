import IParser, {Accept, ParseResult, Reject} from "./IParser";
import StringParser from "./StringParser";
import SmilesParser from "./SmilesParser";
import {Reference} from "./ReferenceParser";

class SmilesReferenceParser implements IParser {

    parse(text: string): ParseResult {
        let textParser = new StringParser('SMILES: ');
        let textResult = textParser.parse(text);
        if (!textResult.isAccepted()) {
            return this.reject();
        }
        let smilesParser = new SmilesParser();
        let smilesResult = smilesParser.parse(textResult.getReminder());
        if (smilesResult.isAccepted()) {
            return new Accept(new Reference(null, null, smilesResult.getResult()), smilesResult.getReminder());
        }
        return this.reject();
    }

    reject(): Reject {
        return new Reject('not match SMILES: <smiles>');
    }

}

export default SmilesReferenceParser;
