import {ServerEnum} from "../enum/ServerEnum";

class SingleStructure {

    public identifier: string;
    public database: ServerEnum;
    public structureName: string;
    public smiles: string;
    public formula: string;
    public mass: number;

    constructor(identifier: string, database: ServerEnum, structureName: string, smiles: string, formula: string, mass: number) {
        this.identifier = identifier;
        this.database = database;
        this.structureName = structureName;
        this.smiles = smiles;
        this.formula = formula;
        this.mass = mass;
    }
}

export default SingleStructure;
