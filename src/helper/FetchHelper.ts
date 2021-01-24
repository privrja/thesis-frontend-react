import {ENDPOINT} from "../constant/ApiConstants";

class FetchHelper {

    static async fetchModification(containerId: number, init: {}, callbackSuccess: Function, callbackFail: Function | null = null) {
        fetch(ENDPOINT + 'container/' + containerId + '/modification', init).then(response => {
            if (response.status === 200) {
                callbackSuccess(response.json());
            } else {
                if (callbackFail !== null) {
                    callbackFail(response.json());
                }
            }
        });
    }

}

export default FetchHelper;
