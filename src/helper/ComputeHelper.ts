import AtomParser from "../parser/AtomParser";
import DigitParser from "../parser/DigitParser";

const PERIODIC_TABLE = {
    "H": 1.0078250321,
    "D": 2.014102,
    "T": 3.016049,
    "He": 4.002606,
    "Li": 7.016004,
    "Be": 9.012182,
    "B": 11.009306,
    "b": 11.009306,
    "C": 12.0,
    "c": 12.0,
    "N": 14.0030740052,
    "n": 14.0030740052,
    "O": 15.9949146221,
    "o": 15.9949146221,
    "F": 18.998404,
    "f": 18.998404,
    "Ne": 19.992439,
    "Na": 22.989771,
    "Mg": 23.985043,
    "Al": 26.981539,
    "Si": 27.976927,
    "P": 30.97376151,
    "p": 30.97376151,
    "S": 31.97207069,
    "s": 31.97207069,
    "Cl": 34.968853,
    "Ar": 39.962383,
    "K": 38.963707,
    "Ca": 39.962589,
    "Sc": 44.95592,
    "Ti": 47.947948,
    "V": 50.943962,
    "Cr": 51.940514,
    "Mn": 54.938049,
    "Fe": 55.93494,
    "Co": 58.933201,
    "Ni": 57.935349,
    "Cu": 62.9296,
    "Zn": 63.929146,
    "Ga": 68.925583,
    "Ge": 73.921181,
    "As": 74.921600,
    "Se": 79.916519,
    "Br": 78.918327,
    "Kr": 83.911507,
    "Rb": 84.911789,
    "Sr": 87.905617,
    "Y": 88.905846,
    "Zr": 89.904701,
    "Nb": 92.906403,
    "Mo": 97.905411,
    "Tc": 97.907219,
    "Ru": 101.904388,
    "Rh": 102.905502,
    "Pd": 105.903481,
    "Ag": 106.905090,
    "Cd": 113.903358,
    "In": 114.903877,
    "Sn": 119.902199,
    "Sb": 120.903824,
    "Te": 129.906219,
    "I": 126.904457,
    "i": 126.904457,
    "Xe": 131.904160,
    "Cs": 132.905441,
    "Ba": 137.905243,
    "La": 138.906342,
    "Ce": 139.905441,
    "Pr": 140.907593,
    "Nd": 141.907700,
    "Pm": 144.912750,
    "Sm": 151.919693,
    "Eu": 152.921204,
    "Gd": 157.924103,
    "Tb": 158.925293,
    "Dy": 163.929199,
    "Ho": 164.930298,
    "Er": 165.930298,
    "Tm": 168.934204,
    "Yb": 173.938904,
    "Lu": 174.940796,
    "Hf": 179.946503,
    "Ta": 180.947998,
    "W": 183.950897,
    "Re": 186.955597,
    "Os": 191.961502,
    "Ir": 192.962906,
    "Pt": 194.964798,
    "Au": 196.966507,
    "Hg": 201.970596,
    "Tl": 204.974396,
    "Pb": 207.976593,
    "Bi": 208.980392,
    "Po": 208.982422,
    "At": 209.987137,
    "Rn": 222.017563,
    "Fr": 209.996399,
    "Ra": 226.025406,
    "Ac": 227.027740,
    "Th": 232.038055,
    "Pa": 231.035904,
    "U": 238.050781,
    "Np": 237.048172,
    "Pu": 242.058746,
    "Am": 243.061371,
    "Cm": 247.070343,
    "Bk": 247.070297,
    "Cf": 251.079575,
    "Es": 252.082977,
    "Fm": 257.095093,
    "Md": 258.098419,
    "No": 259.101044,
    "Lr": 262.109802
};

class ComputeHelper {

    public static computeMass(formula: string) {
        let mass = 0;
        let map = this.formulaMap(formula);
        map.forEach((value: number, key: string) => {
            console.log(key, value);
            // @ts-ignore
            mass += PERIODIC_TABLE[key] * value;
        });
        return mass;
    }

    public static formulaMap(formula: string): Map<string, number> {
        let map = new Map();
        let atomParser = new AtomParser();
        let digitParser = new DigitParser();
        while (formula !== '') {
            let atomResult = atomParser.parse(formula);
            if (!atomResult.isAccepted()) {
                throw new Error('Invalid formula input');
            }
            let digitResult = digitParser.parse(atomResult.getReminder());
            if (digitResult.isAccepted()) {
                if (map.has(atomResult.getResult())) {
                    throw new Error('Invalid formula input');
                } else {
                    map.set(atomResult.getResult(), digitResult.getResult());
                }
                formula = digitResult.getReminder();
            } else {
                if (map.has(atomResult.getResult())) {
                    throw new Error('Invalid formula input');
                } else {
                    map.set(atomResult.getResult(), 1);
                }
                formula = atomResult.getReminder();
            }
        }
        return map;
    }


}

export default ComputeHelper;
