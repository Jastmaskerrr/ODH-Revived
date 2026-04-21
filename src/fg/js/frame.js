/* global spell */
function getImageSource(id) {
    return document.querySelector(`#${id}`).src;
}

function registerAddNoteLinks() {
    for (let link of document.getElementsByClassName('odh-addnote')) {
        link.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            const ds = e.currentTarget.dataset;
            e.currentTarget.src = getImageSource('load');
            window.parent.postMessage({
                action: 'addNote',
                params: {
                    nindex: ds.nindex,
                    dindex: ds.dindex,
                    context: document.querySelector('.spell-content').innerHTML
                }
            }, '*');
        });
    }
}

function registerAudioLinks() {
    for (let link of document.getElementsByClassName('odh-playaudio')) {
        link.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            const ds = e.currentTarget.dataset;
            window.parent.postMessage({
                action: 'playAudio',
                params: {
                    nindex: ds.nindex,
                    dindex: ds.dindex
                }
            }, '*');
        });
    }
}

function registerSoundLinks() {
    for (let link of document.getElementsByClassName('odh-playsound')) {
        link.setAttribute('src', getImageSource('play'));
        link.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            const ds = e.currentTarget.dataset;
            window.parent.postMessage({
                action: 'playSound',
                params: {
                    sound: ds.sound,
                }
            }, '*');
        });
    }
}

function initSpellnTranslation(){
    document.querySelector('#odh-container').appendChild(spell());
    document.querySelector('.spell-content').innerHTML=document.querySelector('#context').innerHTML;
    if (document.querySelector('#monolingual').innerText == '1')
        hideTranslation();
}

function registerHiddenClass() {
    for (let div of document.getElementsByClassName('odh-definition')) {
        div.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            hideTranslation();
        });
    }
}

function hideTranslation(){
    let className = 'span.chn_dis, span.chn_tran, span.chn_sent, span.tgt_tran, span.tgt_sent'; // to add your bilingual translation div class name here.
    for (let div of document.querySelectorAll(className)) {
        div.classList.toggle('hidden');
    }
}

function onDomContentLoaded() {
    registerAddNoteLinks();
    registerAudioLinks();
    registerSoundLinks();
    registerHiddenClass();
    initSpellnTranslation();
}

function onMessage(e) {
    const { action, params } = e.data;
    const method = window['api_' + action];
    if (typeof(method) === 'function') {
        method(params);
    }
}

function api_setActionState(result) {
    const { response, params } = result;
    const { nindex, dindex } = params;

    const match = document.querySelector(`.odh-addnote[data-nindex="${nindex}"].odh-addnote[data-dindex="${dindex}"]`);
    if (response)
        match.src = getImageSource('good');
    else
        match.src = getImageSource('fail');

    setTimeout(() => {
        match.src = getImageSource('plus');
    }, 1000);
}

function onMouseWheel(e) {
    // deltaMode: 0=pixel, 1=line, 2=page
    // Normalize to pixels so scrolling is always smooth and predictable
    const LINE_HEIGHT = 18;
    const PAGE_HEIGHT = window.innerHeight;
    let delta;
    switch (e.deltaMode) {
        case 0: delta = e.deltaY; break;
        case 1: delta = e.deltaY * LINE_HEIGHT; break;
        case 2: delta = e.deltaY * PAGE_HEIGHT; break;
        default: delta = e.deltaY;
    }
    window.scrollBy(0, delta);
    e.preventDefault();
}

// Throttle utility for wheel events
function _frameThrottle(fn, limit) {
    let lastCall = 0;
    let tid = null;
    return function () {
        const args = arguments, ctx = this, now = Date.now();
        const rem = limit - (now - lastCall);
        if (rem <= 0) {
            if (tid) { clearTimeout(tid); tid = null; }
            lastCall = now;
            fn.apply(ctx, args);
        } else if (!tid) {
            tid = setTimeout(function () {
                lastCall = Date.now(); tid = null;
                fn.apply(ctx, args);
            }, rem);
        }
    };
}

document.addEventListener('DOMContentLoaded', onDomContentLoaded, false);
window.addEventListener('message', onMessage);

// Throttle wheel events to ~60fps (16ms) for smooth performance
const throttledWheel = _frameThrottle(onMouseWheel, 16);
window.addEventListener('wheel', throttledWheel, {passive: false});