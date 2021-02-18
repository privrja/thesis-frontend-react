import AbstractImport from "./AbstractImport";

class ModificationImport extends AbstractImport {

    getType(): string {
        return '/modification'
    }

    getLineLength(): number {
        return 5;
    }

    transformation(parts: any) {
        this.okStack.push({
            modificationName: parts[0],
            modificationFormula: parts[1],
            modificationMass: Number(parts[2]),
            nTerminal: parts[3] === '1',
            cTerminal: parts[4] === '1'
        });
    }

}

export default ModificationImport;
