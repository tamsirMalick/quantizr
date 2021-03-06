package org.subnode.model.client;

import com.fasterxml.jackson.annotation.JsonValue;

public enum NodeProp {

    // Activity Pub Properties
    ACT_PUB_ID("ap:id", "s"), //
    ACT_PUB_OBJ_TYPE("ap:objType", "s"), //

    // Indicates when this node is sent it will be a DM (Private Message, Direct Message) to a user
    ACT_PUB_PRIVATE("ap:privateMessage", "s"), //

    ACT_PUB_OBJ_CONTENT("ap:objContent", "s"), //
    ACT_PUB_OBJ_INREPLYTO("ap:objInReplyTo", "s"), //
    ACT_PUB_OBJ_URL("ap:objUrl", "s"), //
    ACT_PUB_OBJ_ATTRIBUTED_TO("ap:objAttributedTo", "s"), //
    ACT_PUB_USER_ICON_URL("ap:userIcon", "s"), //
    ACT_PUB_ACTOR_ID("ap:actorId", "s"), //
    ACT_PUB_ACTOR_URL("ap:actorUrl", "s"), //
    ACT_PUB_ACTOR_INBOX("ap:actorInbox", "s"), //

    /* This will be 'true' on Friend-type nodes a user is following, and despite the name it is for both
    local AND foreign federated servers. Local users can be followed-unfollowed */
    ACT_PUB_FOLLOWING("ap:following", "s"), //

    /* This is the encrypted symetric key to the node data, that was encrypted using the private key of the owner of the node.
    When nodes are shared to other users the cleartext copy of this key is encrypted with the public key of the user it's being
    shared to so that user can use their private key to decrypt this key and gain access to the actual data. */
    ENC_KEY("sn:encKey", "s"),

    /*
     * this is the one entered by the admin which DEFINES the feed, and is not to be
     * overwritten ever by the code
     */
    RSS_FEED_SRC("sn:rssFeedSrc", "s"),

    USER_PREF_PUBLIC_KEY("sn:publicKey", "s"), //
    USER_PREF_EDIT_MODE("sn:editMode", "s"), //
    USER_PREF_SHOW_METADATA("sn:showMetaData", "s"), //
    USER_PREF_PASSWORD_RESET_AUTHCODE("sn:pwdResetAuth", "s"), //
    SIGNUP_PENDING("sn:signupPending", "s"), //

    EMAIL_CONTENT("sn:content", "s"), //
    EMAIL_RECIP("sn:recip", "s"), //
    EMAIL_SUBJECT("sn:subject", "s"), //

    /*
     * when a node id pointing to some other node, we set it's target id to the node
     * it points to. For now used only for inbox to point to nodes
     */
    TARGET_ID("sn:target_id", "s"), //

    /*
     * WARNING: Only the User Account Root nodes have this property of the actual
     * user name. All other nodes reference their OWNER as an OwnerId that points to
     * these nodes.
     */
    USER("sn:user", "s"), //
    USER_BIO("sn:userBio", "s"), //
    PWD_HASH("sn:pwdHash", "s"), //

    FILE_SYNC_LINK("fs:link", "s"), //

    // Goes on 'Friend' nodes, and is added automatically by server (not user)
    USER_NODE_ID("sn:userNodeId", "s"), //

    // this pre-existed when i created FS_FILENAME (may be unused?)
    FILENAME("sn:fileName", "s"), //
    NAME("sn:name", "s"), //

    // FS_FILE("fs:file"), //
    // FS_FOLDER("fs:folder"), //
    // FS_LUCENE("fs:lucene"), //

    IPFS_LINK("ipfs:link", "s"), //
    JSON_HASH("ipfs:json", "s"), //
    SAVE_TO_IPFS("sn:saveToIpfs", "s"), //
    IPFS_LINK_NAME("ipfs:linkName", "s"), //

    // This property indicates that it's data is sourced from IPFS files, and can come from another server
    IPFS_SOURCE("ipfs:source", "s"), //

    FS_LINK("fs:link", "s"), //

    /*
     * property used to indicate we should not query the IPFS network again for this
     * conten becasue we have already loaded it
     */
    IPFS_OK("ipfs:ok", "s"), //

    /*
     * mime type expressed as a file extension. Invented so we can set 'txt' v.s.
     * 'md' to turn off metadata rendering
     */
    MIME_EXT("sn:ext", "s"), //

    EMAIL("sn:email", "s"), //
    CODE("sn:code", "s"), //

    BIN_MIME("sn:mimeType", "s"), //
    BIN_FILENAME("sn:fileName", "s"), //
    BIN_SIZE("sn:size", "s"), //

    /*
     * if this is present it indicates we have a "data:" url stored here which means
     * we hava an image (for example) with data encoded inline, and this data url
     * will be stored as text in the 'attachment' of the node
     */
    BIN_DATA_URL("sn:dataUrl", "s"), //

    // This is for bash script names to whow up when browing on the tree
    FILE_NAME("sn:fileName", "s"),

    JSON_FILE_SEARCH_RESULT("sn:json", "s"), //
    NOWRAP("sn:nowrap", "s"),

    BIN_DATA("sn:jcrData", "s"),
    BIN("bin", "s"),

    IMG_WIDTH("sn:imgWidth", "s"), //
    IMG_HEIGHT("sn:imgHeight", "s"), //
    IMG_SIZE("sn:imgSize", "s"), //
    CHILDREN_IMG_SIZES("sn:childrenImgSizes", "s"), //

    BIN_TOTAL("sn:binTot", "s"), //
    LAST_LOGIN_TIME("sn:lastLogin", "s"), //
    LAST_INBOX_NOTIFY_TIME("sn:lastInboxNotify", "s"), //

    // NOTE: These crypto keys are ONLY used to make ActivityPub work. For the E2E Encryption capabilities of Quanta platform,
    // those are is unrelated to these keys, and those private keys never leave the browser.
    CRYPTO_KEY_PUBLIC("sn:cryptoKeyPublic", "s"), //
    CRYPTO_KEY_PRIVATE("sn:cryptoKeyPrivate", "s"), //

    // amount of bytes the user is ALLOWED to save.
    BIN_QUOTA("sn:binQuota", "s"), //

    INLINE_CHILDREN("inlineChildren", "s"), //
    PRIORITY("priority", "s"), //
    LAYOUT("layout", "s"), //
    ORDER_BY("orderBy", "s"),

    TYPE_LOCK("sn:typLoc", "s"), //
    DATE("date", "s"), //
    DURATION("duration", "s");

    @JsonValue
    private final String value;

    private final String type;

    private NodeProp(String value, String type) {
        this.value = value;
        this.type = type;
    }

    public String toString() {
        return value;
    }

    public String s() {
        return value;
    }

    public String getType() {
        return type;
    }
}