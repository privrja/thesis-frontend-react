import SingleStructure from "./SingleStructure";

interface IFinder {
    findByName(name: string): Promise<SingleStructure[]>;
    findBySmiles(smiles: string): Promise<SingleStructure[]>;
    findByMass(mass: number): Promise<SingleStructure[]>;
    findByFormula(formula: string): Promise<SingleStructure[]>;
    findByIdentifier(id: string): Promise<SingleStructure[]>;
    findByIdentifiers(ids: []): Promise<SingleStructure[]>;
}

export default IFinder;