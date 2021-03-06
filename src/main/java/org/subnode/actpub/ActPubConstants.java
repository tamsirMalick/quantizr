package org.subnode.actpub;

public class ActPubConstants {
    public static final String PATH_WEBFINGER = "/.well-known/webfinger";
    public static final String PATH_INBOX = "/ap/inbox";
    public static final String PATH_OUTBOX = "/ap/outbox";
    public static final String PATH_FOLLOWERS = "/ap/followers";
    public static final String PATH_FOLLOWING = "/ap/following";

    public static final String CONTENT_TYPE_JSON_ACTIVITY = "application/activity+json; charset=utf-8";

	public static final String CONTENT_TYPE_JSON_LD = "application/ld+json; charset=utf-8";
    public static final String CONTENT_TYPE_JSON_JRD = "application/jrd+json; charset=utf-8";
    
    public static final String ACTOR_PATH = "/ap/u";

    public static final String CONTEXT_STREAMS = "https://www.w3.org/ns/activitystreams";
    public static final String CONTEXT_SECURITY = "https://w3id.org/security/v1";
}
