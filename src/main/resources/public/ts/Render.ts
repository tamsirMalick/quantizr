import * as J from "./JavaIntf";
import { Comp } from "./widget/base/Comp";
import { Button } from "./widget/Button";
import { ButtonBar } from "./widget/ButtonBar";
import { Img } from "./widget/Img";
import { Constants as C } from "./Constants";
import { RenderIntf } from "./intf/RenderIntf";
import { Singletons } from "./Singletons";
import { PubSub } from "./PubSub";
import * as marked from 'marked';
import * as highlightjs from 'highlightjs';
import { TypeHandlerIntf } from "./intf/TypeHandlerIntf";
import { NavBarIconButton } from "./widget/NavBarIconButton";
import { NodeCompVerticalRowLayout } from "./comps/NodeCompVerticalRowLayout";
import { NodeCompTableRowLayout } from "./comps/NodeCompTableRowLayout";
import { AppState } from "./AppState";
import { dispatch } from "./AppRedux";

let S: Singletons;
PubSub.sub(C.PUBSUB_SingletonsReady, (s: Singletons) => {
    S = s;
});

declare var MathJax;

export class Render implements RenderIntf {

    private debug: boolean = false;
    private markedRenderer = null;

    /* Since js is singlethreaded we can have lastOwner get updated from any other function and use it to keep track
    during the rendering, what the last owner was so we can keep from displaying the same avatars unnecessarily */
    public lastOwner: string;

    injectSubstitutions = (val: string): string => {
        val = S.util.replaceAll(val, "{{locationOrigin}}", window.location.origin);

        if (val.indexOf("{{paypal-button}}") != -1) {
            val = S.util.replaceAll(val, "{{paypal-button}}", C.PAY_PAL_BUTTON);
        }
        return val;
    }

    /**
     * See: https://github.com/highlightjs/highlight.js
     */
    initMarkdown = (): void => {
        if (this.markedRenderer) return;
        this.markedRenderer = new marked.Renderer();

        this.markedRenderer.code = (code, language) => {
            // Check whether the given language is valid for highlight.js.
            const validLang = !!(language && highlightjs.getLanguage(language));

            // Highlight only if the language is valid.
            const highlighted = validLang ? highlightjs.highlight(language, code).value : code;

            // Render the highlighted code with `hljs` class.
            return `<pre><code class="hljs ${language}">${highlighted}</code></pre>`;
        };

        marked.setOptions({
            renderer: this.markedRenderer,

            //This appears to be working just fine, but i don't have the CSS styles added into the distro yet
            //so none of the actual highlighting works yet, so i'm just commenting out for now, until i add classes.
            //
            //Note: using the 'markedRenderer.code' set above do we still need this highlight call here? I have no idea. Need to check/test
            highlight: function (code) {
                return highlightjs.highlightAuto(code).value;
            },

            gfm: true,
            tables: true,
            breaks: false,
            pedantic: false,
            sanitize: true,
            smartLists: true,
            smartypants: false
        });
    }

    setNodeDropHandler = (rowDiv: Comp, node: J.NodeInfo): void => {
        if (!node || !rowDiv) return;

        rowDiv.setDropHandler((evt: DragEvent) => {
            let data = evt.dataTransfer.items;

            //todo-1: right now we only actually support one file being dragged. Would be nice to support multiples
            for (let i = 0; i < data.length; i++) {
                let d = data[i];
                console.log("DROP[" + i + "] kind=" + d.kind + " type=" + d.type);

                if (d.kind == 'string' && d.type.match('^text/uri-list')) {
                    d.getAsString((s) => {
                        /* Disallow dropping from our app onto our app */
                        if (s.startsWith(location.protocol + '//' + location.hostname)) {
                            return;
                        }
                        S.attachment.openUploadFromUrlDlg(node, s);
                    });
                    return;
                }
                else if (d.kind == 'string' && d.type.match('^text/html')) {

                }
                else if (d.kind == 'file' /* && d.type.match('^image/') */) {
                    let file: File = data[i].getAsFile();

                    // if (file.size > Constants.MAX_UPLOAD_MB * Constants.ONE_MB) {
                    //     S.util.showMessage("That file is too large to upload. Max file size is "+Constants.MAX_UPLOAD_MB+" MB");
                    //     return;
                    // }

                    S.attachment.openUploadFromFileDlg(false, node, file);
                    return;
                }
            }
        });
    }

    showNodeUrl = (): void => {
        let node: J.NodeInfo = S.meta64.getHighlightedNode();
        if (!node) {
            S.util.showMessage("You must first click on a node.");
            return;
        }

        S.meta64.selectTab("mainTab");
        let message: string = "ID-based URL: \n" + window.location.origin + "?id=" + node.id;
        if (node.name) {
            message += "\n\nName-based URL: \n" + window.location.origin + "?n=" + node.name;
        }

        S.util.showMessage(message, true);
    }

    allowAction = (typeHandler: TypeHandlerIntf, action: string): boolean => {
        return typeHandler == null || typeHandler.allowAction(action);
    }

    renderPageFromData = async (data?: J.RenderNodeResponse, scrollToTop?: boolean, targetNodeId?: string, clickTab: boolean = true): Promise<void> => {

        this.lastOwner = null;

        S.meta64.setOverlay(true);

        // this timeout forces the 'hidden' to be processed and hidden from view 
        const promise = new Promise<void>(async (resolve, reject) => {

            setTimeout(async () => {
                try {
                    //if No data was provided we use existing data.
                    if (!data) {
                        data = S.meta64.currentNodeData;
                    }
                    //Otherwise we are rendering new data and need to initialize some things
                    else {
                        S.meta64.setCurrentNodeData(data);
                        S.meta64.updateNodeMap(data.node);
                        S.meta64.selectedNodes = {};
                    }

                    //console.log("Setting lastNode="+data.node.id);
                    if (data && data.node) {
                        S.localDB.setVal(C.LOCALDB_LAST_PARENT_NODEID, data.node.id);
                        S.localDB.setVal(C.LOCALDB_LAST_CHILD_NODEID, targetNodeId);
                    }

                    S.nav.endReached = data && data.endReached;
                    let propCount: number = S.meta64.currentNodeData.node.properties ? S.meta64.currentNodeData.node.properties.length : 0;

                    if (this.debug) {
                        console.log("RENDER NODE: " + data.node.id + " propCount=" + propCount);
                    }

                    dispatch({
                        type: "Action_RenderPage",
                        update: (state: AppState): void => {
                            state.node = S.meta64.currentNodeData.node;
                            state.endReached = S.nav.endReached;
                        }
                    });

                    this.lastOwner = data.node.owner;
                }
                catch (err) {
                    console.error("render fail.");
                    resolve();
                    return;
                }

                //console.log("rendering output=: " + S.util.toJson(output));

                S.meta64.mainTabPanel.whenElm(async (elm: HTMLElement) => {
                    console.log("mainTabComp whenElm success");

                    try {
                        if (clickTab) {
                            S.meta64.selectTab("mainTab");
                        }

                        S.util.forEachElmBySel("a", (el, i) => {
                            el.setAttribute("target", "_blank");
                        });

                        if (MathJax && MathJax.typeset) {
                            //note: MathJax.typesetPromise(), also exists
                            MathJax.typeset();
                        }

                        if (S.meta64.pendingLocationHash) {
                            window.location.hash = S.meta64.pendingLocationHash;
                            //Note: the substring(1) trims the "#" character off.
                            await S.meta64.highlightRowById(S.meta64.pendingLocationHash.substring(1), true);
                            S.meta64.pendingLocationHash = null;
                        }
                        else if (targetNodeId) {
                            await S.meta64.highlightRowById(targetNodeId, true);
                        } //
                        else if (scrollToTop || !S.meta64.getHighlightedNode()) {
                            await S.view.scrollToTop();
                        } //
                        else {
                            await S.view.scrollToSelectedNode();
                        }
                    }
                    finally {
                        resolve();
                    }
                });

            }, 100);
        });

        promise.then(() => {
            S.meta64.setOverlay(false);
            S.meta64.recalcMetaState();
        });

        return promise;
    }

    renderChildren = (node: J.NodeInfo, level: number, allowNodeMove: boolean): Comp => {
        if (!node || !node.children) return null;

        /*
         * Number of rows that have actually made it onto the page to far. Note: some nodes get filtered out on
         * the client side for various reasons.
         */
        let layout = S.props.getNodePropVal(J.NodeProp.LAYOUT, node);
        if (!layout || layout == "v") {
            return new NodeCompVerticalRowLayout(node, level, allowNodeMove);
        }
        else if (layout.indexOf("c") == 0) {
            return new NodeCompTableRowLayout(node, level, layout, allowNodeMove);
        }
        else {
            //of no layout is valid, fall back on vertical.
            return new NodeCompVerticalRowLayout(node, level, allowNodeMove);
        }
    }

    updateHighlightNode = (node: J.NodeInfo, mstate: any) => {
        if (!node || !mstate || !mstate.highlightNode) {
            return;
        }

        let changed = false;
        if (mstate.highlightNode.id == node.id) {
            mstate.highlightNode = node;
            changed = true;

            if (S.meta64.currentNodeData && S.meta64.currentNodeData.node) {
                S.meta64.parentIdToFocusNodeMap[S.meta64.currentNodeData.node.id] = node;
            }
        }

        if (changed) {
            dispatch({
                type: "Action_SetMetaState",
                update: (state: AppState): void => {
                    state.mstate = mstate;
                }
            });
        }
    }

    /* This is the button bar displayed between all nodes to let nodes be inserted at specific locations 
    
    The insert will be below the node unless isFirst is true and then it will be at 0 (topmost)
    */
    createBetweenNodeButtonBar = (node: J.NodeInfo, isFirst: boolean, isLastOnPage: boolean, nodesToMove: string[], mstate: any): Comp => {

        let pasteInlineButton: Button = null;
        if (!S.meta64.isAnonUser && nodesToMove != null && (mstate.selNodeIsMine || mstate.homeNodeSelected)) {

            let target = null;
            if (S.nav.endReached) {
                target = "inline-end";
            }
            else if (isFirst) {
                target = "inline-above";
            }
            else {
                target = "inline";
            }

            pasteInlineButton = new Button("Paste Inline", () => { S.edit.pasteSelNodes(node, target, nodesToMove, mstate); }, {
                className: "highlightBorder"
            });
        }

        let newNodeButton = new NavBarIconButton("fa-plus", null, {
            "onClick": e => {
                S.edit.insertNode(node.id, "u", isFirst ? 0 : 1);
            },
            "title": "Insert new node here"
        }, null, null, "btn-sm");
        let buttonBar = new ButtonBar([pasteInlineButton, newNodeButton],
            null, "float-right " + (isFirst ? "marginTop" : ""));
        return buttonBar;
    }

    getAttachmentUrl = (urlPart: string, node: J.NodeInfo): string => {
        let filePart = S.props.getNodePropVal(J.NodeProp.BIN, node);

        if (!filePart) {
            filePart = S.props.getNodePropVal(J.NodeProp.IPFS_LINK, node);
            if (filePart) {
                return C.IPFS_GATEWAY + filePart;
            }
        }

        let ret = S.util.getRpcPath() + urlPart + "/" + filePart + "?nodeId=" + node.id;
        return ret;
    }

    getUrlForNodeAttachment = (node: J.NodeInfo): string => {
        if (node.dataUrl) {
            return node.dataUrl;
        }
        else {
            return this.getAttachmentUrl("bin", node);
        }
    }

    getStreamUrlForNodeAttachment = (node: J.NodeInfo): string => {
        return this.getAttachmentUrl("stream", node);
    }

    getAvatarImgUrl = (node: J.NodeInfo) => {
        if (!node.avatarVer) return null;
        return S.util.getRpcPath() + "bin/avatar" + "?nodeId=" + node.ownerId + "&v=" + node.avatarVer;
    }

    makeAvatarImage = (node: J.NodeInfo) => {
        let src: string = this.getAvatarImgUrl(node);
        if (!src) {
            return null;
        }

        //Note: we DO have the image width/height set on the node object (node.width, node.hight) but we don't need it for anything currently
        let img: Img = new Img({
            src: src,
            className: "avatarImage",
            title: "Click image to enlarge/reduce"
        });

        img.whenElm((elm: HTMLElement) => {
            elm.addEventListener("click", () => {
                if (elm.style.maxWidth == "100%") {
                    elm.style.maxWidth = "80px";
                }
                else {
                    elm.style.maxWidth = "100%";
                }
            });
        });

        return img;
    }

    allowPropertyToDisplay = (propName: string): boolean => {
        //if (S.meta64.isAdminUser) return true;
        if (propName.startsWith("sn:")) return false;

        let allow = !S.props.simpleModePropertyBlackList[propName];
        console.log("Allow Prop " + propName + " = " + allow);
        return allow;
    }

    /* Returns true of the logged in user and the type of node allow the property to be edited by the user */
    allowPropertyEdit = (node: J.NodeInfo, propName: string): boolean => {
        let typeHandler: TypeHandlerIntf = S.plugin.getTypeHandler(node.type);
        if (typeHandler) {
            return typeHandler.allowPropertyEdit(propName);
        }
        else {
            return this.allowPropertyToDisplay(propName);
        }
    }

    isReadOnlyProperty = (propName: string): boolean => {
        return S.props.readOnlyPropertyList[propName];
    }
}
