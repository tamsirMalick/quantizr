package org.subnode.response;

import org.subnode.model.NodeInfo;

public class FeedPushInfo extends ServerPushInfo {

	private NodeInfo nodeInfo;

	//WARNING: parameterless constructor required for marshalling.
	public FeedPushInfo() {
	}

	public FeedPushInfo(NodeInfo nodeInfo) {
		super("feedPush", null);
		this.nodeInfo = nodeInfo;
	}

	public NodeInfo getNodeInfo() {
		return nodeInfo;
	}

	public void setNodeInfo(NodeInfo nodeInfo) {
		this.nodeInfo = nodeInfo;
	}
}
