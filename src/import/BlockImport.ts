import AbstractImport from "./AbstractImport";
import ReferenceParser, {Reference} from "../parser/ReferenceParser";

class BlockImport extends AbstractImport {

    getType(): string {
        return '/block'
    }

    getLineLength(): number {
        return 6;
    }

    transformation(parts: any[]) {
        let refParser = new ReferenceParser();
        let refResult = refParser.parse(parts[5]);
        if (!refResult.isAccepted()) {
            this.errorStack.push(parts.join('\t'));
            return;
        }
        let ref = refResult.getResult() as Reference;
        this.okStack.push({
            blockName: parts[0],
            acronym: parts[1],
            residue: parts[2],
            blockMass: Number(parts[3]),
            losses: parts[4],
            source: ref.source,
            identifier: ref.identifier
        });
    }

}

export default BlockImport;
