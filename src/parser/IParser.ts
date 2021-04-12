export abstract class ParseResult {
    protected result: any;
    protected errorMessage: string | null = '';
    protected reminder: string | null = '';

    protected constructor(result: any, reminder: string | null, errorMessage: string | null) {
        this.result = result;
        this.reminder = reminder;
        this.errorMessage = errorMessage;
    }

    abstract isAccepted(): boolean;
    abstract getResult(): any;
    abstract getErrorMessage(): string;
    abstract getReminder(): string;
}

export class Reject extends ParseResult {

    constructor(errorMessage: string) {
        super(null, null, errorMessage);
    }

    getErrorMessage(): string {
        return this.errorMessage ?? '';
    }

    getReminder(): string {
        throw new Error('Call getReminder on Reject');
    }

    getResult(): any {
        throw new Error('Call getResult on Reject');
    }

    isAccepted(): boolean {
        return false;
    }

}

export class Accept extends ParseResult {

    constructor(result: any, reminder: string) {
        super(result, reminder, null);
    }

    getErrorMessage(): string {
        throw new Error('Call getErrorMessage on Acccept');
    }

    getReminder(): string {
        return this.reminder ?? '';
    }

    getResult(): any {
        return this.result;
    }

    isAccepted(): boolean {
        return true;
    }

}

interface IParser {
    parse(text: string): ParseResult;
    reject(): Reject;
}

export default IParser;
