import IFinder from "./IFinder";
import SingleStructure from "./SingleStructure";
import Sleep from "../helper/Sleep";
import {ServerEnum} from "../enum/ServerEnum";

const ENDPOINT_URI = "https://api.rsc.org/compounds/v1/";

class ChemSpiderFinder implements IFinder {

    private apiKey = '';

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    findByFormula(formula: string): Promise<SingleStructure[]> {
        return Sleep.noSleepPromise();
    }

    findByIdentifier(id: string): Promise<SingleStructure[]> {
        if (id === '') {
            return Sleep.noSleepPromise();
        }
        return fetch(ENDPOINT_URI + 'records/' + id + '/details?fields=SMILES,Formula,MonoisotopicMass,CommonName', {
            method: 'GET',
            headers: {'apikey': this.apiKey},
        }).then(response => {
            if (response.status === 200) {
                return response.json().then(data => {
                    return [new SingleStructure(
                        id,
                        ServerEnum.CHEMSPIDER,
                        data.commonName,
                        data.smiles,
                        (data.formula as string)
                            .replaceAll('_', '')
                            .replaceAll('{', '')
                            .replaceAll('}', ''),
                        Number(data.monoisotopicMass)
                    )];
                });
            } else {
                return [];
            }
        });
    }

    findByIdentifiers(ids: string[]): Promise<SingleStructure[]> {
        return Sleep.noSleepPromise();
    }

    findByMass(mass: number): Promise<SingleStructure[]> {
        return Sleep.noSleepPromise();
    }

    findByName(name: string): Promise<SingleStructure[]> {
        return Sleep.noSleepPromise();
    }

    findBySmiles(smiles: string): Promise<SingleStructure[]> {
        return Sleep.noSleepPromise();
    }

}

export default ChemSpiderFinder;
