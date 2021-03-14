import {SelectOption} from "../component/SelectInput";
import IFinder from "../finder/IFinder";
import PubChemFinder from "../finder/PubChemFinder";
import NorineFinder from "../finder/NorineFinder";
import PdbFinder from "../finder/PdbFinder";
import ChemSpiderFinder from "../finder/ChemSpiderFinder";
import MassSpecBlocksFinder from "../finder/MassSpecBlocksFinder";
import {SELECTED_CONTAINER, TOKEN} from "../constant/ApiConstants";
import ChebiFinder from "../finder/ChebiFinder";

export enum ServerEnum {
    PUBCHEM, CHEMSPIDER, NORINE, PDB, CHEBI, SMILES, MASS_SPEC_BLOCKS
}

export class ServerEnumHelper {

    static getOptions(containerName?: string): SelectOption[] {
        return [
            new SelectOption(ServerEnum.PUBCHEM.toString(), this.getName(ServerEnum.PUBCHEM)),
            new SelectOption(ServerEnum.CHEMSPIDER.toString(), this.getName(ServerEnum.CHEMSPIDER)),
            new SelectOption(ServerEnum.NORINE.toString(), this.getName(ServerEnum.NORINE)),
            new SelectOption(ServerEnum.PDB.toString(), this.getName(ServerEnum.PDB)),
            new SelectOption(ServerEnum.CHEBI.toString(), this.getName(ServerEnum.CHEBI)),
            new SelectOption(ServerEnum.MASS_SPEC_BLOCKS.toString(), this.getName(ServerEnum.MASS_SPEC_BLOCKS) + (containerName ? (' - ' + containerName) : ''))
        ];
    }

    static getFinder(value: ServerEnum, apiKey?: string): IFinder {
        switch (value) {
            case ServerEnum.PUBCHEM:
                return new PubChemFinder();
            case ServerEnum.CHEMSPIDER:
                if (apiKey) {
                    return new ChemSpiderFinder(apiKey);
                }
                break;
            case ServerEnum.NORINE:
                return new NorineFinder();
            case ServerEnum.PDB:
                return new PdbFinder();
            case ServerEnum.CHEBI:
                return new ChebiFinder();
            case ServerEnum.MASS_SPEC_BLOCKS:
                let token = localStorage.getItem(TOKEN);
                let container = localStorage.getItem(SELECTED_CONTAINER);
                if (container) {
                    return new MassSpecBlocksFinder(Number(container), token ?? undefined);
                }
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
            case ServerEnum.MASS_SPEC_BLOCKS:
                return 'MSB';
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

    static getFullId(database: ServerEnum, identifier: string | null) {
        if (identifier === null || identifier === undefined || identifier === "") {
            identifier = "0";
        }
        switch (database) {
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
                return 'ChEBI: ' + identifier;
            case ServerEnum.MASS_SPEC_BLOCKS:
                return 'MSB: ' + identifier;
        }
    }

}
