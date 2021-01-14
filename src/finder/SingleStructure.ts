
class SingleStructure {

    public identifier: string;
    public structureName: string;
    public smiles: string;
    public formula: string;
    public mass: number;

    constructor(identifier: string, structureName: string, smiles: string, formula: string, mass: number) {
        this.identifier = identifier;
        this.structureName = structureName;
        this.smiles = smiles;
        this.formula = formula;
        this.mass = mass;
    }
}

export default SingleStructure;
