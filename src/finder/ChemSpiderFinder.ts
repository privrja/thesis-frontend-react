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

    async findByFormula(formula: string): Promise<SingleStructure[]> {
        if (formula === "") {
            return Sleep.noSleepPromise();
        }
        let queryId = await fetch(ENDPOINT_URI + 'filter/formula', {
            method: 'POST',
            headers: {'apikey': this.apiKey},
            body: JSON.stringify({formula: formula})
        }).then(response => {
            if (response.status === 200) {
                return response.json().then(data => data.queryId).catch(() => -1);
            } else {
                return -1;
            }
        }).catch(() => -1);
        if (queryId === -1) {
            return [];
        }
        return this.jsonListResult(queryId);
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
                        ChemSpiderFinder.formulaReplace(data.formula as string),
                        Number(data.monoisotopicMass)
                    )];
                });
            } else {
                return [];
            }
        });
    }

    findByIdentifiers(ids: string[]): Promise<SingleStructure[]> {
        if (ids.length === 0) {
            return Sleep.noSleepPromise();
        }
        return fetch(ENDPOINT_URI + 'records/batch', {
            method: 'POST',
            headers: {'apikey': this.apiKey},
            body: JSON.stringify({recordIds: ids, fields: ["SMILES", "Formula", "MonoisotopicMass", "CommonName"]})
        }).then(response => {
            if (response.status === 200) {
                return response.json().then(data => data.records.map((peptide: any) => new SingleStructure(
                    peptide.id,
                    ServerEnum.CHEMSPIDER,
                    peptide.commonName,
                    peptide.smiles,
                    ChemSpiderFinder.formulaReplace(peptide.formula as string),
                    Number(peptide.monoisotopicMass)
                ))).catch(() => []);
            } else {
                return [];
            }
        }).catch(() => []);
    }

    findByMass(mass: number): Promise<SingleStructure[]> {
        return Sleep.noSleepPromise();
    }

    async findByName(name: string): Promise<SingleStructure[]> {
        if (name === "") {
            return Sleep.noSleepPromise();
        }
        let queryId = await fetch(ENDPOINT_URI + '/filter/name', {
            method: 'POST',
            headers: {'apikey': this.apiKey},
            body: JSON.stringify({name: name})
        }).then(response => {
            if (response.status === 200) {
                return response.json().then(data => data.queryId).catch(() => -1);
            } else {
                return [];
            }
        }).catch(() => -1);
        if (queryId === -1) {
            return [];
        }
        return this.jsonListResult(queryId);
    }

    async findBySmiles(smiles: string): Promise<SingleStructure[]> {
        if (smiles === "") {
            return Sleep.noSleepPromise();
        }
        let queryId = await fetch(ENDPOINT_URI + 'filter/smiles', {
            method: 'POST',
            headers: {'apikey': this.apiKey},
            body: JSON.stringify({smiles: smiles})
        }).then(response => {
            if (response.status === 200) {
                return response.json().then(data => data.queryId).catch(() => -1);
            } else {
                return -1
            }
        });
        return this.jsonListResult(queryId);
    }

    private async jsonListResult(queryId: string): Promise<SingleStructure[]> {
        let results = await fetch(ENDPOINT_URI + 'filter/' + queryId + '/results?start=0&count=100', {
            method: 'GET',
            headers: {'apikey': this.apiKey}
        }).then(response => {
            if (response.status === 200) {
                return response.json().then(data => data.results).catch(() => []);
            } else {
                return [];
            }
        }).catch(() => []);
        return this.findByIdentifiers(results);
    }

    private static formulaReplace(value: string) {
        return value
            .replaceAll('_', '')
            .replaceAll('{', '')
            .replaceAll('}', '');
    }

}

export default ChemSpiderFinder;