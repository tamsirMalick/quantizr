import axios from "axios";
import { AppState } from "../AppState";
import { Constants as C } from "../Constants";
import { DialogBase } from "../DialogBase";
import * as I from "../Interfaces";
import { PubSub } from "../PubSub";
import { Singletons } from "../Singletons";
import { Anchor } from "../widget/Anchor";
import { AudioPlayer } from "../widget/AudioPlayer";
import { CompIntf } from "../widget/base/CompIntf";
import { Button } from "../widget/Button";
import { ButtonBar } from "../widget/ButtonBar";
import { Div } from "../widget/Div";
import { Form } from "../widget/Form";
import { Img } from "../widget/Img";
import { Span } from "../widget/Span";
import { TextField } from "../widget/TextField";

let S: Singletons;
PubSub.sub(C.PUBSUB_SingletonsReady, (s: Singletons) => {
    S = s;
});

/**
 * NOTE: currently the AD-skip (Advertisement Skip) feature is a proof-of-concept (and it does functionally work!), but croud sourcing
 * the collection of the time-offsets of the begin/end array of commercial segments has not yet been implemented. Also I decided
 * creating technology to destroy podcast's ability to collect ad-revenue is counter-productive to the entire podcasting industry
 * which is an industry i love, and I won't want to be associated with such a hostile act against podcasters as trying to eliminate
 * their ads!! So the ad-skipping technology in here is disabled.
 *
 * https://www.w3.org/2010/05/video/mediaevents.html
 * See also: VideoPlayerDlg (which is very similar)
 */
export class AudioPlayerDlg extends DialogBase {

    player: HTMLAudioElement;
    audioPlayer: AudioPlayer;
    playButton: Button;

    startTimePending: number = null;

    /*
    If the 'adSegments' array variable below contains an array of start/stop times then during playback this player will seamlessly and autmatically
    jump over those time ranges in the audio during playing just like they didn't even exist, basically censoring out those time ranges.
    Currently we aren't using this at all, becasue it's not friendly to the podcasting industry!
    */
    private adSegments: I.AdSegment[] = null;
    private saveTimer: any = null;
    urlHash: string;

    timeLeftTextField: TextField;
    intervalTimer: any;

    /* chapters url is the "podcast:chapters" url from RSS feeds */
    constructor(private customTitle: string, private sourceUrl: string, private chaptersUrl: string, state: AppState) {
        super("Audio Player", null, false, state);

        this.urlHash = S.util.hashOfString(sourceUrl);
        this.startTimePending = localStorage[this.urlHash];
        this.intervalTimer = setInterval(() => {
            this.oneMinuteTimeslice();
        }, 60000);
    }

    preLoad(): Promise<void> {
        if (!this.chaptersUrl) return null;

        return new Promise<void>((resolve, reject) => {
            let url = S.util.getRemoteHost() + "/proxyGet?url=" + encodeURIComponent(this.chaptersUrl);

            axios.get(url, {})
                .then((response) => {
                    if (response.status === 200) {
                        this.mergeState({ chapters: response.data });
                    }
                    resolve();
                })
                .catch((error) => {
                    resolve();
                    console.log(error);
                });
        });
    }

    preUnmount(): any {
        if (this.intervalTimer) {
            clearInterval(this.intervalTimer);
            clearInterval(this.saveTimer);
        }
    }

    // This makes the sleep timer work "Stop After (mins.)"
    oneMinuteTimeslice = () => {
        if (this.timeLeftTextField.valueIntf.getValue()) {
            try {
                let timeVal = parseInt(this.timeLeftTextField.valueIntf.getValue());
                timeVal--;
                this.timeLeftTextField.valueIntf.setValue(timeVal <= 0 ? "" : "" + timeVal);
                if (timeVal <= 0 && !this.player.paused && !this.player.ended) {
                    this.playButtonFunction();
                }
            }
            catch (e) {
            }
        }
    }

    renderDlg(): CompIntf[] {
        let children = [
            new Form(null, [
                this.customTitle ? new Div(this.customTitle, { className: "dialogTitle" }) : null,
                this.audioPlayer = new AudioPlayer({
                    src: this.sourceUrl,
                    className: "audioPlayer",
                    onPause: () => { this.savePlayerInfo(this.player.src, this.player.currentTime); },
                    onTimeUpdate: () => { this.onTimeUpdate(); },
                    onCanPlay: () => { this.restoreStartTime(); },
                    controls: "controls",
                    autoPlay: "autoplay",
                    preload: "auto"
                }),
                new Div(null, { className: "timeRemainingEditField" }, [
                    this.timeLeftTextField = new TextField("Stop After (mins.)", false, null, null, null)
                ]),
                new ButtonBar([
                    // todo-0: this button text and state is jank. fix. Use internal state in play button.
                    this.playButton = new Button("Pause", this.playButtonFunction, null, "btn-primary"),
                    new Button("Close", this.destroyPlayer)
                ]),
                new ButtonBar([
                    new Button("< 30s", this.skipBack30Button),
                    new Button("30s >", this.skipForward30Button)
                ]),
                new ButtonBar([
                    new Button("1x", this.normalSpeedButton),
                    new Button("1.5x", this.speed15Button),
                    new Button("2x", this.speed2Button)
                ]),
                this.createChaptersDiv()
            ])
        ];

        this.audioPlayer.whenElm((elm: HTMLAudioElement) => {
            this.player = elm;
            // use a very long delay here, to be sure media player has had time to do what it needs to do.
            setTimeout(this.updatePlayButtonText, 3000);
        });

        return children;
    }

    createChaptersDiv = (): Div => {
        let div: Div = null;
        let state = this.getState();
        if (state.chapters) {
            div = new Div(null, { className: "rssChapterPanel" });

            for (let chapter of state.chapters.chapters) {
                let chapDiv = new Div();

                if (chapter.img) {
                    chapDiv.addChild(new Img(null, {
                        className: "rssChapterImage",
                        src: chapter.img
                    }));
                }

                chapDiv.addChild(new Span(chapter.title, {
                    className: "rssChapterTitle",
                    onClick: () => {
                        if (this.player) {
                            this.player.currentTime = chapter.startTime;
                        }
                    }
                }));

                if (chapter.url) {
                    chapDiv.addChild(new Anchor(chapter.url, "[ Link ]", {
                        className: "rssChapterLink",
                        target: "_blank"
                    }));
                }
                div.addChild(chapDiv);
            }
            return div;
        }
    }

    renderButtons(): CompIntf {
        return null;
    }

    cancel(): void {
        this.close();
        if (this.player) {
            this.player.pause();
            this.player.remove();
        }
    }

    updatePlayButtonText = (): void => {
        if (this.player) {
            this.playButton.setText(this.player.paused || this.player.ended ? "Play" : "Pause");
        }
    }

    playButtonFunction = (): void => {
        if (this.player) {
            if (this.player.paused || this.player.ended) {
                this.player.play();
                if (this.playButton) {
                    this.playButton.setText("Pause");
                }
            } else {
                this.player.pause();
                if (this.playButton) {
                    this.playButton.setText("Play");
                }
            }
        }
    }

    speed = (rate: number): void => {
        if (this.player) {
            this.player.playbackRate = rate;
        }
    }

    skip = (delta: number): void => {
        if (this.player) {
            this.player.currentTime += delta;
        }
    }

    speed2Button = (): void => {
        this.speed(2);
    }

    speed15Button = (): void => {
        this.speed(1.5);
    }

    normalSpeedButton = (): void => {
        this.speed(1.0);
    }

    skipBack30Button = (): void => {
        this.skip(-30);
    }

    skipForward30Button = (): void => {
        this.skip(30);
    }

    destroyPlayer = (): void => {
        if (this.player) {
            this.player.pause();
        }
        this.cancel();
    }

    restoreStartTime = () => {
        /* makes player always start wherever the user last was when they clicked "pause" */
        if (this.player && this.startTimePending) {
            this.player.currentTime = this.startTimePending;
            this.startTimePending = null;
        }
    }

    onTimeUpdate = (): void => {
        if (!this.saveTimer) {
            /* save time offset into browser local storage every 3 seconds */
            this.saveTimer = setInterval(this.saveTime, 3000);
        }

        this.restoreStartTime();

        if (this.adSegments) {
            for (let seg of this.adSegments) {
                /* endTime of -1 means the rest of the media should be considered ADs */
                if (this.player.currentTime >= seg.beginTime && //
                    (this.player.currentTime <= seg.endTime || seg.endTime < 0)) {

                    /* jump to end of audio if rest is an add, with logic of -3 to ensure we don't
                    go into a loop jumping to end over and over again */
                    if (seg.endTime < 0 && this.player.currentTime < this.player.duration - 3) {
                        /* jump to last to seconds of audio, i'll do this instead of pausing, in case
                         there are is more audio automatically about to play, we don't want to halt it all */
                        this.player.loop = false;
                        this.player.currentTime = this.player.duration - 2;
                    }
                    /* or else we are in a commercial segment so jump to one second past it */
                    else {
                        this.player.currentTime = seg.endTime + 1;
                    }
                    return;
                }
            }
        }
    }

    saveTime = (state: AppState): void => {
        if (this.player && !this.player.paused) {
            /* this safety check to be sure no hidden audio can still be playing should no longer be needed
            now that I have the close listener even on the dialog, but i'll leave this here anyway. Can't hurt. */
            if (!S.util.isElmVisible(this.player)) {
                this.player.pause();
            }

            this.savePlayerInfo(this.player.src, this.player.currentTime);
        }
    }

    savePlayerInfo = (url: string, timeOffset: number): void => {
        let urlHash = S.util.hashOfString(url);
        localStorage[urlHash] = timeOffset;
    }
}
