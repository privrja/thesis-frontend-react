import Modification from "../structure/Modification";
import {SelectOption} from "../component/SelectInput";

class OptionsHelper {

    static modificationToOptions(modifications: Modification[], defaultOption?: SelectOption): SelectOption[] {
        return defaultOption ? [defaultOption].concat(this.getModifications(modifications)) : this.getModifications(modifications);
    }

    private static getModifications(modifications: Modification[]): SelectOption[] {
        return modifications.map(modification => new SelectOption(modification.id.toString(), modification.modificationName));
    }

}

export default OptionsHelper;
