package org.subnode.actpub;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.subnode.service.ActPubService;
import org.subnode.util.XString;

@Controller
@CrossOrigin
public class ActPubController {
	private static final Logger log = LoggerFactory.getLogger(ActPubController.class);

	@Autowired
	private ActPubService actPubService;

	// =====================================
	// WEBFINGER & ACTOR
	// =====================================

	@RequestMapping(value = ActPubConstants.PATH_WEBFINGER, method = RequestMethod.GET, produces = ActPubConstants.CONTENT_TYPE_JSON_JRD)
	public @ResponseBody Object webFinger(//
			@RequestParam(value = "resource", required = true) String resource) {
		Object ret = actPubService.generateWebFinger(resource);
		if (ret != null)
			return ret;
		return new ResponseEntity(HttpStatus.NOT_FOUND);
	}

	/* This is the ActivityPub 'Actor' URL */
	@RequestMapping(value = ActPubConstants.ACTOR_PATH
			+ "/{userName}", method = RequestMethod.GET, produces = ActPubConstants.CONTENT_TYPE_JSON_ACTIVITY)
	public @ResponseBody Object actor(@PathVariable(value = "userName", required = true) String userName) {
		Object ret = actPubService.generateActor(userName);
		if (ret != null)
			return ret;
		return new ResponseEntity(HttpStatus.NOT_FOUND);
	}

	// =====================================
	// INBOX
	// =====================================

	/* If no userName specified it's the system 'sharedInbox' */
	@RequestMapping(value = ActPubConstants.PATH_INBOX + "/{userName}", method = RequestMethod.POST, produces = ActPubConstants.CONTENT_TYPE_JSON_LD)
	public @ResponseBody Object inboxPost(@RequestBody APObj payload,
			@PathVariable(value = "userName", required = false) String userName) {
		log.debug("INBOX incoming payload: " + XString.prettyPrint(payload));
		actPubService.processInboxPost(payload);
		return new ResponseEntity(HttpStatus.OK);
	}

	// This was a temporary test
	// @RequestMapping(value = ActPubConstants.PATH_INBOX + "/{userName}", method = RequestMethod.GET, produces = ActPubConstants.CONTENT_TYPE_JSON_LD)
	// public @ResponseBody Object inboxGet(@PathVariable(value = "userName", required = false) String userName) {
	// 	// todo-0: implement
	// 	log.debug("inbox (get) returning empty result");
	// 	Object ret = actPubService.generateDummyOrderedCollection(userName, ActPubConstants.PATH_INBOX + "/" + userName);
	// 	if (ret != null)
	// 		return ret;
	// 	return new ResponseEntity(HttpStatus.OK);
	// }

	// =====================================
	// OUTBOX
	// =====================================

	@RequestMapping(value = ActPubConstants.PATH_OUTBOX + "/{userName}", method = RequestMethod.GET, produces = ActPubConstants.CONTENT_TYPE_JSON_ACTIVITY)
	public @ResponseBody Object outbox(@PathVariable(value = "userName", required = true) String userName,
			@RequestParam(value = "min_id", required = false) String minId,
			@RequestParam(value = "page", required = false) String page) {
		Object ret = null;
		if ("true".equals(page)) {
			ret = actPubService.generateOutboxPage(userName, minId);
		} else {
			ret = actPubService.generateOutbox(userName);
		}
		if (ret != null) {
			log.debug("Reply with Outbox: " + XString.prettyPrint(ret));
			return ret;
		}
		return new ResponseEntity(HttpStatus.OK);
	}

	// =====================================
	// FOLLOWERS
	// =====================================

	@RequestMapping(value = ActPubConstants.PATH_FOLLOWERS + "/{userName}", method = RequestMethod.GET, produces = ActPubConstants.CONTENT_TYPE_JSON_ACTIVITY)
	public @ResponseBody Object getFollowers(@PathVariable(value = "userName", required = false) String userName,
			@RequestParam(value = "min_id", required = false) String minId,
			@RequestParam(value = "page", required = false) String page) {
		Object ret = null;
		if ("true".equals(page)) {
			ret = actPubService.generateFollowersPage(userName, minId);
		} else {
			ret = actPubService.generateFollowers(userName);
		}
		if (ret != null) {
			log.debug("Reply with Outbox: " + XString.prettyPrint(ret));
			return ret;
		}
		return new ResponseEntity(HttpStatus.OK);
	}

	// This was a temporary test
	// @RequestMapping(value = ActPubConstants.PATH_FOLLOWERS + "/{userName}", method = RequestMethod.POST, produces = ActPubConstants.CONTENT_TYPE_JSON_LD)
	// public @ResponseBody Object postFollowers(@PathVariable(value = "userName", required = false) String userName) {
	// 	log.debug("followers (post) returning empty result");
	// 	Object ret = actPubService.generateDummyOrderedCollection(userName, ActPubConstants.PATH_FOLLOWERS + "/" + userName);
	// 	if (ret != null)
	// 		return ret;
	// 	return new ResponseEntity(HttpStatus.OK);
	// }

	// =====================================
	// FOLLOWING
	// =====================================

	@RequestMapping(value = ActPubConstants.PATH_FOLLOWING + "/{userName}", method = RequestMethod.GET, produces = ActPubConstants.CONTENT_TYPE_JSON_LD)
	public @ResponseBody Object getFollowing(@PathVariable(value = "userName", required = false) String userName) {
		log.debug("following (get) returning empty result");
		Object ret = actPubService.generateDummyOrderedCollection(userName, ActPubConstants.PATH_FOLLOWING + "/" + userName);
		if (ret != null)
			return ret;
		return new ResponseEntity(HttpStatus.OK);
	}

	// This was a temporary test
	// @RequestMapping(value = ActPubConstants.PATH_FOLLOWING + "/{userName}", method = RequestMethod.POST, produces = ActPubConstants.CONTENT_TYPE_JSON_LD)
	// public @ResponseBody Object postFollowing(@PathVariable(value = "userName", required = false) String userName) {
	// 	log.debug("following (post) returning empty result");
	// 	Object ret = actPubService.generateDummyOrderedCollection(userName, ActPubConstants.PATH_FOLLOWING + "/" + userName);
	// 	if (ret != null)
	// 		return ret;
	// 	return new ResponseEntity(HttpStatus.OK);
	// }

	// =====================================
	// OTHER...
	// =====================================

	// This was a temporary test
	// @RequestMapping(value = "/ap/user/{userName}", method = RequestMethod.GET, produces = ActPubConstants.CONTENT_TYPE_JSON_LD)
	// public @ResponseBody Object user(@PathVariable(value = "userName", required = false) String userName) {
	// 	return new ResponseEntity(HttpStatus.OK);
	// }

	// This was a temporary test
	// @RequestMapping(value = "/ap/note/{userName}", method = RequestMethod.GET, produces = ActPubConstants.CONTENT_TYPE_JSON_LD)
	// public @ResponseBody Object note(@PathVariable(value = "userName", required = false) String userName) {
	// 	return new ResponseEntity(HttpStatus.OK);
	// }

	// This was a temporary test
	// @RequestMapping(value = "/ap/create/{userName}", method = RequestMethod.GET, produces = ActPubConstants.CONTENT_TYPE_JSON_LD)
	// public @ResponseBody Object create(@PathVariable(value = "userName", required = false) String userName) {
	// 	return new ResponseEntity(HttpStatus.OK);
	// }
}
