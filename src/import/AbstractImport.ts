import {ENDPOINT, TOKEN} from "../constant/ApiConstants";
import {ERROR_LOGIN_NEEDED} from "../constant/FlashConstants";
import ReferenceParser, {Reference} from "../parser/ReferenceParser";

abstract class AbstractImport {

    protected text: string;
    protected containerId: number;
    protected errorStack: string[] = [];
    protected okStack: any[] = [];

    public constructor(text: string, containerId: number) {
        this.text = text;
        this.containerId = containerId;
    }

    async import():Promise<any[]> {
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
        console.log(this.okStack);
        await this.finder();
        console.log(this.okStack);
        return this.send();
    }

    async send(): Promise<any[]> {
        let token = localStorage.getItem(TOKEN);
        if (token) {
            console.log(this.okStack);
            console.log(JSON.stringify(this.okStack));
            return fetch(ENDPOINT + 'container/' + this.containerId + this.getType() + '/import', {
                method: 'POST',
                headers: {'x-auth-token': token},
                body: JSON.stringify(this.okStack),
            }).then(response => {
                if (response.status === 200) {
                    // TODO response -> can be partially OK
                    return this.errorStack;
                } else {
                    // TODO bad
                    return this.errorStack;
                }
            });
        } else {
            throw new Error(ERROR_LOGIN_NEEDED);
        }
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
