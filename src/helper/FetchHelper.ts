import {ENDPOINT, TOKEN, URL_PREFIX} from "../constant/ApiConstants";
import FlashType from "../component/FlashType";
import Flash from "../component/Flash";
import Sleep from "./Sleep";

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

    static fetch(endpoint: string, method: string, transformationCallback: (e: any) => void, badCallback?: (e: any) => void) {
        const token = localStorage.getItem(TOKEN);
        fetch(endpoint, token ? {
            method: method,
            headers: {'x-auth-token': token}
        } : {
            method: 'GET'
        }).then(response => {
            if (response.status === 401) {
                localStorage.removeItem(TOKEN);
            }
            return response;
        }).then(response => {
            if (response.status === 200) {
                response.json().then(transformationCallback);
            } else {
                if (badCallback) {
                    badCallback(response);
                }
            }
        });
    }

    static fetchSetup(endpoint: string, init: any, flashRef: React.RefObject<Flash>) {
        fetch(endpoint, init).then(response => {
            if (response.status === 204) {
                flashRef.current!.activate(FlashType.OK);
            } else {
                response.json().then(data => flashRef.current!.activate(FlashType.BAD, data.message)).catch(() => flashRef.current!.activate(FlashType.BAD));
            }
        });
    }

    static conditions(component: any) {
        let token = localStorage.getItem(TOKEN);
        if (token) {
            fetch(ENDPOINT, {
                method: 'GET',
                headers: {'x-auth-token': token}
            }).then(response => {
                if (response.status === 204) {
                    if (response.headers.get('x-condition') !== "1") {
                        component.popupRef.current!.activate();
                    }
                }
            });
        }
    }

    static conditionsOk() {
        let token = localStorage.getItem(TOKEN);
        if (token) {
            fetch(ENDPOINT + 'condition', {
                method: 'POST',
                headers: {'x-auth-token': token}
            }).then(response => {
                if (response.status !== 204) {
                    FetchHelper.conditionsKo();
                }
            })
        } else {
            FetchHelper.conditionsKo();
        }
    }

    static conditionsKo() {
        localStorage.removeItem(TOKEN);
        FetchHelper.refreshLogout();
    }

    static refreshLogout() {
        Sleep.sleep(500).then(() => {
            window.location.href = '/logout'
        });
    }

    static refresh() {
        Sleep.sleep(500).then(() => {
            window.location.href = URL_PREFIX
        });
    }

}

export default FetchHelper;
