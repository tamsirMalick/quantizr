import { AppState } from "../AppState";
import { Constants as C } from "../Constants";
import { NodeActionType } from "../enums/NodeActionType";
import * as J from "../JavaIntf";
import { PubSub } from "../PubSub";
import { Singletons } from "../Singletons";
import { Comp } from "../widget/base/Comp";
import { Button } from "../widget/Button";
import { ButtonBar } from "../widget/ButtonBar";
import { Checkbox } from "../widget/Checkbox";
import { Div } from "../widget/Div";
import { Heading } from "../widget/Heading";
import { Html } from "../widget/Html";
import { Img } from "../widget/Img";
import { TypeBase } from "./base/TypeBase";

let S: Singletons;
PubSub.sub(C.PUBSUB_SingletonsReady, (ctx: Singletons) => {
    S = ctx;
});

export class FriendTypeHandler extends TypeBase {
    constructor() {
        super(J.NodeType.FRIEND, "Friend", "fa-user", true);
    }

    allowAction(action: NodeActionType, node: J.NodeInfo, appState: AppState): boolean {
        switch (action) {
            case NodeActionType.delete:
            case NodeActionType.editNode:
                return true;
            default:
                return false;
        }
    }

    getEditLabelForProp(propName: string): string {
        if (propName === J.NodeProp.USER) {
            return "User Name";
        }
        return propName;
    }

    getAllowPropertyAdd(): boolean {
        return false;
    }

    getAllowContentEdit(): boolean {
        return false;
    }

    getCustomProperties(): string[] {
        return [J.NodeProp.USER];
    }

    allowPropertyEdit(propName: string, state: AppState): boolean {
        // USER_NODE_ID is generated and maintained by the server, and we can ignore it in the editor.
        return propName === J.NodeProp.USER;
    }

    ensureDefaultProperties(node: J.NodeInfo) {
        this.ensureStringPropExists(node, J.NodeProp.USER);
    }

    render(node: J.NodeInfo, rowStyling: boolean, state: AppState): Comp {
        let user: string = S.props.getNodePropVal(J.NodeProp.USER, node);

        let avatarVer: string = S.props.getClientPropVal("avatarVer", node);
        let userBio: string = S.props.getClientPropVal(J.NodeProp.USER_BIO, node);
        let userNodeId: string = S.props.getNodePropVal(J.NodeProp.USER_NODE_ID, node);

        let img: Img = null;
        let src: string = null;
        if (avatarVer) {
            src = S.render.getAvatarImgUrl(userNodeId, avatarVer);
        }

        // finally resort to looking for avatar url as a client property which will be how it's found for Foreign Federated users.
        if (!src) {
            src = S.props.getClientPropVal(J.NodeProp.ACT_PUB_USER_ICON_URL, node);
        }

        let actPubActorUrl = S.props.getClientPropVal(J.NodeProp.ACT_PUB_ACTOR_URL, node);
        let following = S.props.getNodePropVal(J.NodeProp.ACT_PUB_FOLLOWING, node);

        if (src) {
            img = new Img(null, {
                className: "friendImage",
                align: "left", // causes text to flow around
                src,
                onClick: actPubActorUrl ? () => {
                    window.open(actPubActorUrl, "_blank");
                } : null
            });
        }

        // todo-0: this is an ugly hack but the users can get the idea who this is from the URL (for now)
        if (!user) {
            user = actPubActorUrl;
        }

        return new Div(null, {
            // className: "marginLeft"
        }, [
            img,
            new Div(null, null, [
                new Heading(4, "User: " + (user || ""), {
                    className: "marginAll"
                }),
                new Html(userBio, {
                    className: "userBio"
                })]),
            new Div(null, null, [
                new ButtonBar([
                    new Checkbox("Following", null, {
                        setValue: (checked: boolean): void => {
                            this.setFollowing(node, state, checked);
                        },
                        getValue: (): boolean => {
                            return !!following;
                        }
                    }),
                    new Button("Show Feed", () => S.srch.feed("~" + J.NodeType.FRIEND_LIST, user), {
                        title: "Show the Feed of this user"
                    }),
                    new Button("Message", S.meta64.getNodeFunc(S.edit.cached_newSubNode, "S.edit.newSubNode", node.id), {
                        title: "Send Private Message"
                    })
                ], null, "float-right marginBottom"),
                new Div(null, { className: "clearfix" })])
        ]);
    }

    setFollowing = (node: J.NodeInfo, state: AppState, following: boolean) => {
        S.props.setNodePropVal(J.NodeProp.ACT_PUB_FOLLOWING, node, following ? "true" : null);

        S.util.ajax<J.SaveNodeRequest, J.SaveNodeResponse>("saveNode", {
            updateModTime: true,
            node
        }, (res) => {
            // todo-0: we should just update the 'node' property here to be the 'following' instead of requerying the server
            // this is a very simple fix to do that. For now this lazy approach refreshes the whole page. ugh.
            S.meta64.refresh(state);
        });
    }
}
