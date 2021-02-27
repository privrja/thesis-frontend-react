import AtomParser from "../parser/AtomParser";
import DigitParser from "../parser/DigitParser";

class LossesHelper {

    static removeWaterFromFormula(formula: string) {
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
        let hydrogens = map.get('H') - 2;
        if (hydrogens < 0) {
            hydrogens = 0;
        }
        map.set('H', hydrogens);
        let oxygen = map.get('O') - 1;
        if (oxygen < 0) {
            oxygen = 0;
        }
        map.set('O', oxygen);
        let formulaText = '';
        map.forEach((value: number, key: string) => {
           formulaText += key + value.toString();
        });
        return formulaText;
    }

    static removeWaterFromMass(mass: number) {
        return mass - 15.9949146221 - (2 * 1.0078250321);
    }

}

export default LossesHelper;
