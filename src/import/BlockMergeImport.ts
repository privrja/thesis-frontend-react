import AbstractImport from "./AbstractImport";

const SEPARATOR_SLASH = '/';

class BlockMergeImport extends AbstractImport {

    getType(): string {
        return '/block/merge'
    }

    getLineLength(): number {
        return 6;
    }

    transformation(parts: string[]) {
        let blockNames = parts[0].split(SEPARATOR_SLASH);
        let acronyms = parts[1].split(SEPARATOR_SLASH);
        let losses = parts[4].split(SEPARATOR_SLASH);
        let refs = parts[5].split(SEPARATOR_SLASH);
        if (blockNames.length === acronyms.length && (blockNames.length === losses.length || losses[0] === '') && blockNames.length === refs.length) {
            for (let i = 0; i < blockNames.length; ++i) {
                let ref = this.getReference(refs[i]);
                if (ref) {
                    this.okStack.push({
                        blockName: blockNames[i],
                        acronym: acronyms[i],
                        residue: parts[2],
                        blockMass: Number(parts[3]),
                        losses: losses.length > 0 ? losses[i] : '',
                        source: ref.source,
                        identifier: ref.identifier
                    });
                } else {
                    this.errorStack.push(blockNames[i] + '\t' + acronyms[i] + '\t' + parts[2] + '\t' + parts[3] + '\t' + (losses[0] === '' ? '' : losses[5]) + refs[i]);
                }
            }
        } else {
            this.errorStack.push(parts.join('\t'));
        }
    }

}

export default BlockMergeImport;
