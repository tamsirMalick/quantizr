import { Comp } from "./base/Comp";
import { Constants } from "../Constants";
import { Singletons } from "../Singletons";
import { PubSub } from "../PubSub";
import { ReactNode } from "react";

let S: Singletons;
PubSub.sub(Constants.PUBSUB_SingletonsReady, (ctx: Singletons) => {
    S = ctx;
});

export class Form extends Comp {

    constructor(attribs: Object, initialChildren: Comp[] = null) {
        super(attribs);
        this.setChildren(initialChildren);
    }

    render = (p: any): ReactNode => {
        this.repairProps(p);
        return S.e('div', p, this.makeReactChildren());
    }
}
