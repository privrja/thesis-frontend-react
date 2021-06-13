import AbstractImport from "./AbstractImport";
import {ServerEnum} from "../enum/ServerEnum";

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
            sequenceName: parts[1].replaceAll('.', ','),
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
        let chebiIds: string[] = [];
        let chemspiderIds: string[] = [];
        let coconutIds: string[] = [];
        let npatlasIds: string[] = [];
        this.okStack.forEach((item: any) => {
            if (item.smiles === null && item.identifier) {
                if (item.source === ServerEnum.PUBCHEM) {
                    pubChemIds.push(item.identifier);
                } else if (item.source === ServerEnum.NORINE) {
                    norineIds.push(item.identifier);
                } else if (item.source === ServerEnum.CHEBI) {
                    chebiIds.push(item.identifier);
                } else if (item.source === ServerEnum.CHEMSPIDER) {
                    chemspiderIds.push(item.identifier);
                } else if (item.source === ServerEnum.COCONUT) {
                    coconutIds.push(item.identifier);
                } else if (item.source === ServerEnum.NP_ATLAS) {
                    npatlasIds.push(item.identifier);
                }
            }
        });
        await this.finders(pubChemIds, chebiIds, chemspiderIds, norineIds, coconutIds, npatlasIds);
        return true;
    }

}

export default SequenceImport;
