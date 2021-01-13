import {SelectOption} from "../component/SelectInput";

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

}
