import {SelectOption} from "../component/SelectInput";
import IFinder from "../finder/IFinder";
import SingleStructure from "../finder/SingleStructure";

export enum SearchEnum {
    NAME, SMILES, FORMULA, MASS, IDENTIFIER
}

export class SearchEnumHelper {

    static getSearchOptions() {
        return [
            new SelectOption(SearchEnum.NAME.toString(), 'Name'),
            new SelectOption(SearchEnum.SMILES.toString(), 'SMILES'),
            new SelectOption(SearchEnum.FORMULA.toString(), 'Molecular Formula'),
            new SelectOption(SearchEnum.MASS.toString(), 'Monoisotopic Mass'),
            new SelectOption(SearchEnum.IDENTIFIER.toString(), 'Identifier'),
        ]
    }

    static getIdentifier(value: SearchEnum) {
        switch (value) {
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

}
