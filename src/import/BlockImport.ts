import AbstractImport from "./AbstractImport";
import {ServerEnum} from "../enum/ServerEnum";
import PubChemFinder from "../finder/PubChemFinder";

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
                formula: parts[2],
                mass: Number(parts[3]),
                losses: parts[4] === '' ? null : parts[4],
                smiles: ref.smiles,
                source: ref.source,
                identifier: ref.identifier
            });
        } else {
            this.errorStack.push(parts.join('\t'))
        }
    }

    protected async finder(): Promise<boolean> {
        let identifiers: string[] = [];
        this.okStack.forEach((item: any) => {
            if (item.smiles === null && item.source === ServerEnum.PUBCHEM && item.identifier) {
                identifiers.push(item.identifier);
            }
        });
        let finder = new PubChemFinder();
        return finder.findByIdentifiers(identifiers).then(blocks => {
            blocks.forEach(block => {
                this.find(block.identifier).smiles = block.smiles;
            });
            return true;
        });
    }

    find(key: string) {
        return this.okStack.find(e => e.identifier === key);
    }

}

export default BlockImport;
