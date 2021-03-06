import AbstractImport from "./AbstractImport";

class ModificationImport extends AbstractImport {

    getType(): string {
        return '/modification'
    }

    getLineLength(): number {
        return 5;
    }

    transformation(parts: string[]) {
        this.okStack.push({
            modificationName: parts[0].replaceAll('.', ','),
            formula: parts[1],
            mass: Number(parts[2]),
            nTerminal: parts[3] === '1',
            cTerminal: parts[4] === '1'
        });
    }

}

export default ModificationImport;
