import {SelectOption} from "../component/SelectInput";
import PubChemFinder from "../finder/PubChemFinder";
import IFinder from "../finder/IFinder";

export enum ServerEnum {
    PUBCHEM, CHEMSPIDER, NORINE, PDB, CHEBI
}

export class ServerEnumHelper {

    static getServerOptions(): SelectOption[] {
        return [
            new SelectOption(ServerEnum.PUBCHEM.toString(), 'PubChem'),
            new SelectOption(ServerEnum.CHEMSPIDER.toString(), 'ChemSpider'),
            new SelectOption(ServerEnum.NORINE.toString(), 'Norine'),
            new SelectOption(ServerEnum.PDB.toString(), 'PDB'),
            new SelectOption(ServerEnum.CHEBI.toString(), 'ChEBI')
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
}
