import {Mutex} from 'async-mutex';

const mutex = new Mutex();

class NameHelper {

    private counter = 0;
    private acronyms: string[] = [];

    public async acronymFromName(name: string) {
        let acronym = '';
        if (name.includes('DL-ISO')) {
            acronym = 'Iso' + name.charAt(6).toUpperCase() + name.substr(7, 2).toLowerCase();
        } else if (name.includes('N-')) {
            acronym = name.charAt(2).toUpperCase() + name.substr(3, 2).toLowerCase();
        } else if (name.includes('DL-')) {
            acronym = name.charAt(3).toUpperCase() + name.substr(4, 2).toLowerCase();
        } else if (name.includes('ISO')) {
            acronym = 'Iso' + name.charAt(3).toUpperCase() + name.substr(4, 2).toLowerCase();
        } else {
            acronym = name.charAt(0).toUpperCase() + name.substr(1, 2).toLowerCase();
        }
        return mutex.runExclusive(() => this.duplicate(acronym))
    }

    private duplicate(acronym: string): string {
        if (this.isDuplicate(acronym)) {
            acronym += ++this.counter;
        }
        this.acronyms.push(acronym);
        return acronym;
    }

    private isDuplicate(acronym: string): boolean {
        return this.acronyms.some(a => a === acronym);
    }

    static booleanValue(value: boolean) {
        return value ? 'Yes' : 'No';
    }

}

export default NameHelper;