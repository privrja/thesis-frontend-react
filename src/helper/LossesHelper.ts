import AtomParser from "../parser/AtomParser";
import DigitParser from "../parser/DigitParser";

class LossesHelper {

    static removeWaterFromFormula(formula: string): string {
        return LossesHelper.removeFromFormula(formula, true);
    }

    static remove2HFromFormula(formula: string): string {
        return LossesHelper.removeFromFormula(formula, false);
    }

    static removeFromFormula(formula: string, removeWater: boolean): string {
        let tmpFormula = formula;
        let map = new Map();
        let atomParser = new AtomParser();
        let digitParser = new DigitParser();
        while (formula !== '') {
            let atomResult = atomParser.parse(formula);
            if (!atomResult.isAccepted()) {
                return tmpFormula;
            }
            let digitResult = digitParser.parse(atomResult.getReminder());
            if (digitResult.isAccepted()) {
                if (map.has(atomResult.getResult())) {
                    return tmpFormula;
                } else {
                    map.set(atomResult.getResult(), digitResult.getResult());
                }
                formula = digitResult.getReminder();
            } else {
                if (map.has(atomResult.getResult())) {
                    return tmpFormula
                } else {
                    map.set(atomResult.getResult(), 1);
                }
                formula = atomResult.getReminder();
            }
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
        let atoms = map.get(atom) - count;
        if (atoms < 0) {
            atoms = 0;
        }
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
