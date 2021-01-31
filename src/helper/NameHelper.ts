

class NameHelper {

    static acronymFromName(name: string) {
        if (name.includes('DL-ISO')) {
            return 'Iso' + name.charAt(6).toUpperCase() + name.substr(7,2).toLowerCase();
        } else if (name.includes('N-')) {
            return name.charAt(2).toUpperCase() + name.substr(3, 2).toLowerCase();
        } else if (name.includes('DL-')) {
            return name.charAt(3).toUpperCase() + name.substr(4, 2).toLowerCase();
        } else if (name.includes('ISO')) {
            return 'Iso' + name.charAt(3).toUpperCase() + name.substr(4,2).toLowerCase();
        } else {
            return name.charAt(0).toUpperCase() + name.substr(1, 2).toLowerCase();
        }
    }

}

export default NameHelper;