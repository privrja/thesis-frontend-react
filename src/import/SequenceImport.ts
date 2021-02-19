import AbstractImport from "./AbstractImport";
import NorineFinder from "../finder/NorineFinder";
import {ServerEnum} from "../enum/ServerEnum";
import PubChemFinder from "../finder/PubChemFinder";
import IFinder from "../finder/IFinder";

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
            smiles: ref?.smiles ?? null,
            source: ref?.source ?? null,
            identifier: ref?.identifier ?? null
        });
    }

    protected async finder(): Promise<boolean> {
        let pubChemIds: string[] = [];
        let norineIds: string[] = [];
        this.okStack.forEach((item: any) => {
            console.log(item, item.smiles, item.source, item.identifier);
            if (item.smiles === null && item.identifier) {
                console.log('find');
                if (item.source === ServerEnum.PUBCHEM) {
                    console.log('pubchem');
                    pubChemIds.push(item.identifier);
                } else if (item.source === ServerEnum.NORINE) {
                    norineIds.push(item.identifier);
                }
            }
        });
        let finder: IFinder = new PubChemFinder();
        console.log(pubChemIds);
        await finder.findByIdentifiers(pubChemIds).then(blocks => {
            blocks.forEach(block => {
                this.find(block.identifier).smiles = block.smiles;
            });
            return true;
        });
        finder = new NorineFinder();
        return finder.findByIdentifiers(norineIds).then(blocks => {
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

export default SequenceImport;
