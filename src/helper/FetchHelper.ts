import {CHEMSPIDER_KEY, TOKEN} from "../constant/ApiConstants";
import FlashType from "../component/FlashType";
import Flash from "../component/Flash";
import Sleep from "./Sleep";
import {CHEMSPIDER_ONE_KEY, ENDPOINT} from "../constant/Constants";

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
            method: method
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
                        component.popupRef.current!.activateWithoutText();
                    }
                }
            });
        }
    }

    static conditionsOk(history: any) {
        let token = localStorage.getItem(TOKEN);
        if (token) {
            fetch(ENDPOINT + 'condition', {
                method: 'POST',
                headers: {'x-auth-token': token}
            }).then(response => {
                if (response.status !== 204) {
                    FetchHelper.conditionsKo(history);
                }
            })
        } else {
            FetchHelper.conditionsKo(history);
        }
    }

    static conditionsKo(history: any) {
        localStorage.removeItem(TOKEN);
        FetchHelper.refreshLogout(history);
    }

    static refreshLogout(history: any) {
        Sleep.sleep(500).then(() => {
            history.push('/logout');
        });
    }

    static refresh(history: any) {
        Sleep.sleep(500).then(() => {
            history.push('/');
        });
    }

    static initializeChemSpider() {
        if (CHEMSPIDER_ONE_KEY && CHEMSPIDER_ONE_KEY.length > 0) {
            localStorage.setItem(CHEMSPIDER_KEY, CHEMSPIDER_ONE_KEY);
        } else {
            FetchHelper.fetch(ENDPOINT + 'chemspider/key', 'GET', (data: any) => {
                if (data.apiKey) {
                    localStorage.setItem(CHEMSPIDER_KEY, data.apiKey);
                } else {
                    localStorage.removeItem(CHEMSPIDER_KEY);
                }
            });
        }
    }


}

export default FetchHelper;
