import IFinder from "./IFinder";
import SingleStructure from "./SingleStructure";
import Sleep from "../helper/Sleep";
import {ServerEnum} from "../enum/ServerEnum";
import ComputeHelper from "../helper/ComputeHelper";

const ENDPOINT_URI = "https://guarded-atoll-36331.herokuapp.com/https://www.npatlas.org/api/v1/";

interface Molecule {
    npaid: string;
    original_name: string;
    smiles: string;
    mol_formula: string;
}

const BASIC_SEARCH = 'compounds/basicSearch?';
const PARAMS = '&threshold=0&origin_type=all&rank=all&skip=0&limit=100';

class NPAtlasFinder implements IFinder {

    basicSearch(endpoint: string, method: string, oneResult: boolean = false): Promise<SingleStructure[]> {
        return fetch(endpoint, {method: method}).then(async response => {
            if (response.status === 200) {
                let json = await response.json().catch(() => []);
                if (oneResult) {
                    let mass = 0;
                    try {
                        mass = ComputeHelper.computeMass(ComputeHelper.removeUnnecessaryCharactersFromFormula(json.mol_formula ?? ''));
                    } catch (e) {
                    }
                    return [new SingleStructure(json.npaid, ServerEnum.NP_ATLAS, json.original_name, json.smiles, json.mol_formula, mass)];
                } else {
                    if (json.length > 0) {
                        return json.map((molecule: Molecule) => {
                            let mass = 0;
                            try {
                                mass = ComputeHelper.computeMass(ComputeHelper.removeUnnecessaryCharactersFromFormula(molecule.mol_formula ?? ''));
                            } catch (e) {
                            }
                            return new SingleStructure(molecule.npaid, ServerEnum.NP_ATLAS, molecule.original_name, molecule.smiles, molecule.mol_formula, mass);
                        });
                    }
                }
            }
            return [];
        }).catch(() => []);
    }

    findByFormula(formula: string): Promise<SingleStructure[]> {
        if (formula === '') {
            return Sleep.noSleepPromise();
        }
        return this.basicSearch(ENDPOINT_URI + BASIC_SEARCH + 'formula=' + formula + PARAMS, 'POST');
    }

    async findByIdentifier(id: string): Promise<SingleStructure[]> {
        if (id === '') {
            return Sleep.noSleepPromise();
        }
        return this.basicSearch(ENDPOINT_URI + 'compound/' + id, 'GET', true);
    }

    findByIdentifiers(ids: string[]): Promise<SingleStructure[]> {
        return Sleep.noSleepPromise();
    }

    findByMass(mass: number): Promise<SingleStructure[]> {
        if (mass === 0) {
            return Sleep.noSleepPromise();
        }
        return this.basicSearch(ENDPOINT_URI + 'compounds/massSearch?mass=' + mass + '&type=mol_weight&range=1000&unit=ppm&skip=0&limit=100', 'POST');
    }

    findByName(name: string): Promise<SingleStructure[]> {
        if (name === '') {
            return Sleep.noSleepPromise();
        }
        return this.basicSearch(ENDPOINT_URI + BASIC_SEARCH + 'name=' + name + PARAMS, 'POST');
    }

    findBySmiles(smiles: string): Promise<SingleStructure[]> {
        if (smiles === '') {
            return Sleep.noSleepPromise();
        }
        return this.basicSearch(ENDPOINT_URI + BASIC_SEARCH + 'smiles=' + smiles + '&method=sub' + PARAMS, 'POST');
    }

}

export default NPAtlasFinder;
