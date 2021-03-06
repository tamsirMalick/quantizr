import * as I from "../Interfaces";
import { EditPrivsTableRow } from "./EditPrivsTableRow";
import { ListBox } from "./ListBox";

export class EditPrivsTable extends ListBox {

    constructor(public nodePrivsInfo: I.NodePrivilegesInfo, private removePrivilege: (principalNodeId: string, privilege: string) => void) {
        super(null);
    }

    preRender(): void {
        let children = [];

        if (this.nodePrivsInfo && this.nodePrivsInfo.aclEntries) {
            this.nodePrivsInfo.aclEntries.forEach(function(aclEntry) {
                children.push(new EditPrivsTableRow(aclEntry, this.removePrivilege));
            }, this);
        }
        this.setChildren(children);
    }
}
