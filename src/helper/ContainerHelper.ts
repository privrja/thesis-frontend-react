import {SELECTED_CONTAINER} from "../constant/ApiConstants";

class ContainerHelper {

    static getSelectedContainer(): number {
        let selectedContainer = localStorage.getItem(SELECTED_CONTAINER);
        if (!selectedContainer) {
            selectedContainer = '1';
            localStorage.setItem(SELECTED_CONTAINER, selectedContainer);
        }
        return parseInt(selectedContainer);
    }

}

export default ContainerHelper;