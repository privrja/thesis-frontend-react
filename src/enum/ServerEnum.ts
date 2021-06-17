import {SelectOption} from "../component/SelectInput";
import IFinder from "../finder/IFinder";
import PubChemFinder from "../finder/PubChemFinder";
import NorineFinder from "../finder/NorineFinder";
import PdbFinder from "../finder/PdbFinder";
import ChemSpiderFinder from "../finder/ChemSpiderFinder";
import MassSpecBlocksFinder from "../finder/MassSpecBlocksFinder";
import {SELECTED_CONTAINER, TOKEN} from "../constant/ApiConstants";
import ChebiFinder from "../finder/ChebiFinder";
import CoconutFinder from "../finder/CoconutFinder";
import NPAtlasFinder from "../finder/NPAtlasFinder";

export enum ServerEnum {
    PUBCHEM, CHEMSPIDER, NORINE, PDB, CHEBI, MASS_SPEC_BLOCKS, DOI, SIDEROPHORE_BASE, LIPID_MAPS, COCONUT, NP_ATLAS
}

export class ServerEnumHelper {

    static getOptions(containerName?: string): SelectOption[] {
        return [
            new SelectOption(ServerEnum.PUBCHEM.toString(), this.getName(ServerEnum.PUBCHEM)),
            new SelectOption(ServerEnum.CHEMSPIDER.toString(), this.getName(ServerEnum.CHEMSPIDER)),
            new SelectOption(ServerEnum.NORINE.toString(), this.getName(ServerEnum.NORINE)),
            new SelectOption(ServerEnum.PDB.toString(), this.getName(ServerEnum.PDB)),
            new SelectOption(ServerEnum.CHEBI.toString(), this.getName(ServerEnum.CHEBI)),
            new SelectOption(ServerEnum.MASS_SPEC_BLOCKS.toString(), this.getName(ServerEnum.MASS_SPEC_BLOCKS) + (containerName ? (' - ' + containerName) : '')),
            new SelectOption(ServerEnum.DOI.toString(), this.getName(ServerEnum.DOI)),
            new SelectOption(ServerEnum.SIDEROPHORE_BASE.toString(), this.getName(ServerEnum.SIDEROPHORE_BASE)),
            new SelectOption(ServerEnum.LIPID_MAPS.toString(), this.getName(ServerEnum.LIPID_MAPS)),
            new SelectOption(ServerEnum.COCONUT.toString(), this.getName(ServerEnum.COCONUT)),
            new SelectOption(ServerEnum.NP_ATLAS.toString(), this.getName(ServerEnum.NP_ATLAS))
        ];
    }

    static getSearchOptions(containerName?: string) {
        return [
            new SelectOption(ServerEnum.PUBCHEM.toString(), this.getName(ServerEnum.PUBCHEM)),
            new SelectOption(ServerEnum.CHEMSPIDER.toString(), this.getName(ServerEnum.CHEMSPIDER)),
            new SelectOption(ServerEnum.NORINE.toString(), this.getName(ServerEnum.NORINE)),
            new SelectOption(ServerEnum.PDB.toString(), this.getName(ServerEnum.PDB)),
            new SelectOption(ServerEnum.CHEBI.toString(), this.getName(ServerEnum.CHEBI)),
            new SelectOption(ServerEnum.COCONUT.toString(), this.getName(ServerEnum.COCONUT)),
            new SelectOption(ServerEnum.NP_ATLAS.toString(), this.getName(ServerEnum.NP_ATLAS)),
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
                break;
            case ServerEnum.COCONUT:
                return new CoconutFinder();
            case ServerEnum.NP_ATLAS:
                return new NPAtlasFinder();
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
            case ServerEnum.DOI:
                return 'DOI';
            case ServerEnum.SIDEROPHORE_BASE:
                return 'Siderophore Base';
            case ServerEnum.LIPID_MAPS:
                return 'Lipid Maps';
            case ServerEnum.COCONUT:
                return 'COCONUT';
            case ServerEnum.NP_ATLAS:
                return 'NPAtlas';
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
            case ServerEnum.DOI:
                return "https://doi.org/" + identifier;
            case ServerEnum.SIDEROPHORE_BASE:
                return "http://bertrandsamuel.free.fr/siderophore_base/siderophore.php?id=" + identifier;
            case ServerEnum.LIPID_MAPS:
                return "https://www.lipidmaps.org/data/LMSDRecord.php?LMID=" + identifier;
            case ServerEnum.COCONUT:
                return "https://coconut.naturalproducts.net/compound/coconut_id/" + identifier;
            case ServerEnum.NP_ATLAS:
                return "https://www.npatlas.org/explore/compounds/" + identifier;
        }
    }

    static getFullId(database: ServerEnum, identifier: string | null) {
        if (identifier === null || identifier === undefined || identifier === "") {
            identifier = "0";
        }
        if (identifier.toUpperCase().includes('CHEBI:')) {
            return identifier.toUpperCase();
        }
        if (identifier.toUpperCase().includes('CNP')) {
            return identifier.toUpperCase();
        }
        if (identifier.toUpperCase().includes('NPA')) {
            return identifier.toUpperCase();
        }
        switch (database) {
            default:
            case ServerEnum.PUBCHEM:
                return 'CID: ' + identifier;
            case ServerEnum.CHEMSPIDER:
                return 'CSID: ' + identifier;
            case ServerEnum.NORINE:
            case ServerEnum.LIPID_MAPS:
                return identifier;
            case ServerEnum.PDB:
                return 'PDB: ' + identifier;
            case ServerEnum.CHEBI:
                return 'CHEBI:' + identifier;
            case ServerEnum.MASS_SPEC_BLOCKS:
                return 'MSB: ' + identifier;
            case ServerEnum.DOI:
                return 'DOI: ' + identifier;
            case ServerEnum.SIDEROPHORE_BASE:
                return 'SB: ' + identifier;
            case ServerEnum.COCONUT:
                return 'CNP' + '0'.repeat(7 - identifier.length) + identifier;
            case ServerEnum.NP_ATLAS:
                return 'NPA' + '0'.repeat(6 - identifier.length) + identifier;
        }
    }

}
