import Inferno, { linkEvent } from 'inferno';
import Component from 'inferno-component';
import Overlay from './overlay/Overlay';
import Controls from './../controls/Controls';
import Seek from './../controls/seek/Seek';
import Play from './../controls/play/Play';
import Mute from './../controls/mute/Mute';
import Fullscreen from './../controls/fullscreen/Fullscreen';
import Time from './../controls/time/Time';
import copy from './../../assets/copy';
import throttle from 'lodash.throttle'

const EVENTS = [
    'onAbort',
    'onCanPlay',
    'onCanPlayThrough',
    'onDurationChange',
    'onEmptied',
    'onEncrypted',
    'onEnded',
    'onError',
    'onLoadedData',
    'onLoadedMetadata',
    'onLoadStart',
    'onPause',
    'onPlay',
    'onPlaying',
    'onProgress',
    'onRateChange',
    'onSeeked',
    'onSeeking',
    'onStalled',
    'onSuspend',
    'onTimeUpdate',
    'onVolumeChange',
    'onWaiting'
];

class Video extends Component {
    constructor(props) {
        super(props);

        // Set up all Inferno media events and call method
        // on props if provided.
        this.state = {
            ...props.playerConfig,
            networkState: 0,
            paused: !this.props.playerConfig.autoplay,
            muted: !!this.props.playerConfig.muted,
            volume: 1,
            error: false,
            loading: false,
        }
    }

    static get defaultProps () {
        return {
            copyKeys: copy
        }
    }

    /**
     * Creates a throttle update method.
     * @return {undefined}
     */
    componentWillMount() {
        this._updateStateFromVideo = throttle(this.updateStateFromVideo, 100)

        // load initial config into state
        // Set up all media events and call method
        // on props if provided.
        this.mediaEventProps = EVENTS.reduce((p, c) => {
            p[c] = (e) => {
                if (c in this.props && typeof this.props[c] === 'function') {
                    // A prop exists for this mediaEvent, call it.
                    this.props[c](e);
                }
                this._updateStateFromVideo();
            };
            return p;
        }, {});
    }

    componentDidMount() {
        // Listen to error of last source.
        this.state = {
            ...this.state,
            videoEl: this.videoEl,
        };
        this.videoEl.children[this.videoEl.children.length - 1]
            .addEventListener('error', this._updateStateFromVideo);
    }

    /**
     * Removes event listeners bound outside of React's synthetic events
     * @return {undefined}
     */
    componentWillUnmount() {
        // Remove event listener from video.
        this.videoEl.children[this.videoEl.children.length - 1]
            .removeEventListener('error', this._updateStateFromVideo);
        // Cancel the throttled function from being called once
        // the video has been unmounted.
        // https://github.com/mderrick/react-html5video/issues/35
        this._updateStateFromVideo.cancel();
    };


    /**
     * Toggles the video to play and pause.
     * @return {undefined}
     */
    togglePlay = () => {
        if (this.state.paused) {
            this.play();
        } else {
            this.pause();
        }
    };

    /**
     * Toggles the video to mute and unmute.
     * @return {undefined}
     */
    toggleMute = () => {
        if (this.state.muted) {
            this.unmute();
        } else {
            this.mute();
        }
    };

    /**
     * Loads video.
     * @return {undefined}
     */
    load = () => {
        this.videoEl.load();
    };

    /**
     * Sets the video to fullscreen.
     * @return {undefined}
     */
    fullscreen = () => {
        if (this.videoEl.requestFullscreen) {
            this.videoEl.requestFullscreen();
        } else if (this.videoEl.msRequestFullscreen) {
            this.videoEl.msRequestFullscreen();
        } else if (this.videoEl.mozRequestFullScreen) {
            this.videoEl.mozRequestFullScreen();
        } else if (this.videoEl.webkitRequestFullscreen) {
            this.videoEl.webkitRequestFullscreen();
        }
    };

    /**
     * Plays the video.
     * @return {undefined}
     */
    play = () => {
        this.videoEl.play();
    };

    /**
     * Pauses the video.
     * @return {undefined}
     */
    pause = () => {
        this.videoEl.pause();
    };

    /**
     * Unmutes video.
     * @return {undefined}
     */
    unmute = () => {
        this.videoEl.muted = false;
    };

    /**
     * Mutes the video.
     * @return {undefined}
     */
    mute = () => {
        this.videoEl.muted = true;
    };

    /**
     * Seeks the video timeline.
     * @param  {number} time The value in seconds to seek to
     * @param  {bool}   forceUpdate Forces a state update without waiting for
     *                              throttled event.
     * @return {undefined}
     */
    seek = (time, forceUpdate) => {
        this.videoEl.currentTime = time;
        // In some use cases, we wish not to wait for `onSeeked` or `onSeeking`
        // throttled event to update state so we force it. This is because
        // this method is often triggered when dragging a bar and can feel janky.
        // See https://github.com/mderrick/react-html5video/issues/43
        if (forceUpdate) {
            this.updateStateFromVideo();
        }
    };

    /**
     * Sets the video volume.
     * @param  {number} volume The volume level between 0 and 1.
     * @param  {bool}   forceUpdate Forces a state update without waiting for
     *                              throttled event.
     * @return {undefined}
     */
    setVolume = (volume, forceUpdate) => {
        this.videoEl.volume = volume;
        // In some use cases, we wish not to wait for `onVolumeChange`
        // throttled event to update state so we force it. This is because
        // this method is often triggered when dragging a bar and can feel janky.
        // See https://github.com/mderrick/react-html5video/issues/43
        if (forceUpdate) {
            this.updateStateFromVideo();
        }
    };
    /**
    * Sets a ref to the video element.
    * @param  {node} el The video element reference
    * @return {undefined}
    */
    setVideoRef = (el) => {
        this.videoEl = el;
    };

    /**
     * Sets the video playback rate.
     * @param  {number} rate The playback rate (default 1.0).
     * @return {undefined}
     */
    setPlaybackRate = (rate) => {
        this.videoEl.playbackRate = rate;
        this.updateStateFromVideo();
    };

    /**
     * Updates the Inferno component state from the DOM video properties.
     * This is where the magic happens.
     * @return {undefined}
     */
    updateStateFromVideo = () => {
        this.setState({
            // Standard video properties
            duration: this.videoEl.duration,
            currentTime: this.videoEl.currentTime,
            buffered: this.videoEl.buffered,
            paused: this.videoEl.paused,
            muted: this.videoEl.muted,
            volume: this.videoEl.volume,
            playbackRate: this.videoEl.playbackRate,
            readyState: this.videoEl.readyState,

            // Non-standard state computed from properties
            percentageBuffered: this.videoEl.buffered.length && this.videoEl.buffered.end(this.videoEl.buffered.length - 1) / this.videoEl.duration * 100,
            percentagePlayed: this.videoEl.currentTime / this.videoEl.duration * 100,
            error: this.videoEl.networkState === this.videoEl.NETWORK_NO_SOURCE,
            loading: this.videoEl.readyState < this.videoEl.HAVE_ENOUGH_DATA
        })
    };

    /**
     * Returns everything but 'source' nodes from children
     * and extends props so all children have access to Video API and state.
     * If there are no controls provided, returns default Controls.
     * @return {Array.<InfernoElement>} An array of components.
     */
    renderControls = () => {
        const extendedProps = {
            ...this.state,
            togglePlay: this.togglePlay,
            toggleMute: this.toggleMute,
            play: this.play,
            pause: this.pause,
            mute: this.mute,
            unmute: this.unmute,
            seek: this.seek,
            fullscreen: this.fullscreen,
            setVolume: this.setVolume,
            setPlaybackRate: this.setPlaybackRate,
            copyKeys: this.props.copyKeys
        };

        let controls = this.props.children.filter(child => child.type !== 'source').map( (child) => {
            return Inferno.cloneVNode(child, extendedProps);
        });

        if (controls.length) {
        } else {
            controls = (
                <div>
                    <Overlay {...extendedProps} />
                    <Controls {...extendedProps} />
                </div>
            );
        }
        return controls;
    };

    /**
     * Gets the video class name based on its state
     * @return {string} Class string
     */
    getVideoClassName = () => {
        const {className} = this.props;
        let classString = 'video';

        if (this.state.error) {
            classString += ' video--error';
        } else if (this.state.loading) {
            classString += ' video--loading';
        } else if (this.state.paused) {
            classString += ' video--paused';
        } else {
            classString += ' video--playing';
        }

        if (this.state.focused) {
            classString += ' video--focused';
        }
        if (className) {
            classString += ' ' + className;
        }
        return classString;
    };

     /**
     * Sets state to show focused class on video player.
     * @return {undefined}
     */
    onFocus = () => {
        this.setState({
            focused: true
        });
    };

    /**
     * Sets state to not be focused to remove class form video
     * player.
     * @return {undefined}
     */
    onBlur = () => {
        this.setState({
            focused: false
        });
    };


    render() {
        // If controls prop is provided remove it
        // and use our own controls.
        const {style, copyKeys } = this.props;
        // stub out state we don't want to pass into the <video /> element as props.
        const {
            videoEl,
            duration,
            currentTime,
            buffered,
            percentageBuffered,
            readyState,
            percentagePlayed,
            playbackRate,
            loading,
            focused,
            networkState,
            paused,
            controls, ...otherConfig } = this.state;
        const rendered_controls = controls ? this.renderControls() : '';
        const video_sources = this.props.children.filter( child => child.type === 'source' )
        return (
            <div className={this.getVideoClassName()}
                tabIndex="0"
                onFocus={this.onFocus}
                onBlur={this.onBlur}
                style={style}>
                <video
                    { ...otherConfig }
                    className="video__el"
                    ref={this.setVideoRef}
                    //  listen to every available Media event and
                    //  infer the Video state in that method from the Video properties.
                    { ...this.mediaEventProps }>
                    { video_sources }
                </video>
                { rendered_controls }
            </div>
        );
    };
}

export {Video as default, Controls, Seek, Play, Mute, Fullscreen, Time, Overlay};
