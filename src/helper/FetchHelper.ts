import {CHEMSPIDER_KEY, TOKEN} from "../constant/ApiConstants";
import FlashType from "../component/FlashType";
import Flash from "../component/Flash";
import Sleep from "./Sleep";
import {CHEMSPIDER_ONE_KEY, ENDPOINT} from "../constant/Constants";
import PubChemFinder from "../finder/PubChemFinder";
import {ServerEnum} from "../enum/ServerEnum";

class FetchHelper {

    static async fetchModification(containerId: number, init: {}, callbackSuccess: Function, callbackFail: Function | null = null) {
        fetch(ENDPOINT + 'container/' + containerId + '/modification?sort=modificationName&order=asc', init).then(response => {
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

    static refresh(history: any, url?: string) {
        Sleep.sleep(500).then(() => {
            history.push(url ?? '/');
            caches.keys().then((names) => names.forEach((name) => caches.delete(name)));
            window.location.reload(true);
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

    static async findReference(key: number, smiles: string, context: any, SEL_EDIT_SOURCE: string, TXT_EDIT_IDENTIFIER: string) {
        let finder = new PubChemFinder();
        let blocks = await finder.findBySmiles(smiles);
        if (blocks.length > 0) {
            context.flashRef.current!.activate(FlashType.OK, 'Reference found CID: ' + blocks[0].identifier);
            context.setState({editable: key}, () => {
                (document.getElementById(SEL_EDIT_SOURCE) as HTMLSelectElement).selectedIndex = ServerEnum.PUBCHEM;
                (document.getElementById(TXT_EDIT_IDENTIFIER) as HTMLInputElement).value = blocks[0].identifier;
            });
        } else {
            context.flashRef.current!.activate(FlashType.BAD, 'Reference not found');
        }
    }

}

export default FetchHelper;
