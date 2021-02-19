import {ENDPOINT, SELECTED_CONTAINER, TOKEN} from "../constant/ApiConstants";
import {ERROR_LOGIN_NEEDED} from "../constant/FlashConstants";
import ReferenceParser, {Reference} from "../parser/ReferenceParser";

abstract class AbstractImport {

    protected text: string;
    protected errorStack: string[] = [];
    protected okStack: any[] = [];

    public constructor(text: string) {
        this.text = text;
        this.getSelectedContainer = this.getSelectedContainer.bind(this);
        this.send = this.send.bind(this);
        this.import = this.import.bind(this);
        this.getReference = this.getReference.bind(this);
        this.parseObject = this.parseObject.bind(this);
        this.getType = this.getType.bind(this);
        this.getLineLength = this.getLineLength.bind(this);
        this.transformation = this.transformation.bind(this);
    }

    getSelectedContainer(): number {
        let selectedContainer = localStorage.getItem(SELECTED_CONTAINER);
        if (!selectedContainer) {
            selectedContainer = '4';
            localStorage.setItem(SELECTED_CONTAINER, selectedContainer);
        }
        return parseInt(selectedContainer);
    }

    async import(): Promise<any[]> {
        this.errorStack = [];
        this.okStack = [];
        let rows = this.text.split('\n');
        for (let i = 0; i < rows.length; ++i) {
            let parts = rows[i].split('\t');
            if (parts.length !== this.getLineLength()) {
                this.errorStack.push(rows[i]);
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
            return await fetch(ENDPOINT + 'container/' + this.getSelectedContainer() + this.getType() + '/import', {
                method: 'POST',
                headers: {'x-auth-token': token},
                body: JSON.stringify(this.okStack),
            }).then(response => {
                if (response.status !== 200) {
                    this.errorStack = this.errorStack.concat(this.okStack);
                    return this.errorStack.length === 1 && this.errorStack[0] === '' ? [] : this.errorStack;
                } else {
                    response.json().then(data => this.errorStack = this.errorStack.concat(data.map((e: any) => this.parseObject(e))));
                    return this.errorStack.length === 1 && this.errorStack[0] === '' ? [] : this.errorStack;
                }
            });
        } else {
            throw new Error(ERROR_LOGIN_NEEDED);
        }
    }

    parseObject(obj: Object) {
        let data = '';
        for (let key in obj) {
            // @ts-ignore
            data += obj[key] + '\t';
        }
        return data;
    }

    protected getReference(text: string) {
        let refParser = new ReferenceParser();
        let refResult = refParser.parse(text);
        if (!refResult.isAccepted()) {
            return null;
        }
        return refResult.getResult() as Reference;
    }

    abstract getType(): string;

    abstract getLineLength(): number;

    abstract transformation(parts: string[]): void;

    protected abstract async finder(): Promise<boolean>;

}

export default AbstractImport;
