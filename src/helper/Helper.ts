import {
    EDITOR_BACK,
    EDITOR_ITEM,
    EDITOR_SMILES,
    SELECTED_CONTAINER, SELECTED_CONTAINER_NAME,
    SEQUENCE_EDIT,
    SEQUENCE_ID
} from "../constant/ApiConstants";
import {
    SORT_B_MODIFICATION,
    SORT_C_MODIFICATION,
    SORT_FAMILY,
    SORT_ID, SORT_IDENTIFIER, SORT_N_MODIFICATION,
    SORT_SEQUENCE,
    SORT_SEQUENCE_FORMULA,
    SORT_SEQUENCE_MASS_FROM,
    SORT_SEQUENCE_NAME,
    SORT_SEQUENCE_TYPE,
    SORT_SEQUNECE_MASS_TO, SORT_USAGES,
    TXT_FILTER_SEQUENCE,
    TXT_FILTER_SEQUENCE_B_MODIFICATION,
    TXT_FILTER_SEQUENCE_C_MODIFICATION,
    TXT_FILTER_SEQUENCE_FAMILY,
    TXT_FILTER_SEQUENCE_FORMULA,
    TXT_FILTER_SEQUENCE_ID,
    TXT_FILTER_SEQUENCE_IDENTIFIER,
    TXT_FILTER_SEQUENCE_MASS_FROM,
    TXT_FILTER_SEQUENCE_MASS_TO,
    TXT_FILTER_SEQUENCE_N_MODIFICATION,
    TXT_FILTER_SEQUENCE_NAME,
    TXT_FILTER_SEQUENCE_TYPE,
    TXT_FILTER_SEQUENCE_USAGES
} from "../constant/DefaultConstants";

class Helper {

    static resetUserStorage() {
        this.resetStorage();
        localStorage.setItem(SELECTED_CONTAINER, '1');
        localStorage.setItem(SELECTED_CONTAINER_NAME, 'Nonribosomal Peptides and Siderophores');
    }

    static resetStorage() {
        localStorage.removeItem(SEQUENCE_EDIT);
        localStorage.removeItem(SEQUENCE_ID);
        localStorage.removeItem(EDITOR_SMILES);
        localStorage.removeItem(EDITOR_BACK);
        localStorage.removeItem(EDITOR_ITEM);
    }


    static sequenceFilter(component: any, isUsages: boolean = false) {
        let id = document.getElementById(TXT_FILTER_SEQUENCE_ID) as HTMLInputElement;
        let name = document.getElementById(TXT_FILTER_SEQUENCE_NAME) as HTMLInputElement;
        let sequenceType = document.getElementById(TXT_FILTER_SEQUENCE_TYPE) as HTMLInputElement;
        let sequence = document.getElementById(TXT_FILTER_SEQUENCE) as HTMLInputElement;
        let formula = document.getElementById(TXT_FILTER_SEQUENCE_FORMULA) as HTMLInputElement;
        let massFrom = document.getElementById(TXT_FILTER_SEQUENCE_MASS_FROM) as HTMLInputElement;
        let massTo = document.getElementById(TXT_FILTER_SEQUENCE_MASS_TO) as HTMLInputElement;
        let family = document.getElementById(TXT_FILTER_SEQUENCE_FAMILY) as HTMLInputElement;
        let nModification = document.getElementById(TXT_FILTER_SEQUENCE_N_MODIFICATION) as HTMLInputElement;
        let cModification = document.getElementById(TXT_FILTER_SEQUENCE_C_MODIFICATION) as HTMLInputElement;
        let bModification = document.getElementById(TXT_FILTER_SEQUENCE_B_MODIFICATION) as HTMLInputElement;
        let identifier = document.getElementById(TXT_FILTER_SEQUENCE_IDENTIFIER) as HTMLInputElement;
        let filter =
            component.addFilter(
                component.addFilter(
                    component.addFilter(
                        component.addFilter(
                            component.addFilter(
                                component.addFilter(
                                    component.addFilter(
                                        component.addFilter(
                                            component.addFilter(
                                                component.addFilter(
                                                    component.addFilter(
                                                        component.addFilter('', SORT_ID, id.value)
                                                        , SORT_SEQUENCE_NAME, name.value)
                                                    , SORT_SEQUENCE_TYPE, sequenceType.value)
                                                , SORT_SEQUENCE, sequence.value)
                                            , SORT_SEQUENCE_FORMULA, formula.value)
                                        , SORT_SEQUENCE_MASS_FROM, massFrom.value)
                                    , SORT_SEQUNECE_MASS_TO, massTo.value)
                                , SORT_FAMILY, family.value)
                            , SORT_N_MODIFICATION, nModification.value)
                        , SORT_C_MODIFICATION, cModification.value)
                    , SORT_B_MODIFICATION, bModification.value)
                , SORT_IDENTIFIER, identifier.value);
        if (isUsages) {
            let usages = document.getElementById(TXT_FILTER_SEQUENCE_USAGES) as HTMLInputElement;
            component.addFilter(filter, SORT_USAGES, usages.value)

        }
        component.setState({filter: filter}, component.list);
    }

    static sequenceClear(component: any, isUsages = false) {
        component.clearConcreteFilter(TXT_FILTER_SEQUENCE_ID);
        component.clearConcreteFilter(TXT_FILTER_SEQUENCE_NAME);
        component.clearConcreteFilter(TXT_FILTER_SEQUENCE_TYPE);
        component.clearConcreteFilter(TXT_FILTER_SEQUENCE);
        component.clearConcreteFilter(TXT_FILTER_SEQUENCE_FORMULA);
        component.clearConcreteFilter(TXT_FILTER_SEQUENCE_MASS_FROM);
        component.clearConcreteFilter(TXT_FILTER_SEQUENCE_MASS_TO);
        component.clearConcreteFilter(TXT_FILTER_SEQUENCE_FAMILY);
        component.clearConcreteFilter(TXT_FILTER_SEQUENCE_N_MODIFICATION);
        component.clearConcreteFilter(TXT_FILTER_SEQUENCE_C_MODIFICATION);
        component.clearConcreteFilter(TXT_FILTER_SEQUENCE_B_MODIFICATION);
        component.clearConcreteFilter(TXT_FILTER_SEQUENCE_IDENTIFIER);
        if(isUsages) {
            component.clearConcreteFilter(TXT_FILTER_SEQUENCE_USAGES);
        }
        component.setState({lastSortOrder: undefined, lastSortParam: undefined}, component.filter);
        
    }

}

export default Helper;