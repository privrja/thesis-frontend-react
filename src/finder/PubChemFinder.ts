import IFinder from "./IFinder";
import SingleStructure from "./SingleStructure";

const ENDPOINT_URI = "https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/";
const PROPERTY_VALUES = "IUPACName,MolecularFormula,MonoisotopicMass,CanonicalSmiles/";
const PROPERTY_CONSTANT = '/property/';
const FORMAT_JSON = 'json';
const CID_CONSTANT = 'cid/';

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
        return fetch(ENDPOINT_URI + 'name/' + name + '/cids/' + FORMAT_JSON + '?name_type=word', {
                method: 'GET',
            }
        ).then(async response => {
                if (response.status === 200) {
                    let json = await response.json() as ListResponseJson;
                    if (json.IdentifierList.CID.length > 1) {
                        return this.findByIdentifiers(json.IdentifierList.CID as []);
                    } else {
                        return this.findByIdentifier(json.IdentifierList.CID[0].toString());
                    }
                }
                return [];
            }
        );
    }

    findByFormula(formula: string): Promise<SingleStructure[]> {
        // TODO
        return new Promise<SingleStructure[]>(resolve => {});
    }

    findByIdentifiers(ids: []): Promise<SingleStructure[]> {
        return fetch(ENDPOINT_URI + CID_CONSTANT + ids.join(',') + PROPERTY_CONSTANT + PROPERTY_VALUES + FORMAT_JSON, {
            method: 'POST'
        }).then(async response => {
            if (response.status === 200) {
                let json = await response.json() as SingleResponseJson;
                return json.PropertyTable.Properties.map(e => new SingleStructure(
                    e.CID.toString(),
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

    findByMass(mass: number): Promise<SingleStructure[]> {
        // TODO
        return new Promise<SingleStructure[]>(resolve => {});
    }

    findBySmiles(smiles: string): Promise<SingleStructure[]>{
        // TODO
        return new Promise<SingleStructure[]>(resolve => {});
    }

}

export default PubChemFinder;