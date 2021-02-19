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
        this.okStack.push({
            sequenceType: parts[0],
            sequenceName: parts[1],
            formula: parts[2],
            mass: Number(parts[3]),
            sequence: parts[4],
            nModification: parts[5] === '' ? null : parts[5],
            cModification: parts[6] === '' ? null : parts[5],
            bModification: parts[7] === '' ? null : parts[5],
            source: ref?.source ?? null,
            identifier: ref?.identifier ?? null
        });
    }

    protected async finder(): Promise<boolean> {
        return true;
    }

}

export default SequenceImport;
