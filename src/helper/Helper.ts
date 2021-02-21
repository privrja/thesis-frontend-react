import {
    EDITOR_BACK,
    EDITOR_ITEM,
    EDITOR_SMILES,
    SELECTED_CONTAINER,
    SEQUENCE_EDIT,
    SEQUENCE_ID
} from "../constant/ApiConstants";

class Helper {

    static resetUserStorage() {
        this.resetStorage();
        localStorage.setItem(SELECTED_CONTAINER, '1');
    }

    static resetStorage() {
        localStorage.removeItem(SEQUENCE_EDIT);
        localStorage.removeItem(SEQUENCE_ID);
        localStorage.removeItem(EDITOR_SMILES);
        localStorage.removeItem(EDITOR_BACK);
        localStorage.removeItem(EDITOR_ITEM);
    }



}

export default Helper;