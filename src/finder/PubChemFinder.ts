import IFinder from "./IFinder";
import SingleStructure from "./SingleStructure";
import Sleep from "../helper/Sleep";
import {ServerEnum} from "../enum/ServerEnum";

const ENDPOINT_URI = "https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/";
const PROPERTY_VALUES = "IUPACName,MolecularFormula,MonoisotopicMass,CanonicalSmiles/";
const PROPERTY_CONSTANT = '/property/';
const FORMAT_JSON = 'json';
const CID_CONSTANT = 'cid/';
const CIDS_CONSTANT = '/cids/';

interface NameResponse {
    InformationList: InformationList;
}

interface InformationList {
    Information: Information[]
}

interface Information {
    CID: number
    Synonym: string[]
}

interface ListResponseJson {
    IdentifierList: {
        CID: number[]
    }
}

interface SingleResponseJson {
    PropertyTable: {
        Properties: PropertyResponseJson[]
    }
}

interface PropertyResponseJson {
    CID: number
    MolecularFormula: string
    CanonicalSMILES: string;
    IUPACName: string
    MonoisotopicMass: number
}

interface ListKeyResponseJson {
    IdentifierList: {
        ListKey: number
        Size: number
        EntrezDB: string
        EntrezWebEnv: string
        EntrezQueryKey: number
        EntrezURL: string
    }
}

class PubChemFinder implements IFinder {

    findByIdentifier(id: string): Promise<SingleStructure[]> {
        if (id === '') {
            return Sleep.noSleepPromise();
        }
        return fetch(ENDPOINT_URI + CID_CONSTANT + id + PROPERTY_CONSTANT + PROPERTY_VALUES + FORMAT_JSON, {
                method: 'GET'
            }
        ).then(async response => {
            if (response.status === 200) {
                let json = await response.json() as SingleResponseJson;
                return [new SingleStructure(
                    json.PropertyTable.Properties[0].CID.toString(),
                    ServerEnum.PUBCHEM,
                    json.PropertyTable.Properties[0].IUPACName,
                    json.PropertyTable.Properties[0].CanonicalSMILES,
                    json.PropertyTable.Properties[0].MolecularFormula,
                    Number(json.PropertyTable.Properties[0].MonoisotopicMass)
                )];
            } else {
                return [];
            }
        }).catch(() => []);
    }

    findByName(name: string): Promise<SingleStructure[]> {
        if (name === '') {
            return Sleep.noSleepPromise();
        }
        return fetch(ENDPOINT_URI + 'name/' + name + CIDS_CONSTANT + FORMAT_JSON + '?name_type=word', {
            method: 'GET',
        }).then(async response => (response.status === 200) ? this.jsonListResult(response) : []).catch(() => []);
    }

    findByFormula(formula: string): Promise<SingleStructure[]> {
        if (formula === '') {
            return Sleep.noSleepPromise();
        }
        return fetch(ENDPOINT_URI + 'fastformula/' + formula + CIDS_CONSTANT + FORMAT_JSON, {
            method: 'GET'
        }).then(async response => (response.status === 200) ? this.jsonListResult(response) : []).catch(() => []);
    }

    findByIdentifiers(ids: string[]): Promise<SingleStructure[]> {
        if (ids.length === 0) {
            return Sleep.noSleepPromise();
        }
        return fetch(ENDPOINT_URI + CID_CONSTANT + ids.filter((value, index) => index < 100).join(',') + PROPERTY_CONSTANT + PROPERTY_VALUES + FORMAT_JSON, {
            method: 'POST'
        }).then(async response => {
            if (response.status === 200) {
                let json = await response.json() as SingleResponseJson;
                return json.PropertyTable.Properties.map(e => new SingleStructure(
                    e.CID.toString(),
                    ServerEnum.PUBCHEM,
                    e.IUPACName,
                    e.CanonicalSMILES,
                    e.MolecularFormula,
                    e.MonoisotopicMass
                ));
            } else {
                return [];
            }
        }).catch(() => []);
    }

    findBySmiles(smiles: string): Promise<SingleStructure[]> {
        if (smiles === '') {
            return Sleep.noSleepPromise();
        }
        return fetch(ENDPOINT_URI + 'smiles/' + smiles + CIDS_CONSTANT + FORMAT_JSON + '?list_return=listkey', {
            method: 'GET'
        }).then(async response => {
            if (response.status === 200) {
                let json = await response.json() as ListKeyResponseJson;
                return fetch(ENDPOINT_URI + 'smiles/' + smiles + CIDS_CONSTANT + FORMAT_JSON + '?listkey=' + json.IdentifierList.ListKey + '&listkey_start=' + 0 + '&listkey_count=200', {
                    method: 'GET'
                }).then(async nextResponse => { return nextResponse.status === 200 ? this.jsonListResult(nextResponse) : []}).catch(() => []);
            } else {
                return [];
            }
        }).catch(() => {
            return [];
        });
    }

    /**
     * Pubchem not supported
     * @param mass
     */
    findByMass(mass: number): Promise<SingleStructure[]> {
        return Sleep.sleep(0).then(() => []);
    }

    findName(id: string, defaultName: string): Promise<string> {
        if(id === '' || Number(id) < 1) {
            return new Promise((resolve) => setTimeout(() => resolve(defaultName), 0));
        }
        return fetch(ENDPOINT_URI + 'cid/' + id + '/synonyms/' + FORMAT_JSON, {
            method: 'GET',
        }).then(async response => {
            if(response.status === 200) {
                let json = await response.json().catch(() => { /* On purpose*/ }) as NameResponse;
                if (json.InformationList.Information.length > 0 && json.InformationList.Information[0].Synonym.length > 0) {
                    return json.InformationList.Information[0].Synonym[0];
                } else {
                    return defaultName;
                }
            } else {
                return defaultName;
            }
        }).catch(() => defaultName);
    }

    private async jsonListResult(response: Response): Promise<SingleStructure[]> {
        let json = await response.json().catch(() => { /* On purpose */ }) as ListResponseJson;
        if (json.IdentifierList.CID.length > 1) {
            return this.findByIdentifiers(json.IdentifierList.CID as []);
        } else if (json.IdentifierList.CID.length > 0) {
            return this.findByIdentifier(json.IdentifierList.CID[0].toString());
        } else {
            return [];
        }
    }

}

export default PubChemFinder;