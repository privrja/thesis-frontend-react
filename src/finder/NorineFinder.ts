import IFinder from "./IFinder";
import SingleStructure from "./SingleStructure";
import Sleep from "../helper/Sleep";
import {ServerEnum} from "../enum/ServerEnum";

const ENDPOINT_URI = "https://bioinfo.cristal.univ-lille.fr/norine/rest/";

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

interface ListPeptides {
    peptides: Peptide[];
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
        return fetch(ENDPOINT_URI + 'name/json/' + name, {
            method: 'GET'
        }).then(async response => {return response.status === 200 ? this.jsonListResult(response): []});
    }

    /**
     * Not supported by Norine
     * Can be done with download all from Norine and then find in it
     * @param formula
     */
    findByFormula(formula: string): Promise<SingleStructure[]> {
        return Sleep.noSleepPromise();
    }

    /**
     * Not supported by Norine
     * Can be done with download all from Norine and then find in it
     * @param ids
     */
    findByIdentifiers(ids: []): Promise<SingleStructure[]> {
        return Sleep.noSleepPromise();
    }

    /**
     * Not supported by Norine
     * Can be done with download all from Norine and then find in it
     * @param smiles
     */
    findBySmiles(smiles: string): Promise<SingleStructure[]> {
        return Sleep.noSleepPromise();
    }

    /**
     * Not supported by Norine
     * Can be done with download all from Norine and then find in it
     * @param mass
     */
    findByMass(mass: number): Promise<SingleStructure[]> {
        return Sleep.noSleepPromise();
    }

    private async jsonListResult(response: Response): Promise<SingleStructure[]> {
        let json = await response.json() as ListPeptides;
        return json.peptides.map(e => new SingleStructure(
            e.general.id,
            ServerEnum.NORINE,
            e.general.name,
            e.structure.smiles,
            e.general.formula,
            e.general.mw
        ));
    }

}

export default NorineFinder;