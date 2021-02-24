import {ENDPOINT, TOKEN} from "../constant/ApiConstants";

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

    static fetch(endpoint: string, transformationCallback: (e: any) => void) {
        const token = localStorage.getItem(TOKEN);
        fetch(endpoint, token ? {
            method: 'GET',
            headers: {'x-auth-token': token}
        } : {
            method: 'GET'
        }).then(response => {
            if (response.status === 401) {
                localStorage.removeItem(TOKEN);
            }
            return response;
        }).then(response => { if (response.status === 200) { response.json().then(transformationCallback)}});
    }

}

export default FetchHelper;
