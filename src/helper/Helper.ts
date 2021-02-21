import {
    EDITOR_BACK,
    EDITOR_ITEM,
    EDITOR_SMILES,
    SELECTED_CONTAINER,
    SEQUENCE_EDIT,
    SEQUENCE_ID
} from "../constant/ApiConstants";

class Helper {

    static resetStorage() {
        localStorage.removeItem(SEQUENCE_EDIT);
        localStorage.removeItem(SEQUENCE_ID);
        localStorage.setItem(SELECTED_CONTAINER, '1');
        localStorage.removeItem(EDITOR_SMILES);
        localStorage.removeItem(EDITOR_BACK);
        localStorage.removeItem(EDITOR_ITEM);
    }

}

export default Helper;