/* global odhback, localizeHtmlPage, utilAsync, optionsLoad, optionsSave */
async function populateAnkiDeckAndModel(options) {
    let names = [];
    $('#deckname').empty();
    names = await odhback().opt_getDeckNames();
    if (names !== null) {
        names.forEach(name => $('#deckname').append($('<option>', { value: name, text: name })));
    }
    $('#deckname').val(options.deckname);
}

function populateDictionary(dicts) {
    $('#dict').empty();
    dicts.forEach(item => $('#dict').append($('<option>', { value: item.objectname, text: item.displayname })));
}

async function updateAnkiStatus(options) {
    let version = await odhback().opt_getVersion();
    if (version === null) {
        $('.anki-options').hide();
    } else {
        populateAnkiDeckAndModel(options);
        $('.anki-options').show();
    }
}

let currentMatchedDomain = null;

async function onOptionChanged(e) {
    if (!e.originalEvent) return;

    let options = await optionsLoad();

    // These two are always global
    options.mouseselection = $('#mouseselection').prop('checked');
    options.hotkey = $('#hotkey').val();

    if (currentMatchedDomain) {
        if (!options.siteRules) options.siteRules = {};
        if (!options.siteRules[currentMatchedDomain]) options.siteRules[currentMatchedDomain] = {};
        let rule = options.siteRules[currentMatchedDomain];
        
        rule.enabled = $('#enabled').prop('checked');
        rule.dictSelected = $('#dict').val();
        rule.deckname = $('#deckname').val();
        rule.tags = $('#tags').val();
    } else {
        options.enabled = $('#enabled').prop('checked');
        options.dictSelected = $('#dict').val();
        options.deckname = $('#deckname').val();
        options.tags = $('#tags').val();
    }
    
    let newOptions = await odhback().opt_optionsChanged(options);
    optionsSave(newOptions);
}

function onMoreOptions() {
    if (chrome.runtime.openOptionsPage) {
        chrome.runtime.openOptionsPage();
    } else {
        window.open(chrome.runtime.getURL('options.html'));
    }
}

async function onReady() {
    localizeHtmlPage();
    let globalOptions = await optionsLoad();
    
    chrome.tabs.query({active: true, currentWindow: true}, async (tabs) => {
        let options = globalOptions;
        if (tabs && tabs[0] && tabs[0].url) {
            try {
                const hostname = new URL(tabs[0].url).hostname;
                currentMatchedDomain = matchSiteRule(hostname, globalOptions.siteRules);
                if (currentMatchedDomain) {
                    options = getEffectiveOptions(globalOptions, hostname);
                    $('#site-rule-indicator').text('🌐 ' + currentMatchedDomain).show();
                }
            } catch (e) { /* ignore invalid url */ }
        }
        
        $('#enabled').prop('checked', options.enabled);
        $('#mouseselection').prop('checked', globalOptions.mouseselection);
        $('#hotkey').val(globalOptions.hotkey);
        populateDictionary(globalOptions.dictNamelist);
        $('#dict').val(options.dictSelected);
        $('#deckname').val(options.deckname);
        $('#tags').val(options.tags);

        $('#enabled').change(onOptionChanged);
        $('#mouseselection').change(onOptionChanged);
        $('#hotkey').change(onOptionChanged);
        $('#dict').change(onOptionChanged);

        $('#deckname').change(onOptionChanged);
        $('#tags').change(onOptionChanged);

        $('#more').click(onMoreOptions);

        $('.anki-options').hide();
        updateAnkiStatus(options);
    });
}

$(document).ready(utilAsync(onReady));