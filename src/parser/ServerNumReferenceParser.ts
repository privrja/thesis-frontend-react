import IParser, {Accept, ParseResult, Reject} from "./IParser";
import ServerNumParser from "./ServerNumParser";
import NatParser from "./NatParser";
import {Reference} from "./ReferenceParser";
import ZeroParser from "./ZeroParser";

class ServerNumReferenceParser implements IParser {
    parse(text: string): ParseResult {
        console.log(text);
        let serverNumParser = new ServerNumParser();
        let serverResult = serverNumParser.parse(text);
        if (!serverResult.isAccepted()) {
            console.log(serverResult.getErrorMessage());
            return this.reject();
        }
        console.log(serverResult.getResult());
        let natParser = new NatParser();
        let result = natParser.parse(serverResult.getReminder());
        if (!result.isAccepted()) {
            let zeroParser = new ZeroParser();
            let zeroResult = zeroParser.parse(serverResult.getReminder());
            if (zeroResult.isAccepted()) {
                return new Accept(new Reference(null, null), zeroResult.getReminder());
            }
            return this.reject();
        }
        return new Accept(new Reference(serverResult.getResult(), result.getResult()), result.getReminder());
    }

    reject(): Reject {
        return new Reject('Not match CSID: number | CID: number');
    }

}

export default ServerNumReferenceParser;
