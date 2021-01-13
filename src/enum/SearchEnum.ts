import {SelectOption} from "../component/SelectInput";

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

}
