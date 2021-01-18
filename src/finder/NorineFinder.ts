import IFinder from "./IFinder";
import SingleStructure from "./SingleStructure";
import Sleep from "../helper/Sleep";
import {ServerEnum} from "../enum/ServerEnum";

const ENDPOINT_URI = "http://bioinfo.lifl.fr/norine/rest/";

interface Peptide {
    cite: string[];
    general: {
        id: string;
        name: string;
        family: string;
        category: string;
        formula: string;
        mw: number;
        doi: string;
    }
    structure: {
        type: string;
        size: number;
        composition: string;
        graph: string;
        smiles: string
    }
}

interface NorineResponse {
    norine: {
        peptide: Peptide[]
    }
}

class NorineFinder implements IFinder {

    findByIdentifier(id: string): Promise<SingleStructure[]> {
        return fetch(ENDPOINT_URI + 'id/json/' + id, {
                method: 'GET'
            }
        ).then(async response => {
            if (response.status === 200) {
                let json = await response.json() as NorineResponse;
                console.log(json);
                return [new SingleStructure(
                    json.norine.peptide[0].general.id,
                    ServerEnum.NORINE,
                    json.norine.peptide[0].general.name,
                    json.norine.peptide[0].structure.smiles,
                    json.norine.peptide[0].general.formula,
                    json.norine.peptide[0].general.mw
                )];
            } else {
                return [];
            }
        });
    }

    findByName(name: string): Promise<SingleStructure[]> {
        throw new Error();
        // return fetch(ENDPOINT_URI + 'name/' + name + CIDS_CONSTANT + FORMAT_JSON + '?name_type=word', {
        //     method: 'GET',
        // }).then(async response => (response.status === 200) ? this.jsonListResult(response) : []);
    }

    findByFormula(formula: string): Promise<SingleStructure[]> {
        throw new Error();
        // return fetch(ENDPOINT_URI + 'fastformula/' + formula + CIDS_CONSTANT + FORMAT_JSON, {
        //     method: 'GET'
        // }).then(async response => (response.status === 200) ? this.jsonListResult(response) : []);
    }

    findByIdentifiers(ids: []): Promise<SingleStructure[]> {
        throw new Error();
    //     return fetch(ENDPOINT_URI + CID_CONSTANT + ids.join(',') + PROPERTY_CONSTANT + PROPERTY_VALUES + FORMAT_JSON, {
    //         method: 'POST'
    //     }).then(async response => {
    //         if (response.status === 200) {
    //             let json = await response.json() as SingleResponseJson;
    //             return json.PropertyTable.Properties.map(e => new SingleStructure(
    //                 e.CID.toString(),
    //                 ServerEnum.PUBCHEM,
    //                 e.IUPACName,
    //                 e.CanonicalSMILES,
    //                 e.MolecularFormula,
    //                 e.MonoisotopicMass
    //             ));
    //         } else {
    //             return [];
    //         }
    //     });
    }

    findBySmiles(smiles: string): Promise<SingleStructure[]> {
        throw new Error();
        // return fetch(ENDPOINT_URI + 'smiles/' + smiles + CIDS_CONSTANT + FORMAT_JSON + '?list_return=listkey', {
        //     method: 'GET'
        // }).then(async response => {
        //     console.log(response);
        //     if (response.status === 200) {
        //         let json = await response.json() as ListKeyResponseJson;
        //         return fetch(ENDPOINT_URI + 'smiles/' + smiles + CIDS_CONSTANT + FORMAT_JSON + '?listkey=' + json.IdentifierList.ListKey + '&listkey_start=' + 0 + '&listkey_count=200', {
        //             method: 'GET'
        //         }).then(async nextResponse => { return nextResponse.status === 200 ? this.jsonListResult(nextResponse) : []});
        //     } else {
        //         return [];
        //     }
        // });
    }

    /**
     * Pubchem not supported
     * @param mass
     */
    findByMass(mass: number): Promise<SingleStructure[]> {
        return Sleep.sleep(0).then(() => []);
    }

    private async jsonListResult(response: Response): Promise<SingleStructure[]> {
        throw new Error();
        // let json = await response.json() as ListResponseJson;
        // if (json.IdentifierList.CID.length > 1) {
        //     return this.findByIdentifiers(json.IdentifierList.CID as []);
        // } else {
        //     return this.findByIdentifier(json.IdentifierList.CID[0].toString());
        // }
    }

}

export default NorineFinder;