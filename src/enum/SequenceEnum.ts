import {SelectOption} from "../component/SelectInput";

export enum SequenceEnum {
    LINEAR, CYCLIC, BRANCHED, BRANCH_CYCLIC, LINEAR_POLYKETIDE, CYCLIC_POLYKETIDE, OTHER
}

export class SequenceEnumHelper {

    static getOptions(): SelectOption[] {
        return [
            new SelectOption(SequenceEnum.LINEAR.toString(), this.getName(SequenceEnum.LINEAR)),
            new SelectOption(SequenceEnum.CYCLIC.toString(), this.getName(SequenceEnum.CYCLIC)),
            new SelectOption(SequenceEnum.BRANCHED.toString(), this.getName(SequenceEnum.BRANCHED)),
            new SelectOption(SequenceEnum.BRANCH_CYCLIC.toString(), this.getName(SequenceEnum.BRANCH_CYCLIC)),
            new SelectOption(SequenceEnum.LINEAR_POLYKETIDE.toString(), this.getName(SequenceEnum.LINEAR_POLYKETIDE)),
            new SelectOption(SequenceEnum.CYCLIC_POLYKETIDE.toString(), this.getName(SequenceEnum.CYCLIC_POLYKETIDE)),
            new SelectOption(SequenceEnum.OTHER.toString(), this.getName(SequenceEnum.OTHER)),
        ];
    }

    static getName(value: SequenceEnum) {
        switch (value) {
            case SequenceEnum.LINEAR:
                return 'linear';
            case SequenceEnum.CYCLIC:
                return 'cyclic';
            case SequenceEnum.BRANCHED:
                return 'branched';
            case SequenceEnum.BRANCH_CYCLIC:
                return 'branch-cyclic';
            case SequenceEnum.LINEAR_POLYKETIDE:
                return 'linear-polyketide';
            case SequenceEnum.CYCLIC_POLYKETIDE:
                return 'cyclic-polyketide';
            case SequenceEnum.OTHER:
            default:
                return 'other';
        }
    }

    static getValue(value: string) {
        switch(value) {
            case 'linear':
                return SequenceEnum.LINEAR;
            case 'cyclic':
                return SequenceEnum.CYCLIC;
            case 'branched':
                return SequenceEnum.BRANCHED;
            case 'branch-cyclic':
                return SequenceEnum.BRANCH_CYCLIC;
            case 'linear-polyketide':
                return SequenceEnum.LINEAR_POLYKETIDE;
            case 'cyclic-polyketide':
                return SequenceEnum.CYCLIC_POLYKETIDE;
            case 'other':
            default:
                return SequenceEnum.OTHER;
        }
    }

}
