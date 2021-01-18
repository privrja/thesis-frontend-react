import IFinder from "./IFinder";
import SingleStructure from "./SingleStructure";
import Sleep from "../helper/Sleep";
import {ServerEnum} from "../enum/ServerEnum";

const ENDPOINT_URI = "https://data.rcsb.org/rest/v1/";

interface Program {
    comp_id: string;
    descriptor: string;
    program: string;
    program_version: string;
    type: string; // type of SMILES
}

interface PDBResponse {
    chem_comp: {
        id: string;
        formula: string;
        name: string;
    },
    rcsb_chem_comp_descriptor: {
        smiles: string;
        smilesstereo: string;
    },
    pdbx_chem_comp_descriptor: Program[];
}

class NorineFinder implements IFinder {

    findByIdentifier(id: string): Promise<SingleStructure[]> {
        return fetch(ENDPOINT_URI + 'core/chemcomp/' + id, {
                method: 'GET'
            }
        ).then(async response => {
            if (response.status === 200) {
                let json = await response.json() as PDBResponse;
                console.log(json);
                return [new SingleStructure(
                    json.chem_comp.id,
                    ServerEnum.NORINE,
                    json.chem_comp.name,
                    json.rcsb_chem_comp_descriptor.smiles,
                    json.chem_comp.formula.replace(/\s/g, ''),
                    0
                )];
            } else {
                return [];
            }
        });
    }

    findByName(name: string): Promise<SingleStructure[]> {
        return fetch(ENDPOINT_URI + 'name/json/' + name, {
            method: 'GET'
        }).then(async response => {
            return response.status === 200 ? this.jsonListResult(response) : []
        });
    }

    /**
     * Can be done with download all from Norine and then find in it
     * @param formula
     */
    findByFormula(formula: string): Promise<SingleStructure[]> {
        return Sleep.sleep(0).then(() => []);
    }

    /**
     * Not supported by Norine
     */
    findByIdentifiers(ids: []): Promise<SingleStructure[]> {
        return Sleep.sleep(0).then(() => []);
    }

    /**
     * Not supported by Norine
     * Can be done with download all from Norine and then find in it
     */
    findBySmiles(smiles: string): Promise<SingleStructure[]> {
        return Sleep.sleep(0).then(() => []);
    }

    /**
     * Not supported by Norine
     * Can be done with download all from Norine and then find in it
     * @param mass
     */
    findByMass(mass: number): Promise<SingleStructure[]> {
        return Sleep.sleep(0).then(() => []);
    }

    private async jsonListResult(response: Response): Promise<SingleStructure[]> {
        throw new Error();
    }

}

export default NorineFinder;