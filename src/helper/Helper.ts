import {
    EDITOR_BACK,
    EDITOR_ITEM,
    EDITOR_SMILES,
    SELECTED_CONTAINER, SELECTED_CONTAINER_NAME,
    SEQUENCE_EDIT,
    SEQUENCE_ID
} from "../constant/ApiConstants";

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



}

export default Helper;