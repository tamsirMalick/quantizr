import { Comp } from "./base/Comp";
import { Constants as C } from "../Constants";
import { Singletons } from "../Singletons";
import { PubSub } from "../PubSub";
import { Div } from "./Div";
import { Ul } from "./Ul";
import { Li } from "./Li";
import { Anchor } from "./Anchor";
import { ReactNode } from "react";

let S: Singletons;
PubSub.sub(C.PUBSUB_SingletonsReady, (ctx: Singletons) => {
    S = ctx;
});

export class TabPanel extends Comp {

    tabVisibility: { [key: string]: boolean } = {};

    constructor() {
        super(null);

        //todo-0: make tabVis a const var 
        let obj = {};
        obj["tabVis-main"] = true;
        obj["tabVis-search"] = false;
        obj["tabVis-timeline"] = false;

        this.mergeState(obj);
    }

    setTabVisibility = (tabName: string, visible: boolean) : void => {

        let obj = {};
        obj["tabVis-" + tabName] = visible;

        this.mergeState(obj);
    }

    compRender = (): ReactNode => {
        let state = this.getState();
        let mainDisplay = state["tabVis-main"] ? "inline" : "none";
        let searchDisplay = state["tabVis-search"] ? "inline" : "none";
        let timelineDisplay = state["tabVis-timeline"] ? "inline" : "none";

        if (searchDisplay == "none" && timelineDisplay == "none") {
            mainDisplay = "none";
        }

        //the row of buttons that ARE the tabs where you click to change tabs.
        let tabButtons = new Div(null, {
            className: "row tab-buttons-container"
        }, [
            new Ul(null, {
                className: "nav nav-tabs",
                style: { marginLeft: '15px' },
                id: "navTabs"
            },
                /* These 'li' (list item) elements hold the tab bar that goes across the top of every page */
                [new Li(null, {
                    className: "nav-item",
                    style: { display: mainDisplay }
                }, [
                    new Anchor("#mainTab", "Main", {
                        "data-toggle": "tab",
                        className: "nav-link"
                    })]
                ),
                new Li(null, {
                    className: "nav-item",
                    style: { display: searchDisplay }
                },
                    [new Anchor("#searchTab", "Search", {
                        "data-toggle": "tab",
                        className: "nav-link"
                    })]
                ),
                new Li(null, {
                    className: "nav-item",
                    style: { display: timelineDisplay }
                },
                    [new Anchor("#timelineTab", "Timeline", {
                        "data-toggle": "tab",
                        className: "nav-link"
                    })]
                ),

                    // This works perfectly, but isn't ready to deploy yet.
                    // new Li(null, {
                    //     className: "nav-item",
                    // },
                    //     [new Anchor("#graphTab", "Graph", {
                    //         "data-toggle": "tab",
                    //         className: "nav-link"
                    //     })]
                    // )
                ]
            )]
        );

        //Tab content below buttons
        let tabContent = new Div(null, {
            className: "row tab-content",
            // id: "mainScrollingArea",
            role: "main",
        }, [
            //MAIN TAB
            //--------
            new Div(null, {
                id: "mainTab",
                className: "tab-pane fade my-tab-pane"
            }, [
                new Div(null, {
                    id: "mainNodeContent",
                    //style: { 'marginTop': '.5rem' }
                }),
                new Div(null, {
                    id: "listView",
                    //className: "documentArea"
                })
            ]
            ),
            //SEARCH TAB
            //----------
            new Div(null, {
                id: "searchTab",
                className: "tab-pane fade my-tab-pane"
            }, [
                new Div("No Search Displaying", {
                    id: "searchResultsPanel",
                    className: "searchResultsPanel"
                })]
            ),
            //TIMELINE TAB
            //------------
            new Div(null, {
                id: "timelineTab",
                className: "tab-pane fade my-tab-pane"
            }, [
                new Div("No Timeline Displaying", {
                    id: "timelineResultsPanel",
                    className: "timelinePanel"
                })]
            ),

            // This works perfectly, but isn't ready to deploy yet.
            // //GRAPH TAB
            // //------------
            // new Div(null, {
            //     id: "graphTab",
            //     className: "tab-pane fade"
            // }, [
            //         new GraphPanel()
            //     ]
            // )
        ]
        );

        return new Div(null, this.attribs
            , [
                tabButtons, tabContent
            ]).compRender();
    }
}
