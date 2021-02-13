import {SelectOption} from "../component/SelectInput";
import IFinder from "../finder/IFinder";
import PubChemFinder from "../finder/PubChemFinder";
import NorineFinder from "../finder/NorineFinder";
import PdbFinder from "../finder/PdbFinder";

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
                return new NorineFinder();
            case ServerEnum.PDB:
                return new PdbFinder();
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
            default:
            case ServerEnum.PUBCHEM:
                return 'https://pubchem.ncbi.nlm.nih.gov/compound/' + identifier;
            case ServerEnum.CHEMSPIDER:
                return "https://www.chemspider.com/Chemical-Structure." + identifier + ".html";
            case ServerEnum.NORINE:
                return "https://bioinfo.cristal.univ-lille.fr/norine/result.jsp?ID=" + identifier;
            case ServerEnum.PDB:
                return "https://www.rcsb.org/ligand/" + identifier;
            case ServerEnum.CHEBI:
                return "https://www.ebi.ac.uk/chebi/searchId.do?chebiId=" + identifier;
        }
    }

    static getFullId(database: ServerEnum, identifier: string) {
        switch(database) {
            default:
            case ServerEnum.PUBCHEM:
                return 'CID: ' + identifier;
            case ServerEnum.CHEMSPIDER:
                return 'CSID: ' + identifier;
            case ServerEnum.NORINE:
                return identifier;
            case ServerEnum.PDB:
                return 'PDB: ' + identifier;
            case ServerEnum.CHEBI:
                return 'ChEBI: '
        }
    }

}
