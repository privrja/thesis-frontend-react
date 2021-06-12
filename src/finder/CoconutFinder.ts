import IFinder from "./IFinder";
import SingleStructure from "./SingleStructure";
import Sleep from "../helper/Sleep";
import {ServerEnum} from "../enum/ServerEnum";
import ComputeHelper from "../helper/ComputeHelper";

const ENDPOINT_URI = "https://guarded-atoll-36331.herokuapp.com/https://coconut.naturalproducts.net/api/search/";

interface Molecule {
    coconut_id: string;
    name: string;
    unique_smiles: string;
    molecular_formula: string;
}

class CoconutFinder implements IFinder {

    async simpleFind(parameter: string, query: string = 'simple?query=') {
        if (parameter === '') {
            return Sleep.noSleepPromise();
        }
        if (query.includes('simple?query')) {
            query += parameter;
        }
        return fetch(ENDPOINT_URI + query).then(async response => {
                if (response.status === 200) {
                    let json = await response.json().catch(() => []);
                    if (json === []) {
                        return [];
                    }
                    if (json.naturalProducts.length > 0) {
                        return json.naturalProducts.map((molecule: Molecule) => {
                            let mass = 0;
                            try {
                                mass = ComputeHelper.computeMass(ComputeHelper.removeUnnecessaryCharactersFromFormula(molecule.molecular_formula ?? ''));
                            } catch (e) {
                            }
                            return new SingleStructure(
                                molecule.coconut_id,
                                ServerEnum.COCONUT,
                                molecule.name,
                                molecule.unique_smiles,
                                molecule.molecular_formula,
                                mass
                            )
                        });
                    } else {
                        return [];
                    }
                } else {
                    return [];
                }
            }
        ).catch(() => []);
    }

    findByFormula(formula: string): Promise<SingleStructure[]> {
        return this.simpleFind(formula);
    }

    async findByIdentifier(id: string): Promise<SingleStructure[]> {
        if (id === '') {
            return Sleep.noSleepPromise();
        }
        return fetch(ENDPOINT_URI + 'simple?query=' + id).then(async response => {
            if (response.status === 200) {
                let json = await response.json().catch(() => []);
                if (json === []) {
                    return [];
                }
                if (json.naturalProducts.length > 0) {
                    return [new SingleStructure(
                        json.naturalProducts[0].coconut_id,
                        ServerEnum.COCONUT,
                        json.naturalProducts[0].name,
                        json.naturalProducts[0].unique_smiles,
                        json.naturalProducts[0].molecular_formula,
                        ComputeHelper.computeMass(json.naturalProducts[0].molecular_formula)
                    )];
                } else {
                    return [];
                }
            } else {
                return [];
            }
        }).catch(() => []);
    }

    findByIdentifiers(ids: string[]): Promise<SingleStructure[]> {
        return Sleep.noSleepPromise();
    }

    findByMass(mass: number): Promise<SingleStructure[]> {
        if (mass === 0) {
            return Sleep.noSleepPromise();
        }
        return this.simpleFind(mass.toString(), 'molweight?minMass=' + (mass - 1) + '&maxMass=' + (mass + 1) + '&maxHits=100');
    }

    findByName(name: string): Promise<SingleStructure[]> {
        return this.simpleFind(name);
    }

    findBySmiles(smiles: string): Promise<SingleStructure[]> {
        return this.simpleFind(smiles, 'exact-structure?type=inchi&smiles=' + smiles);
    }


}

export default CoconutFinder;
