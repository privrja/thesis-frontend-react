import IParser, {Accept, ParseResult, Reject} from "./IParser";
import PdbIdParser from "./PdbIdParser";
import StringParser from "./StringParser";

class PdbReferenceParser implements IParser {

    parse(text: string): ParseResult {
        let pdbParser = new StringParser('PDB: ');
        let pdbResult = pdbParser.parse(text);
        if (!pdbResult.isAccepted()) {
            return this.reject();
        }
        let pdbIdParser = new PdbIdParser();
        let idResult = pdbIdParser.parse(pdbResult.getReminder());
        if (!idResult.isAccepted()) {
            return this.reject();
        }
        return new Accept(pdbResult.getResult(), idResult.getResult());
    }

    reject(): Reject {
        return new Reject('PDB reference not match');
    }

}

export default PdbReferenceParser;
