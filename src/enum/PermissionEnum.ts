import {SelectOption} from "../component/SelectInput";

export enum PermissionEnum {
    R, RW, RWA
}

export class PermissionEnumHelper {

    static getOptions(): SelectOption[] {
        return [
            new SelectOption(PermissionEnumHelper.getName(PermissionEnum.R), PermissionEnumHelper.getName(PermissionEnum.R)),
            new SelectOption(PermissionEnumHelper.getName(PermissionEnum.RW), PermissionEnumHelper.getName(PermissionEnum.RW)),
            new SelectOption(PermissionEnumHelper.getName(PermissionEnum.RWA), PermissionEnumHelper.getName(PermissionEnum.RWA)),
        ];
    }

    static getName(value: PermissionEnum) {
        switch (value) {
            default:
            case PermissionEnum.R:
                return 'R';
            case PermissionEnum.RW:
                return 'RW';
            case PermissionEnum.RWA:
                return 'RWA';
        }
    }

}

