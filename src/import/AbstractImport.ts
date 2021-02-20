import {ENDPOINT, TOKEN} from "../constant/ApiConstants";
import ReferenceParser, {Reference} from "../parser/ReferenceParser";
import {ServerEnum, ServerEnumHelper} from "../enum/ServerEnum";
import ContainerHelper from "../helper/ContainerHelper";

abstract class AbstractImport {

    protected text: string;
    protected errorStack: string[] = [];
    protected okStack: any[] = [];

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
        let rows = this.text.split('\n');
        for (let i = 0; i < rows.length; ++i) {
            if (rows[i] === '') {
                continue;
            }
            let parts = rows[i].split('\t');
            if (parts.length !== this.getLineLength()) {
                console.log(rows[i]);
                this.errorStack.push('ERROR: Bad number of items on line\t'.concat(rows[i]));
                continue;
            }
            this.transformation(parts);
        }
        await this.finder();
        return this.send();
    }

    async send(): Promise<any[]> {
        let token = localStorage.getItem(TOKEN);
        if (token) {
            return await fetch(ENDPOINT + 'container/' + ContainerHelper.getSelectedContainer() + this.getType() + '/import', {
                method: 'POST',
                headers: {'x-auth-token': token},
                body: JSON.stringify(this.okStack),
            }).then(async response => {
                if (response.status !== 200) {
                    this.errorStack = this.errorStack.concat(this.okStack.map((e: any) => 'Something Bad happen' + this.parseObject(e)));
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

}

export default AbstractImport;
