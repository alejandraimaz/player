/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(1);

document.addEventListener("DOMContentLoaded", function() {
    document.dispatchEvent(new CustomEvent('o.DOMContentLoaded'));
});


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*global require, module, window, document */



window.WebVRConfig = {
	BUFFER_SCALE: 0.5,
	CARDBOARD_UI_DISABLED: true,
};

const OThreeSixty = __webpack_require__(2);

function addScript (url) {
	const p = new Promise(function (resolve, reject) {
		const script = document.createElement('script');
		script.setAttribute('src', url);
		document.head.appendChild(script);
		script.onload = resolve;
		script.onerror = reject;
	});
	function promiseScript () {
		return p;
	};
	promiseScript.promise = p;
	return promiseScript;
}

let threePromise;
if (window.THREE) {
	if (window.THREE.REVISION !== '78') {
		throw Error('Wrong version of three present');
	}
	threePromise = Promise.resolve();
} else {
	threePromise = addScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r78/three.min.js').promise;
}

OThreeSixty.addScripts = function () {
	return Promise.all([
		addScript('https://cdn.rawgit.com/borismus/webvr-polyfill/v0.9.15/build/webvr-polyfill.js').promise,
		threePromise
	]);
}

const constructAll = function() {
	if (OThreeSixty.disableAutoInit) return;
	OThreeSixty.addScripts()
	.then(() => {
		[].slice.call(document.querySelectorAll('[data-o-component~="o-three-sixty"]')).forEach(function (el) {
			new OThreeSixty(el);
		});
	});

	document.removeEventListener('o.DOMContentLoaded', constructAll);
};
document.addEventListener('o.DOMContentLoaded', constructAll);

module.exports = OThreeSixty;


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * Initialises an o-three-sixty components inside the element passed as the first parameter
 *
 * @param {(HTMLElement|string)} [el=document.body] - Element where to search for the o-three-sixty component. You can pass an HTMLElement or a selector string
 * @returns {OThreeSixty} - A single OThreeSixty instance
 */

 /*
global document, HTMLElement, navigator
 */


const oVideo = __webpack_require__(3);
const ThreeSixtyMedia = __webpack_require__(14);

function OThreeSixty(rootEl, opts) {

	if (!rootEl) {
		rootEl = document.body;
	} else if (!(rootEl instanceof HTMLElement)) {
		rootEl = document.querySelector(rootEl);
	}
	if (rootEl.getAttribute('data-o-component') === 'o-three-sixty') {
		this.rootEl = rootEl;
	} else {
		this.rootEl = rootEl.querySelector('[data-o-component~="o-three-sixty"]') || rootEl;
	}
	if (rootEl.querySelector('canvas')) {
		throw Error('OThreeSixty already instantiated on element. Canvas already present.');
	}

	if (this.rootEl !== undefined) {
		this.init(opts);
	}
}

OThreeSixty.prototype.init = function init(opts = {}) {

	opts.fov = opts.fov || this.rootEl.dataset.oThreeSixtyFov || 90;
	opts.longOffset = opts.longOffset || this.rootEl.dataset.oThreeSixtyLong || 0;
	opts.reticule = opts.reticule || this.rootEl.dataset.oThreeSixtyReticule || '';
	if (opts.allowNativeMediaInterpretation === undefined) {
		opts.allowNativeMediaInterpretation = this.rootEl.dataset.oThreeSixtyNativeMediaInterpretation;
	}
	if (opts.allowNativeMediaInterpretation === undefined) {
		opts.allowNativeMediaInterpretation = true;
	}

	this.webglPromise = Promise.resolve()
	.then(() => {
		if ((this.rootEl.dataset.oVideoSource || '').toLowerCase() === 'brightcove') {

			// init o-video
			const oVideoWrapper = document.createElement('div');
			oVideoWrapper.dataset.oComponent='o-video';

			// Transfer o-video data
			Object.keys(this.rootEl.dataset).forEach(k => {
				if (k.indexOf('oVideo') === 0) {
					oVideoWrapper.dataset[k] = this.rootEl.dataset[k];
					delete this.rootEl.dataset[k];
				}
			});

			this.rootEl.appendChild(oVideoWrapper);
			opts.context = this.rootEl;
			return oVideo.init(opts)
			.then(oV => this.oVideo=oV)
			.then(() => {
				const media = this.rootEl.querySelector('video');
				if (!media) throw Error('No video element found');
				media.width = media.clientWidth;
				media.height = media.clientHeight;
			});
		}
	})
	.then(() => {

		// find media
		const media = this.rootEl.querySelector('video,img');

		if (!media) {
			throw Error('No Image or Video Element Loaded');
		}

		media.setAttribute('crossorigin', 'anonymous');

		// Ensure it has the dimension=360 for native support.
		const type = media.getAttribute('type') || '';
		if (type.indexOf('dimension=360;') === -1) {
			media.setAttribute('type', type + ';dimension=360;');
		}

		if (media.tagName === 'VIDEO') {
			media.setAttribute('webkit-playsinline', '')
		}

		this.media = media;

		if (opts.allowNativeMediaInterpretation && navigator.userAgent.match(/samsung.* mobile vr/ig)) {
			throw Error('360 Video handled natively');
		} else {

			// use it to instantiate new ThreeSixtyMedia
			this.threeSixtyMedia = new ThreeSixtyMedia(this.rootEl, this.media, opts);

			if (opts.reticule) {
				this.threeSixtyMedia.addReticule({
					image: opts.reticule
				});
			}

			return this.threeSixtyMedia;
		}

	});
}

OThreeSixty.prototype.addButton = function addButton(opts) {
	return this.webglPromise.then(() => this.threeSixtyMedia.addSpriteButton(opts));
}

OThreeSixty.prototype.destroy = function destroy() {
	if (!this.oVideo && this.media) {
		this.rootEl.parentNode.insertBefore(this.media, this.rootEl);
	}
	if (this.threeSixtyMedia) this.threeSixtyMedia.destroy();
	this.rootEl.parentNode.removeChild(this.rootEl);
	delete this.rootEl;
	delete this.media;
	delete this.threeSixtyMedia;
}

module.exports = OThreeSixty;


/***/ }),
/* 3 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__src_js_video_js__ = __webpack_require__(4);


const constructAll = () => {
	__WEBPACK_IMPORTED_MODULE_0__src_js_video_js__["a" /* default */].init();
	document.removeEventListener('o.DOMContentLoaded', constructAll);
};

document.addEventListener('o.DOMContentLoaded', constructAll);

/* harmony default export */ __webpack_exports__["default"] = (__WEBPACK_IMPORTED_MODULE_0__src_js_video_js__["a" /* default */]);


/***/ }),
/* 4 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__o_viewport_main_js__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__o_viewport_main_js___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__o_viewport_main_js__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__o_fetch_jsonp_main_js__ = __webpack_require__(8);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__helpers_get_rendition__ = __webpack_require__(9);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__ads__ = __webpack_require__(11);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__info__ = __webpack_require__(12);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__playlist__ = __webpack_require__(13);
/* global fetch */








function eventListener(video, ev) {

	// On some platforms (eg iOS), the Google advert library will use the main <video> element
	// used by o-video to also play a pre-roll advert; as the advert plays, this will trigger
	// the normal <video> event listeners.  Discard events that we can identify as coming
	// from the pre-roll rather than the main content.
	// To do this, check whether advertising is still enabled (it'll be disabled on any error),
	// and for the video ads load and completed flags.
	if (video.opts.advertising && video.videoAds && video.videoAds.adsLoaded && !video.videoAds.adsCompleted) {
		return;
	}

	// Dispatch progress event at around 25%, 50%, 75% and 100%
	if (ev.type === 'progress' && !shouldDispatch(video.getProgress())) {
		return;
	}

	fireEvent(ev.type, video, {
		progress: video.getProgress(),
		duration: video.getDuration(),
		textTrackMode: video.getTrackMode()
	});
}

function fireEvent(action, video, extraDetail = {}) {
	const event = new CustomEvent('oTracking.event', {
		detail: Object.assign({
			category: 'video',
			action,
			advertising: video.opts.advertising,
			contentId: video.opts.id,
		}, extraDetail),
		bubbles: true
	});
	document.body.dispatchEvent(event);
}

function shouldDispatch(progress) {

	const relevantProgressPoints = [8, 9, 10, 11, 12,
									23, 24, 25, 26, 27,
									48, 49, 50, 51, 52,
									73, 74, 75, 76, 77,
									100];

	return relevantProgressPoints.includes(progress);
}

function addEvents(video, events) {
	events.forEach(event => {
		video.videoEl.addEventListener(event, eventListener.bind(this, video));
	});
}

// use the image resizing service, if width supplied
function updatePosterUrl(posterImage, width) {
	let url = `https://www.ft.com/__origami/service/image/v2/images/raw/${encodeURIComponent(posterImage)}?source=o-video&quality=low`;
	if (width) {
		url += `&fit=scale-down&width=${width}`;
	}

	return url;
}

// converts data-o-video attributes to an options object
function getOptionsFromDataAttributes(attributes) {
	const opts = {};
	// Try to get config set declaratively on the element
	Array.prototype.forEach.call(attributes, (attr) => {
		if (attr.name.indexOf('data-o-video') === 0) {
			// Remove the prefix part of the data attribute name and hyphen-case to camelCase
			const key = attr.name.replace('data-o-video-', '').replace(/-([a-z])/g, (m, w) => {
				return w.toUpperCase();
			});

			try {
				// If it's a JSON, a boolean or a number, we want it stored like that, and not as a string

				// For legacy o-video embeds, we'll need to check for placeHolderInfo attributes
				// as they typically pass data in with single quotes, which won't parse:
				// data-o-video-placeholder-info="['title', 'description']"
				if (key === 'placeholderInfo') {
					opts[key] = JSON.parse(attr.value.replace(/\'/g, '"'));
				} else {
					opts[key] = JSON.parse(attr.value);
				}
			} catch (e) {
				opts[key] = attr.value;
			}
		}
	});
	return opts;
}

function unloadListener() {
	this.updateAmountWatched();
	fireEvent('watched', this, {
		amount: this.getAmountWatched(0),
		amountPercentage: this.getAmountWatchedPercentage(0)
	});
}

function visibilityListener(ev) {
	if (ev.detail.hidden) {
		this.updateAmountWatched();
	} else if (!this.videoEl.paused) {
		this.markPlayStart();
	}
}

const unloadEventName = ('onbeforeunload' in window) ? 'beforeunload' : 'unload';

const defaultOpts = {
	advertising: false,
	allProgress: false,
	autorender: true,
	classes: [],
	optimumwidth: null,
	placeholder: false,
	placeholderInfo: ['title'],
	placeholderHint: '',
	playsinline: false,
	showCaptions: true,
	data: null
};

class Video {
	constructor(el, opts) {
		this.containerEl = el;
		// amount of the video, in milliseconds, that has actually been 'watched'
		this.amountWatched = 0;
		// stores the timestamp of when the current play was started
		this.playStart;
		this.fireWatchedEvent = unloadListener.bind(this);
		this.visibilityListener = visibilityListener.bind(this);

		this.opts = Object.assign({}, defaultOpts, opts, getOptionsFromDataAttributes(this.containerEl.attributes));

		if (typeof this.opts.classes === 'string') {
			this.opts.classes = this.opts.classes.split(' ');
		}

		if (this.opts.classes.indexOf('o-video__video') === -1) {
			this.opts.classes.push('o-video__video');
		}

		this.targeting = {
			site: '/5887/ft.com',
			position: 'video',
			sizes: '592x333|400x225',
			videoId: this.opts.id
		};

		if (this.opts.advertising) {
			this.videoAds = new __WEBPACK_IMPORTED_MODULE_3__ads__["a" /* default */](this);
		}

		this.containerEl.setAttribute('data-o-video-js', '');

		if (this.opts.autorender === true) {
			this.init();
		}
	}

	getData() {
		const dataPromise = this.opts.data ?
			Promise.resolve(this.opts.data) :
			Object(__WEBPACK_IMPORTED_MODULE_1__o_fetch_jsonp_main_js__["a" /* default */])(`https://next-media-api.ft.com/v1/${this.opts.id}`)
				.then(response => {
					if (response.ok) {
						return response.json();
					} else {
						throw Error('Next Media API responded with a ' + response.status + ' (' + response.statusText + ') for id ' + this.opts.id);
					}
				});


		return dataPromise.then(data => {
			this.videoData = data;
			this.posterImage = data.mainImageUrl && updatePosterUrl(data.mainImageUrl, this.opts.optimumwidth);
			this.rendition = Object(__WEBPACK_IMPORTED_MODULE_2__helpers_get_rendition__["a" /* default */])(data.renditions, this.opts);
		});
	}

	renderVideo() {
		if (this.rendition) {
			if (this.opts.placeholder) {
				this.addPlaceholder();
			} else {
				this.addVideo();
			}
		}
	}

	init() {
		return (this.opts.advertising ? this.videoAds.loadAdsLibrary() : Promise.resolve())
			.catch(() => {
				// If ad doesn't load for some reason, load video as normal
				this.opts.advertising = false;
			})
			.then(() => this.getData())
			.then(() => this.renderVideo());
	}

	addVideo() {
		this.videoEl = document.createElement('video');
		this.videoEl.controls = true;
		this.videoEl.className = Array.isArray(this.opts.classes) ? this.opts.classes.join(' ') : this.opts.classes;
		this.containerEl.classList.add('o-video--player');

		if (this.opts.playsinline) {
			this.videoEl.setAttribute('playsinline', 'true');
			this.videoEl.setAttribute('webkit-playsinline', 'true');
		}

		// disable download button in Chrome 58+
		if (this.videoEl.controlsList) {
			this.videoEl.controlsList.add('nodownload');
		}

		this.updateVideo();

		if (this.placeholderEl && !this.opts.advertising) {
			this.videoEl.autoplay = this.videoEl.autostart = true;
		}

		this.containerEl.appendChild(this.videoEl);

		addEvents(this, ['playing', 'pause', 'ended', 'progress', 'seeked', 'error', 'stalled']);
		this.videoEl.addEventListener('playing', this.pauseOtherVideos.bind(this));
		this.videoEl.addEventListener('playing', this.markPlayStart.bind(this));
		this.videoEl.addEventListener('pause', this.updateAmountWatched.bind(this));
		this.videoEl.addEventListener('suspend', this.clearCurrentlyPlaying.bind(this));
		this.videoEl.addEventListener('ended', this.clearCurrentlyPlaying.bind(this));

		if (this.opts.advertising) {
			this.videoAds.setUpAds();
		}

		// send 'watched' event on page unload,
		window.addEventListener(unloadEventName, this.fireWatchedEvent);
		__WEBPACK_IMPORTED_MODULE_0__o_viewport_main_js___default.a.listenTo('visibility');
		// pause 'watching' the video if the tab is hidden
		window.addEventListener('oViewport.visibility', this.visibilityListener);
	}

	addCaptions() {
		if (this.opts.showCaptions === false) {
			return;
		}

		if (typeof this.videoData === 'undefined') {
			throw new Error('Please call `getData()` before calling `addCaptions()` directly.');
		}

		const existingTrackEl = this.videoEl.querySelector('track');
		if (existingTrackEl) {
			this.videoEl.removeChild(existingTrackEl);
		}

		if (this.videoData.captionsUrl) {
			// FIXME this is all hardcoded as English captions at the moment
			const trackEl = document.createElement('track');
			trackEl.setAttribute('label', 'English');
			trackEl.setAttribute('kind', 'captions');
			trackEl.setAttribute('srclang', 'en');
			trackEl.setAttribute('src', this.videoData.captionsUrl);
			trackEl.setAttribute('crossorigin', 'true');
			this.videoEl.setAttribute('crossorigin', 'true');
			this.videoEl.appendChild(trackEl);
		}
	}

	updateVideo() {
		if (this.posterImage) {
			this.videoEl.poster = this.posterImage;
		} else {
			this.videoEl.removeAttribute('poster');
		}

		this.videoEl.src = this.rendition && this.rendition.url;

		this.addCaptions();
	}

	addPlaceholder() {
		this.placeholderEl = document.createElement('div');
		this.placeholderEl.className = 'o-video__placeholder';

		this.placeholderImageEl = document.createElement('img');
		this.placeholderImageEl.className = 'o-video__placeholder-image';
		this.placeholderImageEl.setAttribute('role', 'presentation');
		this.placeholderImageEl.setAttribute('alt', '');

		this.placeholderEl.appendChild(this.placeholderImageEl);

		// info panel
		if (this.opts.placeholderInfo.length) {
			this.infoPanel = new __WEBPACK_IMPORTED_MODULE_4__info__["a" /* default */](this);
		}

		// play button
		const playButtonEl = document.createElement('button');
		playButtonEl.className = 'o-video__play-button';

		const playButtonTextEl = document.createElement('span');
		playButtonTextEl.className = 'o-video__play-button-text';
		playButtonTextEl.textContent = 'Play video';
		playButtonEl.appendChild(playButtonTextEl);

		const playButtonIconEl = document.createElement('span');
		playButtonIconEl.className = 'o-video__play-button-icon';
		playButtonIconEl.textContent = this.opts.placeholderHint;
		playButtonEl.appendChild(playButtonIconEl);

		this.placeholderEl.appendChild(playButtonEl);

		this.placeholderEl.addEventListener('click', this.play.bind(this));

		this.updatePlaceholder();

		this.containerEl.appendChild(this.placeholderEl);
	}

	play() {
		if (this.placeholderEl) {

			// Adds video soon so ads can start loading
			this.addVideo();
			this.videoEl.focus();

			this.containerEl.removeChild(this.placeholderEl);
			this.infoPanel && this.infoPanel.teardown();

			delete this.placeholderEl;
			delete this.placeholderImageEl;
		} else {
			this.videoEl.play();
		}
	}

	updatePlaceholder() {
		if (this.posterImage) {
			this.placeholderImageEl.src = this.posterImage;
		}

		this.infoPanel && this.infoPanel.update();
	}

	update(newOpts) {
		this.videoEl && this.videoEl.pause();
		this.clearCurrentlyPlaying();

		this.opts = Object.assign(this.opts, { data: null }, newOpts);

		if (!this.videoEl && !this.placeholderEl) {
			return this.init();
		}

		return this.getData().then(() => {
			if (this.placeholderEl) {
				this.updatePlaceholder();
			} else {
				this.updateVideo();
			}
		});
	}

	getProgress() {
		return this.videoEl.duration ? parseInt(100 * this.videoEl.currentTime / this.videoEl.duration, 10) : 0;
	}

	getDuration() {
		return this.videoEl.duration ? parseInt(this.videoEl.duration, 10) : 0;
	}

	getTrackMode() {
		return this.videoEl.textTracks && this.videoEl.textTracks[0] ? this.videoEl.textTracks[0].mode : undefined;
	}

	getAmountWatched(decimalPoints) {
		const secondsWatched = this.amountWatched / 1000;
		return decimalPoints !== undefined ? +(secondsWatched).toFixed(decimalPoints) : secondsWatched;
	}

	getAmountWatchedPercentage(decimalPoints) {
		const percentageWatched = this.videoEl && this.videoEl.duration ? (100 / this.videoEl.duration) * this.getAmountWatched() : 0;
		return decimalPoints !== undefined ? +(percentageWatched).toFixed(decimalPoints) : percentageWatched;
	}

	pauseOtherVideos() {
		if (this.currentlyPlayingVideo && this.currentlyPlayingVideo !== this.videoEl) {
			this.currentlyPlayingVideo.pause();
		}

		this.currentlyPlayingVideo = this.videoEl;
	}

	clearCurrentlyPlaying() {
		if (this.currentlyPlayingVideo !== this.videoEl) {
			this.currentlyPlayingVideo = null;
		}
	}

	markPlayStart () {
		this.playStart = Date.now();
	}

	updateAmountWatched () {
		if (this.playStart !== undefined) {
			this.amountWatched += Date.now() - this.playStart;
			this.playStart = undefined;
		}
	}

	resetAmountWatched () {
		this.amountWatched = 0;
	}

	destroy () {
		// remove listeners
		window.removeEventListener(unloadEventName, this.fireWatchedEvent);
		window.removeEventListener('oViewport.visibility', this.visibilityListener);
	}

	static init(rootEl, config) {
		const videos = [];
		if (!rootEl) {
			rootEl = document.body;
		} else if (typeof rootEl === 'string') {
			rootEl = document.querySelector(rootEl);
		}

		const videoEls = rootEl.querySelectorAll(':not([data-o-video-js])[data-o-component~="o-video"]');

		for (let i = 0; i < videoEls.length; i++) {
			videos.push(new Video(videoEls[i], config));
		}

		return videos;
	}
}

Video.Playlist = __WEBPACK_IMPORTED_MODULE_5__playlist__["a" /* default */];

/* harmony default export */ __webpack_exports__["a"] = (Video);


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

// let debug;
const utils = __webpack_require__(6);
const throttle = utils.throttle;
const debounce = utils.debounce;

const listeners = {};
const intervals = {
	resize: 100,
	orientation: 100,
	visibility: 100,
	scroll: 100
};

function setThrottleInterval(eventType, interval) {
	if (typeof arguments[0] === 'number') {
		setThrottleInterval('scroll', arguments[0]);
		setThrottleInterval('resize', arguments[1]);
		setThrottleInterval('orientation', arguments[2]);
		setThrottleInterval('visibility', arguments[3]);
	} else if (interval) {
		intervals[eventType] = interval;
	}
}

function listenToResize() {
	if (listeners.resize) {
		return;
	}
	const eventType = 'resize';
	const handler = debounce(function(ev) {
		utils.broadcast('resize', {
			viewport: utils.getSize(),
			originalEvent: ev
		});
	}, intervals.resize);


	window.addEventListener(eventType, handler);
	listeners.resize = {
		eventType: eventType,
		handler: handler
	};
}

function listenToOrientation() {

	if (listeners.orientation) {
		return;
	}

	const eventType = 'orientationchange';
	const handler = debounce(function(ev) {
		utils.broadcast('orientation', {
			viewport: utils.getSize(),
			orientation: utils.getOrientation(),
			originalEvent: ev
			
		});
	}, intervals.orientation);
	
	window.addEventListener(eventType, handler);
	listeners.orientation = {
		eventType: eventType,
		handler: handler
	};
}


function listenToVisibility() {

	if (listeners.visibility) {
		return;
	}

	const eventType = utils.detectVisiblityAPI().eventType;
	const handler = debounce(function(ev) {
		utils.broadcast('visibility', {
			hidden: utils.getVisibility(),
			originalEvent: ev
		});
	}, intervals.visibility);

	window.addEventListener(eventType, handler);

	listeners.visibility = {
		eventType: eventType,
		handler: handler
	};
}

function listenToScroll() {

	if (listeners.scroll) {
		return;
	}

	const eventType = 'scroll';
	const handler = throttle(function(ev) {
		const scrollPos = utils.getScrollPosition();
		utils.broadcast('scroll', {
			viewport: utils.getSize(),
			scrollHeight: scrollPos.height,
			scrollLeft: scrollPos.left,
			scrollTop: scrollPos.top,
			scrollWidth: scrollPos.width,
			originalEvent: ev
		});
	}, intervals.scroll);

	window.addEventListener(eventType, handler);
	listeners.scroll = {
		eventType: eventType,
		handler: handler
	};
}

function listenTo(eventType) {
	if (eventType === 'resize' || eventType === 'all') {
		listenToResize();
	}

	if (eventType === 'scroll' || eventType === 'all') {
		listenToScroll();
	}

	if (eventType === 'orientation' || eventType === 'all') {
		listenToOrientation();
	}

	if (eventType === 'visibility' || eventType === 'all') {
		listenToVisibility();
	}
}

function stopListeningTo(eventType) {
	if (eventType === 'all') {
		Object.keys(listeners).forEach(stopListeningTo);
	} else if (listeners[eventType]) {
		window.removeEventListener(listeners[eventType].eventType, listeners[eventType].handler);
		delete listeners[eventType];
	}
}

module.exports = {
	debug: function() {
		 debug = true;
		utils.debug();
	},
	listenTo: listenTo,
	stopListeningTo: stopListeningTo,
	setThrottleInterval: setThrottleInterval,
	getOrientation: utils.getOrientation,
	getSize: utils.getSize,
	getScrollPosition: utils.getScrollPosition,
	getVisibility: utils.getVisibility
};

var run = window.setInterval(function(){ console.log('VIEWPORT: ' +  ' Height: ' + utils.getSize().height +  ' Width: ' + utils.getSize().width + ' SCROLL POSITION: '+ ' height: ' + utils.getScrollPosition().height + ' width: ' + utils.getScrollPosition().width + ' left: ' +utils.getScrollPosition().left + ' top: ' + utils.getScrollPosition().top + ' Orientation: ' + utils.getOrientation()); }, 3000);

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

/* jshint devel: true */
const oUtils = __webpack_require__(7);

let debug;

function broadcast(eventType, data, target) {
	target = target || document.body;

	if (debug) {
		console.log('o-viewport', eventType, data);
	}

	target.dispatchEvent(new CustomEvent('oViewport.' + eventType, {
		detail: data,
		bubbles: true
	}));
}

function getHeight(ignoreScrollbars) {
	return ignoreScrollbars ? document.documentElement.clientHeight : Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
}

function getWidth(ignoreScrollbars) {
	return ignoreScrollbars ? document.documentElement.clientWidth : Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
}

function getSize(ignoreScrollbars) {
	return {
		height: module.exports.getHeight(ignoreScrollbars),
		width: module.exports.getWidth(ignoreScrollbars)
	};
}

function getScrollPosition() {
	const de = document.documentElement;
	const db = document.body;

	// adapted from https://developer.mozilla.org/en-US/docs/Web/API/Window/scrollY
	const isCSS1Compat = ((document.compatMode || '') === 'CSS1Compat');

	const ieX = isCSS1Compat ? de.scrollLeft : db.scrollLeft;
	const ieY = isCSS1Compat ? de.scrollTop : db.scrollTop;
	return {
		height: db.scrollHeight,
		width: db.scrollWidth,
		left: window.pageXOffset || window.scrollX || ieX,
		top: window.pageYOffset || window.scrollY || ieY
	};
}

function getOrientation() {
	const orientation = window.screen.orientation || window.screen.mozOrientation || window.screen.msOrientation || undefined;
	if (orientation) {
		return typeof orientation === 'string' ?
			orientation.split('-')[0] :
			orientation.type.split('-')[0];
	} else if (window.matchMedia) {
		return window.matchMedia('(orientation: portrait)').matches ? 'portrait' : 'landscape';
	} else {
		return getHeight() >= getWidth() ? 'portrait' : 'landscape';
	}
}

function detectVisiblityAPI() {
	let hiddenName;
	let eventType;
	if (typeof document.hidden !== 'undefined') {
		hiddenName = 'hidden';
		eventType = 'visibilitychange';
	} else if (typeof document.mozHidden !== 'undefined') {
		hiddenName = 'mozHidden';
		eventType = 'mozvisibilitychange';
	} else if (typeof document.msHidden !== 'undefined') {
		hiddenName = 'msHidden';
		eventType = 'msvisibilitychange';
	} else if (typeof document.webkitHidden !== 'undefined') {
		hiddenName = 'webkitHidden';
		eventType = 'webkitvisibilitychange';
	}

	return {
		hiddenName: hiddenName,
		eventType: eventType
	};
}

function getVisibility() {
	const hiddenName = detectVisiblityAPI().hiddenName;
	return document[hiddenName];
}

module.exports = {
	debug: function() {
		debug = true;
	},
	broadcast: broadcast,
	getWidth: getWidth,
	getHeight: getHeight,
	getSize: getSize,
	getScrollPosition: getScrollPosition,
	getVisibility: getVisibility,
	getOrientation: getOrientation,
	detectVisiblityAPI: detectVisiblityAPI,
	debounce: oUtils.debounce,
	throttle: oUtils.throttle
};


/***/ }),
/* 7 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "debounce", function() { return debounce; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "throttle", function() { return throttle; });
/**
*
* Debounces function so it is only called after n milliseconds
* without it not being called
*
* @example
* Utils.debounce(myFunction() {}, 100);
*
* @param {Function} func - Function to be debounced
* @param {number} wait - Time in miliseconds
*
* @returns {Function} - Debounced function
*/
function debounce(func, wait) {
	let timeout;
	return function() {
		const args = arguments;
		const later = () => {
			timeout = null;
			func.apply(this, args);
		};
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
	};
};

/**
*
* Throttle function so it is only called once every n milliseconds
*
* @example
* Utils.throttle(myFunction() {}, 100);
*
* @param {Function} func - Function to be throttled
* @param {number} wait - Time in miliseconds
*
* @returns {Function} - Throttled function
*/
function throttle(func, wait) {
	let timeout;
	return function() {
		if (timeout) {
			return;
		}
		const args = arguments;
		const later = () => {
			timeout = null;
			func.apply(this, args);
		};

		timeout = setTimeout(later, wait);
	};
};




/***/ }),
/* 8 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export jsonpFetch */
const jsonpCallbackNames = [];

const generateCallbackName = () => {
	const base = 'jsonpCallback';
	const callbackName = `${base}_${jsonpCallbackNames.length + 1}`;
	jsonpCallbackNames.push(callbackName);
	return callbackName;
};

const crossDomainFetch = (...args) => {
	const crossDomainFetch = ('withCredentials' in new XMLHttpRequest()) ? fetch : jsonpFetch;
	return crossDomainFetch(...args);
};

const jsonpFetch = (url, opts) => {
	const defaultOpts = {
		timeout: 2000
	};
	opts = opts || {};
	Object.keys(defaultOpts).forEach(defaultOptsKey => {
		if (!opts.hasOwnProperty(defaultOptsKey)) {
			opts[defaultOptsKey] = defaultOpts[defaultOptsKey];
		}
	});
	return new Promise((resolve, reject) => {
		const callbackName = generateCallbackName();
		let timeout;
		window.FT = window.FT || {};
		window.FT[callbackName] = response => {
			const status = response.status ? response.status : 200;
			resolve({
				ok: Math.floor(status / 100) === 2,
				status: status,
				json: () => Promise.resolve(response.body || response)
			});
			if (timeout) {
				clearTimeout(timeout);
			}
		};

		const scriptTag = document.createElement('script');
		scriptTag.defer = true;
		scriptTag.src = `${url}${url.indexOf('?') > -1 ? '&' : '?'}callback=FT.${callbackName}`;
		document.body.appendChild(scriptTag);

		timeout = setTimeout(() => {
			reject(new Error(`JSONP request to ${url} timed out`));
		}, opts.timeout);
	});
};

/* harmony default export */ __webpack_exports__["a"] = (crossDomainFetch);



/***/ }),
/* 9 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__supported_formats__ = __webpack_require__(10);


function getRendition(renditions, options) {
	// allow mocking of supported formats module
	const opts = options || {};
	const width = opts.optimumvideowidth;
	const formats = opts.supportedFormats || Object(__WEBPACK_IMPORTED_MODULE_0__supported_formats__["a" /* default */])();
	let appropriateRendition;
	// order smallest to largest
	const orderedRenditions = renditions
		.filter(rendition => {
			return formats.indexOf(rendition.codec.toLowerCase()) > -1;
		})
		.sort((renditionOne, renditionTwo) => {
			return renditionOne.pixelWidth - renditionTwo.pixelWidth;
		});

	// if no width supplied, get largest
	if (!width) {
		return orderedRenditions.pop();
	}
	// NOTE: rather use find...
	orderedRenditions.some(rendition => {
		if (rendition.pixelWidth >= width) {
			appropriateRendition = rendition;
			return true;
		}
		return false;
	});

	return appropriateRendition || orderedRenditions.pop();
};

/* harmony default export */ __webpack_exports__["a"] = (getRendition);


/***/ }),
/* 10 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
const formats = {
	mpeg4: [
		'video/mp4; codecs="mp4v.20.8"'
	],
	h264: [
		'video/mp4; codecs="avc1.42E01E"',
		'video/mp4; codecs="avc1.42E01E, mp4a.40.2"'
	],
	ogg: [
		'video/ogg; codecs="theora"'
	],
	webm: [
		'video/webm; codecs="vp8, vorbis"'
	]
};

function supportedFormats () {
	const testEl = document.createElement('video');
	const supported = [];

	try {
		Object.keys(formats).filter(format => {
			formats[format].some(type => testEl.canPlayType(type)) && supported.push(format);
		});
	} catch(e) { }

	return supported;
}

/* harmony default export */ __webpack_exports__["a"] = (supportedFormats);


/***/ }),
/* 11 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* global google */

let sdkScriptLoaded = false;

function createVideoOverlayElement() {
	const overlayEl = document.createElement('div');
	overlayEl.classList.add('o-video__overlay');
	return overlayEl;
}

class VideoAds {
	constructor(video) {
		this.video = video;

		// only when these three conditions are met will the video play
		this.adsLoaded = false;
		this.videoLoaded = false;
		this.loadingStateDisplayed = false;

		// record when the advert has completed
		this.adsCompleted = false;
	}

	
	loadAdsLibrary() {
		return new Promise((resolve, reject) => {
			let googleSdkScript = document.querySelector('[src="//imasdk.googleapis.com/js/sdkloader/ima3.js"]');

			if (!googleSdkScript) {
				googleSdkScript = document.createElement('script');
				googleSdkScript.setAttribute('type', 'text/javascript');
				googleSdkScript.setAttribute('src', `//imasdk.googleapis.com/js/sdkloader/ima3.js`);
				googleSdkScript.setAttribute('async', true);
				googleSdkScript.setAttribute('defer', true);
				document.getElementsByTagName("head")[0].appendChild(googleSdkScript);
			}

			if (sdkScriptLoaded || (window.google && window.google.ima)) {
				resolve();
			} else {
				googleSdkScript.addEventListener('load', () => {
					sdkScriptLoaded = true;
					resolve();
				});

				googleSdkScript.addEventListener('error', (e) => {
					this.reportError(e);
					reject(e);
				});
			}
		});
	}

	getVideoBrand() {
		if (!this.video.videoData || !this.video.videoData.brand || !this.video.videoData.brand.name) {
			return false;
		} else {
			return this.video.videoData.brand.name;
		}
	}

	setUpAds() {
		this.adContainerEl = document.createElement('div');
		this.video.containerEl.appendChild(this.adContainerEl);
		this.adDisplayContainer = new google.ima.AdDisplayContainer(this.adContainerEl, this.video.videoEl);

		// Create ads loader.
		this.adsLoader = new google.ima.AdsLoader(this.adDisplayContainer);

		// Sets up bindings for all Ad related handlers
		this.adsManagerLoadedHandler = this.adsManagerLoadedHandler.bind(this);
		this.adErrorHandler = this.adErrorHandler.bind(this);
		this.adEventHandler = this.adEventHandler.bind(this);
		this.contentPauseRequestHandler = this.contentPauseRequestHandler.bind(this);
		this.contentResumeRequestHandler = this.contentResumeRequestHandler.bind(this);
		this.getAdProgress = this.getAdProgress.bind(this);

		// Listen and respond to ads loaded and error events.
		this.adsLoader.addEventListener(
			google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
			this.adsManagerLoadedHandler,
			false);
		this.adsLoader.addEventListener(
			google.ima.AdErrorEvent.Type.AD_ERROR,
			this.adErrorHandler,
			false);

		this.requestAds();

		this.playAdEventHandler = this.playAdEventHandler.bind(this);
		if (this.video.opts.placeholder) {
			this.playAdEventHandler();
		} else {
			this.overlayEl = createVideoOverlayElement();
			this.video.containerEl.appendChild(this.overlayEl);
			this.overlayEl.addEventListener('click', this.playAdEventHandler);
		}
	}

	requestAds() {
		// Request video ads.
		const adsRequest = new google.ima.AdsRequest();

		let targeting = `pos=${this.video.targeting.position}&ttid=${this.video.targeting.videoId}`;
		const brand = this.getVideoBrand();
		if (brand) {
			targeting += `&brand=${brand}`;
		}

		let advertisingUrl = `http://pubads.g.doubleclick.net/gampad/ads?env=vp&gdfp_req=1&impl=s&output=xml_vast2&iu=${this.video.targeting.site}&sz=${this.video.targeting.sizes}&unviewed_position_start=1&scp=${encodeURIComponent(targeting)}`;

		adsRequest.adTagUrl = advertisingUrl;

		// Specify the linear and nonlinear slot sizes. This helps the SDK
		// select the correct creative if multiple are returned.
		adsRequest.linearAdSlotWidth = 592;
		adsRequest.linearAdSlotHeight = 333;

		adsRequest.nonLinearAdSlotWidth = 592;
		adsRequest.nonLinearAdSlotHeight = 150;

		// Temporary fix to verify DFP behaviour
		const options = {
			detail: {
				category: 'video',
				action: 'adRequested',
				contentId: this.video.opts.id
			},
			bubbles: true
		};
		const requestedEvent = new CustomEvent('oTracking.event', options);
		document.body.dispatchEvent(requestedEvent);

		this.adsLoader.requestAds(adsRequest);
	}

	adsManagerLoadedHandler(adsManagerLoadedEvent) {
		// Get the ads manager.
		const adsRenderingSettings = new google.ima.AdsRenderingSettings();
		adsRenderingSettings.restoreCustomPlaybackStateOnAdBreakComplete = true;
		this.adsManager = adsManagerLoadedEvent.getAdsManager(this.video.videoEl, adsRenderingSettings);

		// Add listeners to the required events.
		this.adsManager.addEventListener(google.ima.AdErrorEvent.Type.AD_ERROR, this.adErrorHandler);

		// "Fired when content should be paused. This usually happens right before an ad is about to cover the content"
		this.adsManager.addEventListener(google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED, this.contentPauseRequestHandler);

		// "Fired when content should be resumed. This usually happens when an ad finishes or collapses"
		this.adsManager.addEventListener(google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED, this.contentResumeRequestHandler);

		// "Fired when the ads manager is done playing all the ads"
		this.adsManager.addEventListener(google.ima.AdEvent.Type.ALL_ADS_COMPLETED, this.adEventHandler);

		// Listen to any additional events, if necessary.
		this.adsManager.addEventListener(google.ima.AdEvent.Type.LOADED, this.adEventHandler);
		this.adsManager.addEventListener(google.ima.AdEvent.Type.STARTED, this.adEventHandler);
		this.adsManager.addEventListener(google.ima.AdEvent.Type.COMPLETE, this.adEventHandler);
		this.adsManager.addEventListener(google.ima.AdEvent.Type.SKIPPED, this.adEventHandler);
		this.adsManager.addEventListener(google.ima.AdEvent.Type.SKIPPABLE_STATE_CHANGED, this.adEventHandler);

		this.adsLoaded = true;
		this.startAds();
	}

	startAds() {

		// For ads to play correctly both the video and the advert video need to be ready to
		// play; this function needs to be called after the two flags in adsManagerLoadedHandler()
		// and playAdEventHandler() have been set.
		// So if the video hasn't loaded yet, wait until it has.
		if (!this.videoLoaded) {
			return;
		}

		// We want to display an ad loading notice for a time on screen, we don't want it to flicker
		// and leave the user wondering if they missed something/think we're testing subliminal ads!
		if (!this.loadingStateDisplayed) {
			return;
		}

		// If ads have failed to load, which resets the advertising support flag, play the video
		// instead; otherwise, wait until the ads have loaded.
		if (!this.video.opts.advertising) {
			this.playUserVideo();
		} else if (!this.adsLoaded) {
			return;
		}

		// Remove the preloading spinner
		if (this.loadingStateEl) {
			this.loadingStateEl.parentNode.removeChild(this.loadingStateEl);
			this.loadingStateEl = null;
		}

		try {
			// Initialize the ads manager. Ad rules playlist will start at this time.
			this.adsManager.init(this.video.videoEl.clientWidth, this.video.videoEl.clientHeight, google.ima.ViewMode.NORMAL);
			// Call play to start showing the ad. Single video and overlay ads will
			// start at this time; the call will be ignored for ad rules.
			this.adsManager.start();
		} catch (adError) {
			// An error may be thrown if there was a problem with the VAST response.
			this.reportError(adError);
			this.playUserVideo();
		}
	}

	playAdEventHandler() {
		// Sets the styling now so the ad occupies the space of the video
		this.adContainerEl.classList.add('o-video__ad');

		// "Call this method as a direct result of a user action before starting the ad playback..."
		// <https://developers.google.com/interactive-media-ads/docs/sdks/html5/v3/apis#ima.AdDisplayContainer.initialize>
		this.adDisplayContainer.initialize();

		// We want to display a loading state - otherwise it can look
		// like we're not responding to their action when we're actually fetching an ad
		this.loadingStateEl = document.createElement('span');
		this.loadingStateEl.setAttribute('role', 'progressbar');
		this.loadingStateEl.setAttribute('aria-valuetext', 'Loading');
		this.loadingStateEl.className = 'o-video__loading-state';
		this.adContainerEl.appendChild(this.loadingStateEl);

		// display the loading state for a minimum of 2 seconds to avoid flickering
		setTimeout(() => {
			this.loadingStateDisplayed = true;
			this.startAds();
		}, 1000 * 2);

		const loadedmetadataHandler = () => {
			this.videoLoaded = true;
			this.startAds();
			this.video.videoEl.removeEventListener('loadedmetadata', loadedmetadataHandler);
		};

		this.video.videoEl.addEventListener('loadedmetadata', loadedmetadataHandler);

		// Initialize the video. Must be done via a user action on mobile devices.
		this.video.videoEl.load();

		this.overlayEl && this.overlayEl.removeEventListener('click', this.playAdEventHandler);
		this.overlayEl && this.video.containerEl.removeChild(this.overlayEl);
		delete this.overlayEl;
	}

	adEventHandler(adEvent) {
		// Retrieve the ad from the event. Some events (e.g. ALL_ADS_COMPLETED)
		// don't have ad object associated.
		const ad = adEvent.getAd();

		const options = {
			detail: {
				advertising: true,
				category: 'video',
				contentId: this.video.opts.id,
				progress: 0,
				adDuration: ad.getDuration(),
				adMinDuration: ad.getMinSuggestedDuration(),
				adTitle: ad.getTitle(),
				adProgress: this.getAdProgress()
			},
			bubbles: true
		};

		switch (adEvent.type) {
			case google.ima.AdEvent.Type.LOADED:
				// This is the first event sent for an ad - it is possible to
				// determine whether the ad is a video ad or an overlay.
				if (!ad.isLinear()) {
					// Position AdDisplayContainer correctly for overlay.
					// Use ad.width and ad.height.
					this.playUserVideo();
				}
				break;
			case google.ima.AdEvent.Type.STARTED:
				// This event indicates the ad has started - the video player
				// can adjust the UI, for example display a pause button and
				// remaining time.
				options.detail.action = 'adStart';
				const startEvent = new CustomEvent('oTracking.event', options);
				document.body.dispatchEvent(startEvent);

				if (ad.isLinear()) {
					// For a linear ad, a timer can be started to poll for
					// the remaining time.
					// TODO: We could use this to add a skip ad button
					// Currently not used, could be used in an interval
					// const remainingTime = this.adsManager.getRemainingTime();
				}
				break;
			case google.ima.AdEvent.Type.COMPLETE:

				options.detail.action = 'adComplete';
				const endEvent = new CustomEvent('oTracking.event', options);
				document.body.dispatchEvent(endEvent);

				if (ad.isLinear()) {
					// Would be used to clear the interval
				}
				break;

			// Add tracking for when an advert becomes skippable, and whether it's skipped
			case google.ima.AdEvent.Type.SKIPPABLE_STATE_CHANGED:
				options.detail.action = 'adSkippable';
				const skippableEvent = new CustomEvent('oTracking.event', options);
				document.body.dispatchEvent(skippableEvent);
				break;
			case google.ima.AdEvent.Type.SKIPPED:
				options.detail.action = 'adSkip';
				const skipEvent = new CustomEvent('oTracking.event', options);
				document.body.dispatchEvent(skipEvent);
				break;
		}
	}

	reportError(error) {
		document.body.dispatchEvent(new CustomEvent('oErrors.log', { bubbles: true, detail: { error: error } }));
	}

	adErrorHandler(adError) {
		// NOTE: has the API changed? now need to call `getError` method to get the ad error
		const actualError = ('getError' in adError && typeof adError.getError === 'function') ? adError.getError() : adError;

		// convert the Google Ad error to a JS one
		const message = `${actualError.getErrorCode()}, ${actualError.getType()}, ${actualError.getMessage()}, ${actualError.getVastErrorCode()}`;
		this.reportError(new Error(message));

		this.adsManager && this.adsManager.destroy();
		this.video.containerEl.removeChild(this.adContainerEl);
		if (this.overlayEl) {
			this.overlayEl.removeEventListener('click', this.playAdEventHandler);
			this.video.containerEl.removeChild(this.overlayEl);
			delete this.overlayEl;
		}
		this.video.placeholderEl && this.video.placeholderEl.removeEventListener('click', this.playAdEventHandler);
		this.video.opts.advertising = false;
		this.startAds();
	}

	contentPauseRequestHandler() {
		this.adsCompleted = false;
		this.video.videoEl.pause();
	}

	contentResumeRequestHandler() {
		this.video.containerEl.removeChild(this.adContainerEl);
		this.adsCompleted = true;
		this.playUserVideo();
	}

	playUserVideo() {
		// Since Firefox 52, the captions need re-adding after the
		// ad video layer has finished its thing.
		this.video.addCaptions();

		this.video.videoEl.play();
	}

	getAdProgress() {
		if (!this.adsManager || !this.adsManager.getCurrentAd()) {
			return 0;
		}
		const duration = this.adsManager.getCurrentAd().getDuration();
		const remainingTime = this.adsManager.getRemainingTime();
		return parseInt(100 * (duration - remainingTime) / duration, 10);
	}
}

/* harmony default export */ __webpack_exports__["a"] = (VideoAds);


/***/ }),
/* 12 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
class VideoInfo {
	constructor (video) {
		this.video = video;

		this.opts = this.video.opts.placeholderInfo.reduce((map, key) => {
			map[key] = true;
			return map;
		}, {});

		this.infoEl = document.createElement('div');
		this.infoEl.className = 'o-video__info';

		if (this.opts.brand) {
			this.brandEl = document.createElement('span');
			this.brandEl.className = 'o-video__info-brand';
			this.infoEl.appendChild(this.brandEl);
		}

		if (this.opts.title) {
			this.titleEl = document.createElement('h4');
			this.titleEl.className = 'o-video__info-title';
			this.infoEl.appendChild(this.titleEl);
		}

		if (this.opts.description) {
			this.descriptionEl = document.createElement('p');
			this.descriptionEl.className = 'o-video__info-description';
			this.infoEl.appendChild(this.descriptionEl);
		}

		this.update();

		this.video.placeholderEl.appendChild(this.infoEl);
	}

	update () {
		if (this.brandEl) {
			const brandName = this.video.videoData.brand && this.video.videoData.brand.name;
			this.brandEl.textContent = brandName;
		}

		if (this.titleEl) {
			this.titleEl.textContent = this.video.videoData.title;
		}

		if (this.descriptionEl) {
			this.descriptionEl.textContent = this.video.videoData.standfirst;
		}
	}

	teardown () {
		this.video.placeholderEl.removeChild(this.infoEl);

		delete this.infoEl;
		delete this.brandEl;
		delete this.titleEl;
		delete this.descriptionEl;
	}
}

/* harmony default export */ __webpack_exports__["a"] = (VideoInfo);


/***/ }),
/* 13 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
class Playlist {
	constructor (opts) {
		this.opts = opts;

		// find the currently playing video, always deal with strings
		const currentId = opts.player.videoData ? opts.player.videoData.id : opts.player.opts.id;
		this.currentIndex = currentId ? opts.queue.indexOf(currentId.toString()) : -1;

		this.cache = {};

		if (this.opts.autoplay) {
			this.opts.player.containerEl.addEventListener('ended', this.next.bind(this), true);

			if ( this.currentIndex === -1) {
				this.next();
			}
		}
	}

	next () {
		this.goto(this.currentIndex + 1);
	}

	prev () {
		this.goto(this.currentIndex - 1);
	}

	goto (index) {
		if (index < 0) {
			this.currentIndex = this.opts.queue.length - 1;
		} else if (index >= this.opts.queue.length) {
			this.currentIndex = 0;
		} else {
			this.currentIndex = index;
		}

		// store the current data for quick access later
		const currentVideoId = this.opts.player.videoData && this.opts.player.videoData.id;

		if (currentVideoId && !this.cache[currentVideoId]) {
			this.cache[currentVideoId] = this.opts.player.videoData;
		}

		// fire off any current watched data
		this.opts.player.fireWatchedEvent();
		this.opts.player.resetAmountWatched();

		const nextVideoId = this.opts.queue[this.currentIndex];

		const nextVideoOpts = {
			id: nextVideoId,
			data: this.cache[nextVideoId]
		};

		return this.opts.player.update(nextVideoOpts).then(() => {
			this.opts.player.videoEl && this.opts.player.videoEl.play();
		});
	}
}

/* harmony default export */ __webpack_exports__["a"] = (Playlist);


/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/* global document, navigator, window, cancelAnimationFrame, requestAnimationFrame, THREE */

const throttle = __webpack_require__(15).throttle;
const spriteScale = 0.05;
const DEG2RAD = Math.PI / 180.0;
const CameraInteractivityWorld = __webpack_require__(17);
let rotWorldMatrix;
let xAxis;
let yAxis;
let zAxis;

function noop() {}

// from THREE.js
function fovToNDCScaleOffset( fov ) {
	const pxscale = 2.0 / ( fov.leftTan + fov.rightTan );
	const pxoffset = ( fov.leftTan - fov.rightTan ) * pxscale * 0.5;
	const pyscale = 2.0 / ( fov.upTan + fov.downTan );
	const pyoffset = ( fov.upTan - fov.downTan ) * pyscale * 0.5;
	return { scale: [ pxscale, pyscale ], offset: [ pxoffset, pyoffset ] };
}

// from THREE.js
function fovPortToProjection( fov, rightHanded, zNear, zFar ) {

	rightHanded = rightHanded === undefined ? true : rightHanded;
	zNear = zNear === undefined ? 0.01 : zNear;
	zFar = zFar === undefined ? 10000.0 : zFar;

	const handednessScale = rightHanded ? - 1.0 : 1.0;

	// start with an identity matrix
	const mobj = new THREE.Matrix4();
	const m = mobj.elements;

	// and with scale/offset info for normalized device coords
	const scaleAndOffset = fovToNDCScaleOffset( fov );

	// X result, map clip edges to [-w,+w]
	m[ 0 * 4 + 0 ] = scaleAndOffset.scale[ 0 ];
	m[ 0 * 4 + 1 ] = 0.0;
	m[ 0 * 4 + 2 ] = scaleAndOffset.offset[ 0 ] * handednessScale;
	m[ 0 * 4 + 3 ] = 0.0;

	// Y result, map clip edges to [-w,+w]
	// Y offset is negated because this proj matrix transforms from world coords with Y=up,
	// but the NDC scaling has Y=down (thanks D3D?)
	m[ 1 * 4 + 0 ] = 0.0;
	m[ 1 * 4 + 1 ] = scaleAndOffset.scale[ 1 ];
	m[ 1 * 4 + 2 ] = - scaleAndOffset.offset[ 1 ] * handednessScale;
	m[ 1 * 4 + 3 ] = 0.0;

	// Z result (up to the app)
	m[ 2 * 4 + 0 ] = 0.0;
	m[ 2 * 4 + 1 ] = 0.0;
	m[ 2 * 4 + 2 ] = zFar / ( zNear - zFar ) * - handednessScale;
	m[ 2 * 4 + 3 ] = ( zFar * zNear ) / ( zNear - zFar );

	// W result (= Z in)
	m[ 3 * 4 + 0 ] = 0.0;
	m[ 3 * 4 + 1 ] = 0.0;
	m[ 3 * 4 + 2 ] = handednessScale;
	m[ 3 * 4 + 3 ] = 0.0;

	mobj.transpose();

	return mobj;
}

function rotateAroundWorldAxis(object, axis, radians) {
    rotWorldMatrix.makeRotationAxis(axis.normalize(), radians);
    rotWorldMatrix.multiply(object.matrix);
    object.matrix = rotWorldMatrix;
    object.rotation.setFromRotationMatrix(object.matrix);
}

// from THREE.js
function fovToProjection( fov, rightHanded, zNear, zFar ) {

	const fovPort = {
		upTan: Math.tan( fov.upDegrees * DEG2RAD ),
		downTan: Math.tan( fov.downDegrees * DEG2RAD ),
		leftTan: Math.tan( fov.leftDegrees * DEG2RAD ),
		rightTan: Math.tan( fov.rightDegrees * DEG2RAD )
	};

	return fovPortToProjection( fovPort, rightHanded, zNear, zFar );
}

class ThreeSixtyMedia {
	constructor (container, media, opts) {

		if (!THREE) {
			throw Error('Threee.js required.');
		}

		if (!rotWorldMatrix) {
			rotWorldMatrix = new THREE.Matrix4();
			xAxis = new THREE.Vector3(1,0,0);
			yAxis = new THREE.Vector3(0,1,0);
			zAxis = new THREE.Vector3(0,0,1);
		}

		this.listeners = [];

		let video;
		if (media.tagName === 'VIDEO') {
			video = media;
			this.video = video;
		}

		let preserveDrawingBuffer = false;

		this.buttonContainer = document.createElement('div');
		this.buttonContainer.classList.add('button-container');

		this.longOffset = opts.longOffset;

		container.classList.add('o-three-sixty-container');

		container.appendChild(this.buttonContainer);

		this.container = container;

		if (navigator.getVRDisplays) {
			navigator.getVRDisplays()
			.then(displays => {
				if (displays.length > 0) {
					this.vrDisplay = displays[0];
					this.addUiButton('Reset', 'R', null, function () { this.vrDisplay.resetPose(); });
					if (this.vrDisplay.capabilities.canPresent) this.vrPresentButton = this.addUiButton('Enter VR', 'E', 'cardboard-icon', this.onVRRequestPresent);
					this.addEventListener(window,'vrdisplaypresentchange', () => this.onVRPresentChange(), false);
				}
			});
			preserveDrawingBuffer = true;
		} else if (navigator.getVRDevices) {
			console.error('Your browser supports WebVR but not the latest version. See <a href=\'http://webvr.info\'>webvr.info</a> for more info.');
		} else {
			console.error('Your browser does not support WebVR. See <a href=\'http://webvr.info\'>webvr.info</a> for assistance.');
		}

		this.vrDisplay = null;
		this.vrPresentButton;
		media.style.display = 'none';
		this.media = media;

		this.fov = opts.fov || 90;
		this.camera = new THREE.PerspectiveCamera( this.fov, this.media.width / this.media.height, 0.05, 10000 );
		this.camera.up.set( 0, 0, 1 );
		this.scene = new THREE.Scene();
		this.orientation = new THREE.Quaternion([0,0,0,1]);
		this.textureLoader = new THREE.TextureLoader();

		const renderer = new THREE.WebGLRenderer( { antialias: false, preserveDrawingBuffer } );
		renderer.context.disable(renderer.context.DEPTH_TEST);
		renderer.setPixelRatio(Math.floor(window.devicePixelRatio));
		renderer.autoClear = false;
		container.appendChild( renderer.domElement );
		this.renderer = renderer;

		this.cameraInteractivityWorld = new CameraInteractivityWorld(renderer.domElement, THREE);

		setTimeout(this.resize.bind(this), 100);

		this.addFullscreenButton();

		this.addGeometry();

		this.startAnimation();

		this.addEventListener(this.renderer.domElement,'touchmove', e => {
			e.preventDefault();
			return false;
		});

		if (video) {
			if (video.readyState >= 2) {
				this.loadVideoTexture();
				this.addPlayButton();
			} else {
				this.addEventListener(video,'canplay', function oncanplay() {
					video.removeEventListener('canplay', oncanplay);
					this.loadVideoTexture();
					this.addPlayButton();
				}.bind(this));
			}

			let lastClick;

			this.addEventListener(this.renderer.domElement,'mousedown', () => {
				lastClick = Date.now();
			});

			this.addEventListener(this.renderer.domElement,'click', e => {
				if (Date.now() - lastClick >= 300) return;
				if (!this.hasVideoTexture) return;
				e.preventDefault();
				if (this.video.paused) {
					this.updateTexture(this.videoTexture);
					this.video.play();
					this.removeButton(this.playButton);
					this.playButton = null;
				} else {
					this.addPlayButton();
					this.video.pause();
				}
			});
		}
	}

	addSpriteButton({
		image,
		width,
		height,
		callback=noop
	}) {
		if (this.buttons === undefined) {
			this.buttons = [];
		}
		if (this.buttonArea === undefined) {
			const buttonArea = new THREE.Object3D();
			buttonArea.position.set(0, -2, 0);
			this.scene.add(buttonArea);
			this.buttonArea = buttonArea;
			buttonArea.goalRotationY = 0;
			buttonArea.checkInRange = throttle(() => {
				const v = new THREE.Vector3(0, 0, -1);
				v.applyQuaternion(this.camera.quaternion);
				v.projectOnPlane(yAxis);
				const angle = -Math.PI/2 - Math.atan2(v.z, v.x);
				if (Math.abs(buttonArea.goalRotationY - angle) > Math.PI/4) {
					buttonArea.goalRotationY = angle;
				}
			}, 500, {leading: true});
		}
		if (this.interactivityCheck === undefined) {
			this.interactivityCheck = () => this.cameraInteractivityWorld.detectInteractions(this.camera);
		}

		const imageDetails = {
			width,
			height,
			url: image,
			events: null,
			object: null,
		}

		this.buttons.push(imageDetails);

		this.layoutSpriteButtons();

		return new Promise(resolve => {
			this.textureLoader.load(
				image,
				map => {
					const material = new THREE.MeshBasicMaterial({
						map: map,
						color: 0xffffff,
						fog: false,
						transparent: true
					});
					const sprite = new THREE.Mesh(
						new THREE.PlaneGeometry(width,height),
						material
					);
					imageDetails.sprite = sprite;
					sprite.position.z = -30;
					sprite.position.y = -5;
					sprite.scale.set(spriteScale, spriteScale, spriteScale);
					imageDetails.events = this.cameraInteractivityWorld.makeTarget(sprite);
					resolve(imageDetails.events);
					this.buttonArea.add(sprite);
					this.layoutSpriteButtons();
					callback(sprite);
				}
			);
		});
	}

	layoutSpriteButtons() {
		let offset = 0;
		const length = this.buttons.reduce((a,b) => a + b.width, 0);
		for (const iD of this.buttons) {
			if (iD.sprite) {
				iD.sprite.position.x = (iD.width/2 + offset - length/2) * spriteScale;
			}
			offset += iD.width;
		}
	}

	addReticule({
		image,
		callback=noop
	}) {
		if (this.hud === undefined) {
			const hud = new THREE.Object3D();
			hud.position.set(0, 0, -15);
			hud.scale.set(0.5, 0.5, 0.5);
			this.camera.add(hud);
			this.scene.add(this.camera); // add the camera to the scene so that the hud is rendered
			this.hud = hud;
		}

		this.textureLoader.load(
			image,
			map => {
				const material = new THREE.SpriteMaterial( { map: map, color: 0xffffff, fog: false, transparent: true, opacity: 0.5 } );
				const sprite = new THREE.Sprite(material);
				this.hud.add(sprite);
				callback(sprite);
			}
		);
	}

	addPlayButton() {
		if (this.playButton) return;
		this.playButton = this.addUiButton('Play', 'space', 'play-icon', e => {
				this.removeButton(this.playButton);
				this.playButton = null;
				if (this.hasVideoTexture) this.updateTexture(this.videoTexture);
				this.video.play();
				e.stopPropagation();
			}
		);
	}

	addFullscreenButton() {

		const fullscreen = this.container.requestFullscreen || this.container.mozRequestFullscreen || this.container.webkitRequestFullscreen;

		this.addUiButton('Exit Fullscreen', null, 'exit-fullscreen', function () {
			(document.exitFullscreen || document.mozExitFullscreen || document.webkitExitFullscreen).bind(document)();
		});

		if (document.isFullScreen !== undefined) {
			this.addUiButton('Full Screen', 'F', 'fullscreen', function () {
				fullscreen.bind(this.container)();
			});
			this.addEventListener(document,'fullscreenchange', function() {
				if ( document.isFullScreen ) {
					if (document.fullscreenElement === this.container) {
						setTimeout(() => this.resize(), 500);
					}
				} else {
					setTimeout(() => this.resize(), 500);
				}
			}.bind(this));
		} else if (document.webkitIsFullScreen !== undefined) {
			this.addUiButton('Full Screen', 'F', 'fullscreen', function () {
				fullscreen.bind(this.container)();
			});
			this.addEventListener(document,'webkitfullscreenchange', function() {
				if ( document.webkitIsFullScreen ) {
					if (document.webkitFullscreenElement === this.container) {
						setTimeout(() => this.resize(), 500);
					}
				} else {
					setTimeout(() => this.resize(), 500);
				}
			}.bind(this));
		} else if (document.mozIsFullScreen !== undefined) {
			this.addUiButton('Full Screen', 'F', 'fullscreen', function () {
				fullscreen.bind(this.container)();
			});
			this.addEventListener(document,'mozfullscreenchange', function() {
				if ( document.mozIsFullScreen ) {
					if (document.mozFullscreenElement === this.container) {
						setTimeout(() => this.resize(), 500);
					}
				} else {
					setTimeout(() => this.resize(), 500);
				}
			}.bind(this));
		}

	}

	addEventListener(el, type, callback) {
		this.listeners.push({el, type, callback});
		el.addEventListener(type, callback);
	}

	removeAllEventListeners() {
		this.listeners.forEach(function remove({el, type, callback}) {
			el.removeEventListener(type, callback);
		});
	}

	loadVideoTexture() {
		if (this.hasVideoTexture) return;
		const texture = new THREE.VideoTexture( this.video );
		texture.minFilter = THREE.LinearFilter;
		texture.magFilter = THREE.LinearFilter;
		texture.format = THREE.RGBFormat;

		this.hasVideoTexture = true;
		this.videoTexture = texture;
	}

	updateTexture(map) {
		if (this.currentTexture === map) return;
		if (!map) throw Error('No texture to update');
		this.currentTexture = map;
		const material = new THREE.MeshBasicMaterial({ color: 0xffffff, map });
		this.sphere.material = material;
	}

	addGeometry() {

		if (this.sphere) {
			throw Error('Geometery already set up');
		}

		const poster = this.video ? this.video.getAttribute('poster') : this.media.src;
		if (poster) {
			this.textureLoader.load(
				poster,
				t => (!this.hasVideoTexture || this.currentTexture !== this.videoTexture) && this.updateTexture(t)
			);
		}

		const material = new THREE.MeshBasicMaterial({ color: 0x888888, wireframe: true });
		const geometry = new THREE.SphereGeometry( 5000, 64, 32 );

		const mS = (new THREE.Matrix4()).identity();
		mS.elements[0] = -1;
		geometry.applyMatrix(mS);

		const sphere = new THREE.Mesh( geometry, material );
		rotateAroundWorldAxis(sphere, yAxis, -this.longOffset * DEG2RAD);
		this.sphere = sphere;
		this.scene.add( sphere );
	}

	resize() {

		if (this.vrDisplay && this.vrDisplay.isPresenting) {

			const leftEye = this.vrDisplay.getEyeParameters('left');
			const rightEye = this.vrDisplay.getEyeParameters('right');

			const w = Math.max(leftEye.renderWidth, rightEye.renderWidth) * 2;
			const h = Math.max(leftEye.renderHeight, rightEye.renderHeight);
			this.camera.aspect = w/h;
			this.renderer.setSize(w, h);
		} else if (document.isFullScreen || document.webkitIsFullScreen || document.mozIsFullScreen) {
			this.camera.aspect = window.innerWidth / window.innerHeight;
			this.renderer.setSize(
				window.innerWidth,
				window.innerHeight
			);
		} else {
			this.camera.aspect = this.media.width / this.media.height;
			this.renderer.setSize( this.media.width, this.media.height );
		}
		this.camera.updateProjectionMatrix();
	}

	stopAnimation() {
		cancelAnimationFrame(this.raf);
		if (this.video) {
			this.video.pause();
		}
	}

	startAnimation() {
		this.raf = requestAnimationFrame( () => this.startAnimation() );
		this.render();
	}

	renderSceneView (pose, eye) {
		let orientation = pose.orientation;
		let position = pose.position;
		if (!orientation) {
			orientation = [0, 0, 0, 1];
		}
		if (!position) {
			position = [0, 0, 0];
		}
		this.camera.position.fromArray(position);
		this.orientation.set(...orientation);
		this.camera.rotation.setFromQuaternion(this.orientation, 'XZY');

		if (eye) {
			this.camera.projectionMatrix = fovToProjection(eye.fieldOfView, true, this.camera.near, this.camera.far );
			this.camera.position.add(new THREE.Vector3(...eye.offset));
		} else {
			this.camera.fov = this.fov || 90;
			this.camera.updateProjectionMatrix();
		}
		
		
		this.renderer.render(this.scene, this.camera);
	}

	render() {
		this.renderer.clear();

		if (this.hud) this.hud.visible = false;
		if (this.buttonArea) this.buttonArea.visible = false;

		if (this.vrDisplay) {
			const pose = this.vrDisplay.getPose();
			if (this.vrDisplay.isPresenting) {

				if (this.hud) this.hud.visible = true;
				if (this.buttonArea) {
					this.buttonArea.checkInRange();
					this.buttonArea.rotation.y = (this.buttonArea.rotation.y + this.buttonArea.goalRotationY)/2;
					this.buttonArea.visible = true;
					if (this.interactivityCheck) this.interactivityCheck();
				}

				const size = this.renderer.getSize();

				this.renderer.setScissorTest( true );

				this.renderer.setScissor( 0, 0, size.width / 2, size.height );
				this.renderer.setViewport( 0, 0, size.width / 2, size.height );
				this.renderSceneView(pose, this.vrDisplay.getEyeParameters('left'));

				this.renderer.setScissor( size.width / 2, 0, size.width / 2, size.height );
				this.renderer.setViewport( size.width / 2, 0, size.width / 2, size.height );
				this.renderSceneView(pose, this.vrDisplay.getEyeParameters('right'));

				this.renderer.setScissorTest( false );
				this.renderer.setViewport( 0, 0, size.width, size.height );
				this.vrDisplay.submitFrame(pose);

			} else {
				this.renderSceneView(pose, null);

			}
		} else {

			// No VRDisplay found.
			this.renderer.render(this.scene, this.camera);

		}

	}

	destroy() {
		this.media.style.display = '';
		this.stopAnimation();
		this.removeAllEventListeners();
		this.container.removeChild(this.buttonContainer);
		this.cameraInteractivityWorld.destroy();
	}

	onVRRequestPresent () {
		this.vrDisplay.requestPresent({ source: this.renderer.domElement })
		.then(() => {}, function () {
			console.error('requestPresent failed.', 2000);
		});
	}

	onVRExitPresent () {
		this.vrDisplay.exitPresent()
		.then(() => {}, function () {
			console.error('exitPresent failed.', 2000);
		});
	}

	onVRPresentChange () {
		this.resize();
	}

	addUiButton(text, shortcut, classname, callback) {
		const button = document.createElement('button');
		if (classname) button.classList.add(classname);
		button.textContent = text;
		this.addEventListener(button,'click', callback.bind(this));
		this.buttonContainer.appendChild(button);
		return button;
	}

	removeButton(el) {
		this.buttonContainer.removeChild(el);
	}
}
		
module.exports = ThreeSixtyMedia;




/***/ }),
/* 16 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "debounce", function() { return debounce; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "throttle", function() { return throttle; });
/**
*
* Debounces function so it is only called after n milliseconds
* without it not being called
*
* @example
* Utils.debounce(myFunction() {}, 100);
*
* @param {Function} func - Function to be debounced
* @param {number} wait - Time in miliseconds
*
* @returns {Function} - Debounced function
*/
function debounce(func, wait) {
	let timeout;
	return function() {
		const args = arguments;
		const later = () => {
			timeout = null;
			func.apply(this, args);
		};
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
	};
};

/**
*
* Throttle function so it is only called once every n milliseconds
*
* @example
* Utils.throttle(myFunction() {}, 100);
*
* @param {Function} func - Function to be throttled
* @param {number} wait - Time in miliseconds
*
* @returns {Function} - Throttled function
*/
function throttle(func, wait) {
	let timeout;
	return function() {
		if (timeout) {
			return;
		}
		const args = arguments;
		const later = () => {
			timeout = null;
			func.apply(this, args);
		};

		timeout = setTimeout(later, wait);
	};
};




/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 *
 * Sets up an enviroment for detecting that
 * the camera is looking at objects.
 *
 * Ported from https://github.com/AdaRoseEdwards/three-camera-interactions/blob/master/lib/index.js
 */

 /*
global THREE
 */


const EventEmitter = __webpack_require__(18);

const visibleFilter = object3d => object3d.visible
const getObject = target => target.object3d

/**
 * Keeps track of interactive 3D elements and
 * can be used to trigger events on them.
 *
 * The domElement is to pick up touch ineractions
 *
 * @param  {[type]} domElement [description]
 * @return {[type]}            [description]
 */
module.exports = function CameraInteractivityWorld(domElement, threeOverride) {

	const THREE_IN = threeOverride || THREE;

	if (!THREE_IN) throw Error('No Three Library Detected');

	class InteractivityTarget extends EventEmitter {

		constructor(node) {
			super();
			this.position = node.position;
			this.hasHover = false;
			this.object3d = node;

			this.on('hover', () => {
				if (!this.hasHover) {
					this.emit('hoverStart');
				}
				this.hasHover = true;
			});

			this.on('hoverEnd', () => {
				this.hasHover = false;
			});
		}

		hide() {
			this.object3d.visible = false;
		}

		show () {
			this.object3d.visible = true;
		}
	}

	this.targets = new Map();

	const raycaster = new THREE_IN.Raycaster();
	this.detectInteractions = function (camera) {

		const targets = Array.from(this.targets.values());
		raycaster.setFromCamera(new THREE_IN.Vector2(0,0), camera);
		const hits = raycaster.intersectObjects(targets.map(getObject).filter(visibleFilter));
		let target = false;

		if (hits.length) {

			// Show hidden text object3d child
			target = this.targets.get(hits[0].object);
			if (target) target.emit('hover');
		}

		// if it is not the one just marked for highlight
		// and it used to be highlighted un highlight it.
		for (const t of targets) {
			if (t !== target && t.hasHover) t.emit('hoverEnd');
		}
	};

	const interact = (event) => {
		Array.from(this.targets.values()).forEach(target => {
			if (target.hasHover) {
				target.emit(event.type);
			}
		});
	};
	this.interact = interact;

	domElement.addEventListener('click', interact);
	domElement.addEventListener('mousedown', interact);
	domElement.addEventListener('mouseup', interact);
	domElement.addEventListener('touchup', interact);
	domElement.addEventListener('touchdown', interact);

	this.destroy = () => {
		domElement.removeEventListener('click', interact);
		domElement.removeEventListener('mousedown', interact);
		domElement.removeEventListener('mouseup', interact);
		domElement.removeEventListener('touchup', interact);
		domElement.removeEventListener('touchdown', interact);
	}

	this.makeTarget = node => {
		const newTarget = new InteractivityTarget(node);
		this.targets.set(node, newTarget);
		return newTarget;
	};
};

/***/ }),
/* 18 */
/***/ (function(module, exports) {

// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      } else {
        // At least give some kind of context to the user
        var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
        err.context = er;
        throw err;
      }
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        args = Array.prototype.slice.call(arguments, 1);
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    args = Array.prototype.slice.call(arguments, 1);
    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else if (listeners) {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.prototype.listenerCount = function(type) {
  if (this._events) {
    var evlistener = this._events[type];

    if (isFunction(evlistener))
      return 1;
    else if (evlistener)
      return evlistener.length;
  }
  return 0;
};

EventEmitter.listenerCount = function(emitter, type) {
  return emitter.listenerCount(type);
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

/***/ })
/******/ ]);
