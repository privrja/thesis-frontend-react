import {SelectOption} from "../component/SelectInput";
import PubChemFinder from "../finder/PubChemFinder";
import IFinder from "../finder/IFinder";

export enum ServerEnum {
    PUBCHEM, CHEMSPIDER, NORINE, PDB, CHEBI
}

export class ServerEnumHelper {

    static getOptions(): SelectOption[] {
        return [
            new SelectOption(ServerEnum.PUBCHEM.toString(), this.getName(ServerEnum.PUBCHEM)),
            new SelectOption(ServerEnum.CHEMSPIDER.toString(), this.getName(ServerEnum.CHEMSPIDER)),
            new SelectOption(ServerEnum.NORINE.toString(), this.getName(ServerEnum.NORINE)),
            new SelectOption(ServerEnum.PDB.toString(), this.getName(ServerEnum.PDB)),
            new SelectOption(ServerEnum.CHEBI.toString(), this.getName(ServerEnum.CHEBI))
        ];
    }

    static getFinder(value: ServerEnum): IFinder {
        switch (value) {
            case ServerEnum.PUBCHEM:
                return new PubChemFinder();
            case ServerEnum.CHEMSPIDER:
                break;
            case ServerEnum.NORINE:
                break;
            case ServerEnum.PDB:
                break;
            case ServerEnum.CHEBI:
                break;
        }
        return new PubChemFinder();
    }

    static getName(value: ServerEnum) {
        switch (value) {
            default:
            case ServerEnum.PUBCHEM:
                return 'PubChem';
            case ServerEnum.CHEMSPIDER:
                return 'ChemSpider';
            case ServerEnum.NORINE:
                return 'Norine';
            case ServerEnum.PDB:
                return 'PDB';
            case ServerEnum.CHEBI:
                return 'ChEBI';
        }
    }

    static getLink(database: ServerEnum, identifier: string) {
        switch (database) {
            case ServerEnum.PUBCHEM:
                return 'https://pubchem.ncbi.nlm.nih.gov/compound/' + identifier;
            case ServerEnum.CHEMSPIDER:
                break;
            case ServerEnum.NORINE:
                break;
            case ServerEnum.PDB:
                break;
            case ServerEnum.CHEBI:
                break;
            default:
                return '';
        }
    }
}
