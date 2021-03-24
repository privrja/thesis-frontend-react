import IFinder from "./IFinder";
import Sleep from "../helper/Sleep";
import SingleStructure from "./SingleStructure";
import {ServerEnum} from "../enum/ServerEnum";
import {ENDPOINT} from "../constant/Constants";

const ENDPOINT_URI = ENDPOINT + 'container/';

class MassSpecBlocksFinder implements IFinder {

    private readonly token: string|null = null;
    private readonly containerId: number;

    constructor(containerId: number, token?: string) {
        this.containerId = containerId;
        if (token) {
            this.token = token;
        }
    }

    findByFormula(formula: string): Promise<SingleStructure[]> {
        return this.prepare('formula', formula, {sequenceFormula: formula});
    }

    findByIdentifier(id: string): Promise<SingleStructure[]> {
        return this.prepare('identifier', id, {id: id});
    }

    findByIdentifiers(ids: string[]): Promise<SingleStructure[]> {
        return Sleep.noSleepPromise();
    }

    findByMass(mass: number): Promise<SingleStructure[]> {
        return Sleep.noSleepPromise();
    }

    findByName(name: string): Promise<SingleStructure[]> {
        return this.prepare('name', name, {sequenceName: name});
    }

    findBySmiles(smiles: any): Promise<SingleStructure[]> {
        return this.prepare('similarity', smiles, {smiles: smiles});
    }

    private fetchData(param: string, init: {}) {
        return fetch(ENDPOINT_URI + this.containerId + param, init).then(response => {
            if (response.status === 200) {
                return response.json().then(data => data.map((sequence: any) => new SingleStructure(
                    sequence.id,
                    ServerEnum.MASS_SPEC_BLOCKS,
                    sequence.sequenceName,
                    sequence.smiles,
                    sequence.formula,
                    Number(sequence.mass)
                ))).catch(() => []);
            } else {
                return [];
            }
        }).catch(() => []);
    }

    private prepare(paramName: string, paramValue: string, body: any) {
        if (paramValue === "") {
            return Sleep.noSleepPromise();
        }
        let init;
        if (this.token === null) {
            init = {
                method: 'POST',
                body: JSON.stringify(body)
            }
        } else {
            init = {
                method: 'POST',
                headers: {'x-auth-token': this.token},
                body: JSON.stringify(body)
            }
        }
        return this.fetchData('/' + paramName, init);
    }

}

export default MassSpecBlocksFinder;
