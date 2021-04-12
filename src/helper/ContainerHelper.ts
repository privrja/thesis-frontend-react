import {SELECTED_CONTAINER, SELECTED_CONTAINER_NAME} from "../constant/ApiConstants";

class ContainerHelper {

    static getSelectedContainer(): number {
        let selectedContainer = localStorage.getItem(SELECTED_CONTAINER);
        if (!selectedContainer) {
            selectedContainer = '1';
            localStorage.setItem(SELECTED_CONTAINER, selectedContainer);
            localStorage.setItem(SELECTED_CONTAINER_NAME, 'Nonribosomal Peptides and Siderophores');
        }
        return parseInt(selectedContainer);
    }

    static getSelectedContainerName(): string {
        let selectedContainer = localStorage.getItem(SELECTED_CONTAINER_NAME);
        if (!selectedContainer) {
            selectedContainer = 'Nonribosomal Peptides and Siderophores';
            localStorage.setItem(SELECTED_CONTAINER_NAME, selectedContainer);
            localStorage.setItem(SELECTED_CONTAINER, '1');
        }
        return selectedContainer;
    }

}

export default ContainerHelper;