import {CHEMSPIDER_KEY, TOKEN} from "../constant/ApiConstants";
import ReferenceParser, {Reference} from "../parser/ReferenceParser";
import {ServerEnum, ServerEnumHelper} from "../enum/ServerEnum";
import ContainerHelper from "../helper/ContainerHelper";
import {ENDPOINT} from "../constant/Constants";
import PubChemFinder from "../finder/PubChemFinder";
import ChebiFinder from "../finder/ChebiFinder";
import ChemSpiderFinder from "../finder/ChemSpiderFinder";
import NorineFinder from "../finder/NorineFinder";
import FetchHelper from "../helper/FetchHelper";
import CoconutFinder from "../finder/CoconutFinder";
import NPAtlasFinder from "../finder/NPAtlasFinder";
import IFinder from "../finder/IFinder";

abstract class AbstractImport {

    protected text: string;
    protected errorStack: string[] = [];
    protected okStack: any[] = [];
    protected importedOk: number = 0;

    public constructor(text: string) {
        this.text = text;
        this.send = this.send.bind(this);
        this.import = this.import.bind(this);
        this.getReference = this.getReference.bind(this);
        this.parseObject = this.parseObject.bind(this);
        this.getType = this.getType.bind(this);
        this.getLineLength = this.getLineLength.bind(this);
        this.transformation = this.transformation.bind(this);
    }

    async import(): Promise<any[]> {
        this.errorStack = [];
        this.okStack = [];
        let lineSeparator = this.text.includes('\r\n') ? '\r\n' : '\n';
        let rows = this.text.split(lineSeparator);
        for (let row of rows) {
            if (row === '') {
                continue;
            }
            let parts = row.split('\t');
            if (parts.length !== this.getLineLength()) {
                this.errorStack.push('ERROR: Bad number of items on line\t'.concat(row));
                continue;
            }
            this.transformation(parts);
        }
        let errorStackBeforeLength = this.errorStack.length;
        await this.finder();
        let send = await this.send();
        this.importedOk = this.okStack.length - (this.errorStack.length - errorStackBeforeLength);
        return send;
    }

    async send(): Promise<any[]> {
        let token = localStorage.getItem(TOKEN);
        if (token) {
            return fetch(ENDPOINT + 'container/' + ContainerHelper.getSelectedContainer() + this.getType() + '/import', {
                method: 'POST',
                headers: {'x-auth-token': token},
                body: JSON.stringify(this.okStack),
            }).then(async response => {
                if (response.status !== 200) {
                    this.errorStack = this.errorStack.concat(this.okStack.map((e: any) => (response.status === 403 ? 'You don\'t have enough permissions' : 'Something Bad happen') + this.parseObject(e)));
                    return this.errorStack.length === 1 && this.errorStack[0] === '' ? [] : this.errorStack;
                } else {
                    await response.json().then(data => this.errorStack = this.errorStack.concat(data.map((e: any) => this.parseObject(e))));
                    return this.errorStack.length === 1 && this.errorStack[0] === '' ? [] : this.errorStack;
                }
            });
        } else {
            return this.errorStack.length === 1 && this.errorStack[0] === '' ? [] : this.errorStack;
        }
    }

    getImportedOk() {
        return this.importedOk;
    }

    parseObject(obj: Object) {
        let data = '';
        let source = ServerEnum.PUBCHEM;
        let identifier = '';
        let error = '';
        for (let key in obj) {
            if (key === 'source') {
                // @ts-ignore
                source = obj[key];
                continue;
            } else if (key === 'identifier') {
                // @ts-ignore
                identifier = obj[key];
                continue;
            } else if (key === 'error') {
                // @ts-ignore
                error = obj[key];
                continue;
            }
            // @ts-ignore
            data += obj[key] === null ? '' : obj[key] + '\t';
        }
        if (identifier) {
            data += ServerEnumHelper.getFullId(source, identifier);
        }
        return error + '\t' + data;
    }

    protected getReference(text: string) {
        let refParser = new ReferenceParser();
        let refResult = refParser.parse(text);
        if (!refResult.isAccepted()) {
            return null;
        }
        return refResult.getResult() as Reference;
    }

    find(key: string) {
        return this.okStack.find(e => e.identifier === key);
    }

    abstract getType(): string;

    abstract getLineLength(): number;

    abstract transformation(parts: string[]): void;

    protected async finder(): Promise<boolean> {
        return true;
    }

    protected async finders(identifiers: string[], chebiIds: string[], chemspiderIds: string[], norineIds: string[], coconutIds: string[], npatlasIds: string[]) {
        let apikey = localStorage.getItem(CHEMSPIDER_KEY);
        if (!apikey) {
            FetchHelper.initializeChemSpider();
            apikey = localStorage.getItem(CHEMSPIDER_KEY);
        }
        await this.finderAll(new PubChemFinder(), identifiers);
        await this.finderAll(new ChebiFinder(), chebiIds);
        await this.finderAll(new ChemSpiderFinder(apikey ?? ''), chemspiderIds);
        await this.finderAll(new NorineFinder(), norineIds);
        await this.forFinder(new CoconutFinder(), coconutIds);
        await this.forFinder(new NPAtlasFinder(), npatlasIds);
    }

    async finderAll(finder: IFinder, ids: string[]) {
        await finder.findByIdentifiers(ids).then(blocks => {
            blocks.forEach(block => {
                console.log(block);
                this.find(block.identifier).smiles = block.smiles;
            });
        });
    }

    async forFinder(finder: IFinder, ids: string[]) {
        for (const id of ids) {
            await finder.findByIdentifier(id).then(blocks => {
                blocks.forEach(block => {
                    this.find(block.identifier).smiles = block.smiles;
                });
            });
        }
    }

}

export default AbstractImport;
