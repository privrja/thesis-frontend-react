import AbstractImport from "./AbstractImport";

class SequenceImport extends AbstractImport {

    getType(): string {
        return '/sequence'
    }

    getLineLength(): number {
        return 9;
    }

    transformation(parts: string[]) {
        let ref = this.getReference(parts[8]);
        if (ref) {
            this.okStack.push({
                sequenceType: parts[0],
                sequenceName: parts[1],
                formula: parts[2],
                mass: Number(parts[3]),
                sequence: parts[4],
                nModification: parts[5],
                cModification: parts[6],
                bModification: parts[7],
                source: ref.source,
                identifier: ref.identifier
            });
        } else {
            this.errorStack.push(parts.join('\t'))
        }
    }

    protected async finder(): Promise<boolean> {
        return true;
    }

}

export default SequenceImport;
