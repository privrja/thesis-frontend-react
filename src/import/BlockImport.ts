import AbstractImport from "./AbstractImport";
import {ServerEnum} from "../enum/ServerEnum";

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
                blockName: parts[0].replaceAll('.', ','),
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
        let norineIds: string[] = [];
        let chebiIds: string[] = [];
        let chemspiderIds: string[] = [];
        this.okStack.forEach((item: any) => {
            if (item.smiles === null && item.source === ServerEnum.PUBCHEM && item.identifier) {
                identifiers.push(item.identifier);
            } else if (item.smiles === null && item.source === ServerEnum.CHEMSPIDER && item.identifier) {
                chemspiderIds.push(item.identifier);
            } else if (item.smiles === null && item.source === ServerEnum.CHEBI && item.identifier) {
                chebiIds.push(item.identifier);
            } else if (item.smiles === null && item.source === ServerEnum.NORINE && item.identifier) {
                norineIds.push(item.identifier);
            }
        });
        await this.finders(identifiers, chebiIds, chemspiderIds, norineIds);
        return true;
    }

}

export default BlockImport;
