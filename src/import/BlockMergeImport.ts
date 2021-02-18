import AbstractImport from "./AbstractImport";
import ReferenceParser, {Reference} from "../parser/ReferenceParser";

const SEPARATOR_SLASH = '/';

class BlockMergeImport extends AbstractImport {

    getType(): string {
        return '/block'
    }

    getLineLength(): number {
        return 6;
    }

    transformation(parts: string[]) {
        let blockNames = parts[0].split(SEPARATOR_SLASH);
        let acronyms = parts[1].split(SEPARATOR_SLASH);
        let losses = parts[4].split(SEPARATOR_SLASH);
        let refs = parts[5].split(SEPARATOR_SLASH);
        if (blockNames.length === acronyms.length && (blockNames.length === losses.length || losses.length === 0) && blockNames.length === refs.length) {
            for (let i = 0; i < blockNames.length; ++i) {
                let refParser = new ReferenceParser();
                let refResult = refParser.parse(parts[5]);
                if (!refResult.isAccepted()) {
                    this.errorStack.push(parts.join('\t'));
                    return;
                }
                let ref = refResult.getResult() as Reference;
                this.okStack.push({
                    blockName: blockNames[i],
                    acronym: acronyms[i],
                    residue: parts[2],
                    blockMass: Number(parts[3]),
                    losses: losses.length > 0 ? losses[i] : '',
                    source: ref.source,
                    identifier: ref.identifier
                });
            }
        }
    }

}

export default BlockMergeImport;
