import AbstractImport from "./AbstractImport";

class BlockImport extends AbstractImport {

    getType(): string {
        return '/block'
    }

    getLineLength(): number {
        return 6;
    }

    transformation(parts: string[]) {
        let ref = this.getReference(parts[5]);
        if (ref) {
            this.okStack.push({
                blockName: parts[0],
                acronym: parts[1],
                residue: parts[2],
                blockMass: Number(parts[3]),
                losses: parts[4],
                source: ref.source,
                identifier: ref.identifier
            });
        } else {
            this.errorStack.push(parts.join('\t'))
        }
    }

}

export default BlockImport;
