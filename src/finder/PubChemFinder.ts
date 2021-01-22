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
                    json.PropertyTable.Properties[0].MonoisotopicMass
                )];
            } else {
                return [];
            }
        });
    }

    findByName(name: string): Promise<SingleStructure[]> {
        return fetch(ENDPOINT_URI + 'name/' + name + CIDS_CONSTANT + FORMAT_JSON + '?name_type=word', {
            method: 'GET',
        }).then(async response => (response.status === 200) ? this.jsonListResult(response) : []);
    }

    findByFormula(formula: string): Promise<SingleStructure[]> {
        return fetch(ENDPOINT_URI + 'fastformula/' + formula + CIDS_CONSTANT + FORMAT_JSON, {
            method: 'GET'
        }).then(async response => (response.status === 200) ? this.jsonListResult(response) : []);
    }

    findByIdentifiers(ids: []): Promise<SingleStructure[]> {
        return fetch(ENDPOINT_URI + CID_CONSTANT + ids.join(',') + PROPERTY_CONSTANT + PROPERTY_VALUES + FORMAT_JSON, {
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
        });
    }

    findBySmiles(smiles: string): Promise<SingleStructure[]> {
        return fetch(ENDPOINT_URI + 'smiles/' + smiles + CIDS_CONSTANT + FORMAT_JSON + '?list_return=listkey', {
            method: 'GET'
        }).then(async response => {
            if (response.status === 200) {
                let json = await response.json() as ListKeyResponseJson;
                return fetch(ENDPOINT_URI + 'smiles/' + smiles + CIDS_CONSTANT + FORMAT_JSON + '?listkey=' + json.IdentifierList.ListKey + '&listkey_start=' + 0 + '&listkey_count=200', {
                    method: 'GET'
                }).then(async nextResponse => { return nextResponse.status === 200 ? this.jsonListResult(nextResponse) : []});
            } else {
                return [];
            }
        });
    }

    /**
     * Pubchem not supported
     * @param mass
     */
    findByMass(mass: number): Promise<SingleStructure[]> {
        return Sleep.sleep(0).then(() => []);
    }

    private async jsonListResult(response: Response): Promise<SingleStructure[]> {
        let json = await response.json() as ListResponseJson;
        if (json.IdentifierList.CID.length > 1) {
            return this.findByIdentifiers(json.IdentifierList.CID as []);
        } else {
            return this.findByIdentifier(json.IdentifierList.CID[0].toString());
        }
    }

}

export default PubChemFinder;