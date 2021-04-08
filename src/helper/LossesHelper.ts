import ComputeHelper from "./ComputeHelper";

class LossesHelper {

    static removeWaterFromFormula(formula: string): string {
        return LossesHelper.removeFromFormula(formula, true);
    }

    static remove2HFromFormula(formula: string): string {
        return LossesHelper.removeFromFormula(formula, false);
    }

    static removeFromFormula(formula: string, removeWater: boolean): string {
        let map;
        try {
            map = ComputeHelper.formulaMap(formula);
        } catch (e) {
            return formula;
        }
        LossesHelper.removeAtom('H', 2, map);
        if (removeWater) {
            LossesHelper.removeAtom('O', 1, map);
        }
        let formulaText = '';
        map.forEach((value: number, key: string) => {
            if (value !== 0) {
                formulaText += key + (value === 1 ? '' : value.toString());
            }
        });
        return formulaText;
    }

    private static removeAtom(atom: string, count: number, map: Map<any, any>) {
        let atoms = map.get(atom);
        if (isNaN(atoms)) {
            atoms = 0;
        }
        atoms -= count;
        map.set(atom, atoms);
    }

    public static removeFromMass(mass: number, removeWater: boolean) {
        if (removeWater) {
            return LossesHelper.removeWaterFromMass(mass);
        }
        return LossesHelper.remove2HFromMass(mass);
    }

    public static removeWaterFromMass(mass: number) {
        return mass - 15.9949146221 - (2 * 1.0078250321);
    }

    public static remove2HFromMass(mass: number) {
        return mass - (2 * 1.0078250321);
    }

}

export default LossesHelper;
