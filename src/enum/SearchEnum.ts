import {SelectOption} from "../component/SelectInput";
import IFinder from "../finder/IFinder";
import SingleStructure from "../finder/SingleStructure";
import {ServerEnum} from "./ServerEnum";

export enum SearchEnum {
    NAME, SMILES, FORMULA, MASS, IDENTIFIER
}

export class SearchEnumHelper {

    static getOptions() {
        return [
            new SelectOption(SearchEnum.NAME.toString(), this.getName(SearchEnum.NAME)),
            new SelectOption(SearchEnum.SMILES.toString(), this.getName(SearchEnum.SMILES)),
            new SelectOption(SearchEnum.FORMULA.toString(), this.getName(SearchEnum.FORMULA)),
            new SelectOption(SearchEnum.MASS.toString(), this.getName(SearchEnum.MASS)),
            new SelectOption(SearchEnum.IDENTIFIER.toString(), this.getName(SearchEnum.IDENTIFIER)),
        ]
    }

    static getName(value: SearchEnum) {
        switch (value) {
            default:
            case SearchEnum.NAME:
                return 'name';
            case SearchEnum.IDENTIFIER:
                return 'identifier';
            case SearchEnum.FORMULA:
                return 'formula';
            case SearchEnum.MASS:
                return 'mass';
            case SearchEnum.SMILES:
                return 'smiles';
        }
    }

    static getValue(name: string) {
        switch (name) {
            default:
            case 'name':
                return SearchEnum.NAME;
            case 'smiles':
                return SearchEnum.SMILES;
            case 'formula':
                return SearchEnum.FORMULA;
            case 'mass':
                return SearchEnum.MASS;
            case 'identifier':
                return SearchEnum.IDENTIFIER;
        }
    }

    static find(value: SearchEnum, finder: IFinder, param: any): Promise<SingleStructure[]> {
        switch (value) {
            case SearchEnum.NAME:
                return finder.findByName(param);
            case SearchEnum.SMILES:
                return finder.findBySmiles(param);
            case SearchEnum.FORMULA:
                return finder.findByFormula(param);
            case SearchEnum.MASS:
                return finder.findByMass(param);
            case SearchEnum.IDENTIFIER:
                return finder.findByIdentifier(param);
        }
    }

    static getOptionsBySource(source: ServerEnum) {
        switch (source) {
            case ServerEnum.PUBCHEM:
            case ServerEnum.COCONUT:
                return [
                    new SelectOption(SearchEnum.NAME.toString(), this.getName(SearchEnum.NAME)),
                    new SelectOption(SearchEnum.SMILES.toString(), this.getName(SearchEnum.SMILES)),
                    new SelectOption(SearchEnum.FORMULA.toString(), this.getName(SearchEnum.FORMULA)),
                    new SelectOption(SearchEnum.IDENTIFIER.toString(), this.getName(SearchEnum.IDENTIFIER)),
                ];
            case ServerEnum.NORINE:
                return [
                    new SelectOption(SearchEnum.NAME.toString(), this.getName(SearchEnum.NAME)),
                    new SelectOption(SearchEnum.FORMULA.toString(), this.getName(SearchEnum.FORMULA)),
                    new SelectOption(SearchEnum.IDENTIFIER.toString(), this.getName(SearchEnum.IDENTIFIER)),
                ];
            case ServerEnum.PDB:
                return [
                    new SelectOption(SearchEnum.IDENTIFIER.toString(), this.getName(SearchEnum.IDENTIFIER)),
                ];
            case ServerEnum.CHEBI:
            case ServerEnum.CHEMSPIDER:
            case ServerEnum.MASS_SPEC_BLOCKS:
            case ServerEnum.NP_ATLAS:
            default:
                return this.getOptions();
        }


    }

}
