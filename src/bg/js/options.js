/* global odhback, localizeHtmlPage, utilAsync, optionsLoad, optionsSave */
async function populateAnkiDeckAndModel(options) {
    let names = [];
    $('#deckname').empty();
    $('#rule-deckname').empty();
    names = await odhback().opt_getDeckNames();
    if (names !== null) {
        names.forEach(name => {
            $('#deckname').append($('<option>', { value: name, text: name }));
            $('#rule-deckname').append($('<option>', { value: name, text: name }));
        });
    }
    $('#deckname').val(options.deckname);

    $('#typename').empty();
    $('#rule-typename').empty();
    names = await odhback().opt_getModelNames();
    if (names !== null) {
        names.forEach(name => {
            $('#typename').append($('<option>', { value: name, text: name }));
            $('#rule-typename').append($('<option>', { value: name, text: name }));
        });
    }
    $('#typename').val(options.typename);
}

async function populateAnkiFields(options) {
    const modelName = $('#typename').val() || options.typename;
    if (modelName === null) return;

    let names = await odhback().opt_getModelFieldNames(modelName);
    if (names == null) return;

    let fields = ['expression', 'reading', 'extrainfo', 'definition', 'definitions', 'sentence', 'url', 'audio'];
    fields.forEach(field => {
        $(`#${field}`).empty();
        $(`#${field}`).append($('<option>', { value: '', text: '' }));
        names.forEach(name => $(`#${field}`).append($('<option>', { value: name, text: name })));
        $(`#${field}`).val(options[field]);
    });
}

async function updateAnkiStatus(options) {
    $('#services-status').text(chrome.i18n.getMessage('msgConnecting'));
    $('#anki-options').hide();
    $('#ankiconnect-options').hide();
    $('#user-options').hide();

    if (options.services == 'ankiconnect') {
        $('#ankiconnect-options').show();
    } else if (options.services == 'ankiweb') {
        $('#user-options').show();
    } else {
        $('#services-status').text(chrome.i18n.getMessage('msgFailed'));
        return;
    }

    let version = await odhback().opt_getVersion();
    if (version === null) {
        $('#services-status').text(chrome.i18n.getMessage('msgFailed'));
    } else {
        populateAnkiDeckAndModel(options);
        populateAnkiFields(options);
        $('#services-status').text(chrome.i18n.getMessage('msgSuccess', [version]));
        $('#anki-options').show();
        if (options.services == 'ankiconnect')
            $('#duplicate-option').show();
        else
            $('#duplicate-option').hide();
    }
}

function populateDictionary(dicts) {
    $('#dict').empty();
    $('#rule-dictSelected').empty();
    dicts.forEach(item => {
        $('#dict').append($('<option>', { value: item.objectname, text: item.displayname }));
        $('#rule-dictSelected').append($('<option>', { value: item.objectname, text: item.displayname }));
    });
}

function populateSysScriptsList(dictLibrary) {
    const optionscripts = Array.from(new Set(dictLibrary.split(',').filter(x => x).map(x => x.trim())));
    let systemscripts = [
        'builtin_encn_Collins', 'general_Makenotes',//default & builtin script
        'cncn_Zdic', //cn-cn dictionary
        'encn_Collins', 'encn_Cambridge', 'encn_Cambridge_tc', 'encn_Oxford', 'encn_Youdao', 'encn_Baicizhan', //en-cn dictionaries
        'enen_Collins', 'enen_LDOCE6MDX', 'enen_UrbanDict', //en-en dictionaries
        'enfr_Cambridge', 'enfr_Collins', //en-fr dictionaries
        'fren_Cambridge', 'fren_Collins', //fr-cn dictionaries
        'esen_Spanishdict', 'decn_Eudict', 'escn_Eudict', 'frcn_Eudict', 'frcn_Youdao', 'rucn_Qianyi' //msci dictionaries
    ];
    $('#scriptslistbody').empty();
    systemscripts.forEach(script => {
        let row = '';
        row += `<input class="sl-col sl-col-onoff" type="checkbox" ${optionscripts.includes(script) || optionscripts.includes('lib://' + script) ? 'checked' : ''}>`;
        row += `<input class="sl-col sl-col-cloud" type="checkbox" ${optionscripts.includes('lib://' + script) ? 'checked' : ''}>`;
        row += `<span class="sl-col sl-col-name">${script}</span>`;
        row += `<span class="sl-col sl-col-description">${chrome.i18n.getMessage(script)}</span>`;
        $('#scriptslistbody').append($(`<div class="sl-row">${row}</div>`));
    });

    $('.sl-col-onoff', '.sl-row:nth-child(1)').prop('checked', true); // make default script(first row) always active.
    $('.sl-col-cloud', '.sl-row:nth-child(1)').prop('checked', false); // make default script(first row) as local script.
    $('.sl-col-cloud, .sl-col-onoff', '.sl-row:nth-child(1)').css({ 'visibility': 'hidden' }); //make default sys script untouch
}

function onScriptListChange() {
    let dictLibrary = [];
    $('.sl-row').each(function () {
        if ($('.sl-col-onoff', this).prop('checked') == true)
            dictLibrary.push($('.sl-col-cloud', this).prop('checked') ? 'lib://' + $('.sl-col-name', this).text() : $('.sl-col-name', this).text());
    });
    $('#sysscripts').val(dictLibrary.join());
}

function onHiddenClicked() {
    $('.sl-col-cloud').toggleClass('hidden');
}

async function onAnkiTypeChanged(e) {
    if (e.originalEvent) {
        let options = await optionsLoad();
        populateAnkiFields(options);

    }
}

async function onLoginClicked(e) {
    if (e.originalEvent) {
        let options = await optionsLoad();
        options.id = $('#id').val();
        options.password = $('#password').val();

        $('#services-status').text(chrome.i18n.getMessage('msgConnecting'));
        await odhback().ankiweb.initConnection(options, true); // set param forceLogout = true

        let newOptions = await odhback().opt_optionsChanged(options);
        updateAnkiStatus(newOptions);
    }
}

async function onConnectClicked(e) {
    if (e.originalEvent) {
        let options = await optionsLoad();
        options.services = $('#services').val();
        options.ankiconnecturl = $('#ankiconnecturl').val();
        let newOptions = await odhback().opt_optionsChanged(options);
        updateAnkiStatus(newOptions);
    }
}

async function onServicesChanged(e) {
    if (e.originalEvent) {
        let options = await optionsLoad();
        options.services = $('#services').val();
        options.ankiconnecturl = $('#ankiconnecturl').val();
        let newOptions = await odhback().opt_optionsChanged(options);
        updateAnkiStatus(newOptions);
    }
}

async function onSaveClicked(e) {
    if (!e.originalEvent) return;

    let optionsOld = await optionsLoad();
    let options = $.extend(true, {}, optionsOld);

    options.enabled = $('#enabled').prop('checked');
    options.mouseselection = $('#mouseselection').prop('checked');
    options.hotkey = $('#hotkey').val();
    options.theme = $('#theme').val();

    options.dictSelected = $('#dict').val();
    options.monolingual = $('#monolingual').val();
    options.preferredaudio = $('#anki-preferred-audio').val();
    options.maxcontext = $('#maxcontext').val();
    options.maxexample = $('#maxexample').val();
    options.maxwords = $('#maxwords').val();
    options.showtoast = $('#showtoast').prop('checked');

    options.services = $('#services').val();
    options.id = $('#id').val();
    options.password = $('#password').val();
    options.ankiconnecturl = $('#ankiconnecturl').val();

    options.tags = $('#tags').val();
    options.duplicate = $('#duplicate').val();

    let fields = ['deckname', 'typename', 'expression', 'reading', 'extrainfo', 'definition', 'definitions', 'sentence', 'url', 'audio'];
    fields.forEach(field => {
        options[field] = $(`#${field}`).val() == null ? options[field] : $(`#${field}`).val();
    });

    options.sysscripts = $('#sysscripts').val();
    options.udfscripts = $('#udfscripts').val();

    $('#gif-load').show();
    let newOptions = await odhback().opt_optionsChanged(options);
    $('.gif').hide();
    $('#gif-good').show(1000, () => { $('.gif').hide(); });

    populateDictionary(newOptions.dictNamelist);
    $('#dict').val(newOptions.dictSelected);

    if (e.target.id == 'saveclose')
        window.close();
}

function onCloseClicked(e) {
    window.close();
}

/* Site Rules Logic */
let currentSiteRules = {};

function populateSiteRules(siteRules) {
    currentSiteRules = siteRules || {};
    $('#site-rules-list').empty();

    let rulesCount = 0;
    for (const domain in currentSiteRules) {
        rulesCount++;
        const rule = currentSiteRules[domain];
        const overrides = Object.keys(rule).join(', ');

        let item = $(`
            <div class="site-rule-item">
                <div class="site-rule-domain">${domain}</div>
                <div class="site-rule-summary" title="Overrides: ${overrides}">Overrides: ${overrides || 'None'}</div>
                <div class="site-rule-actions">
                    <a class="btn-edit-rule" data-domain="${domain}" data-i18n="btnEdit">Edit</a>
                    <a class="btn-delete-rule" data-domain="${domain}" data-i18n="btnDelete">Delete</a>
                </div>
            </div>
        `);
        $('#site-rules-list').append(item);
    }

    if (rulesCount === 0) {
        $('#site-rules-list').append(`
            <div style="text-align:center; color:#777; padding: 20px; background: white; border: 1px solid #d5d5d5; border-radius: 4px; margin: 5px 0;" data-i18n="msgNoRules">
                No site rules defined.
            </div>
        `);
    }

    $('.btn-edit-rule').click(onEditRuleClicked);
    $('.btn-delete-rule').click(onDeleteRuleClicked);
    localizeHtmlPage();
}

function onAddRuleClicked(e) {
    e.preventDefault();
    $('#rule-domain').val('').prop('disabled', false);

    // Reset all checkboxes and inputs
    $('.rule-override-cb').prop('checked', false);
    $('.rule-override-cb').each(function () {
        const targetId = $(this).data('target');
        $(`#${targetId}`).prop('disabled', true);
    });

    $('#site-rule-editor').show();
}

function onCloseRuleClicked(e) {
    e.preventDefault();
    $('#site-rule-editor').hide();
}

function onOverrideCbChanged(e) {
    const targetId = $(this).data('target');
    const isChecked = $(this).prop('checked');
    $(`#${targetId}`).prop('disabled', !isChecked);
}

function onEditRuleClicked(e) {
    e.preventDefault();
    const domain = $(this).data('domain');
    const rule = currentSiteRules[domain];

    $('#rule-domain').val(domain).prop('disabled', true); // editing existing

    $('.rule-override-cb').each(function () {
        const targetId = $(this).data('target');
        const key = targetId.replace('rule-', '');

        if (rule.hasOwnProperty(key)) {
            $(this).prop('checked', true);
            $(`#${targetId}`).prop('disabled', false);
            if (targetId === 'rule-enabled') {
                $(`#${targetId}`).prop('checked', rule[key]);
            } else {
                $(`#${targetId}`).val(rule[key]);
            }
        } else {
            $(this).prop('checked', false);
            $(`#${targetId}`).prop('disabled', true);
        }
    });

    $('#site-rule-editor').show();
}

async function onDeleteRuleClicked(e) {
    e.preventDefault();
    const domain = $(this).data('domain');
    if (confirm(`Delete rule for ${domain}?`)) {
        let options = await optionsLoad();
        if (options.siteRules) {
            delete options.siteRules[domain];
            await odhback().opt_optionsChanged(options);
            await optionsSave(options);
            populateSiteRules(options.siteRules);
        }
    }
}

async function onSaveRuleClicked(e) {
    e.preventDefault();
    const domain = $('#rule-domain').val().trim();
    if (!domain) return;

    let rule = {};
    $('.rule-override-cb').each(function () {
        if ($(this).prop('checked')) {
            const targetId = $(this).data('target');
            const key = targetId.replace('rule-', '');
            if (targetId === 'rule-enabled') {
                rule[key] = $(`#${targetId}`).prop('checked');
            } else {
                rule[key] = $(`#${targetId}`).val();
            }
        }
    });

    let options = await optionsLoad();
    if (!options.siteRules) options.siteRules = {};
    options.siteRules[domain] = rule;

    $('#gif-load').show();
    let newOptions = await odhback().opt_optionsChanged(options);
    await optionsSave(newOptions);
    $('.gif').hide();

    populateSiteRules(newOptions.siteRules);
    $('#site-rule-editor').hide();
}

function onExportRulesClicked(e) {
    e.preventDefault();
    const json = JSON.stringify(currentSiteRules, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'odh-site-rules.json';
    a.click();
    URL.revokeObjectURL(url);
}

function onImportRulesClicked(e) {
    e.preventDefault();
    $('#import-rules-file').click();
}

async function onImportRulesFileChanged(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async function (ev) {
        try {
            const imported = JSON.parse(ev.target.result);
            if (typeof imported !== 'object' || Array.isArray(imported)) {
                alert('Invalid format: expected a JSON object.');
                return;
            }

            let options = await optionsLoad();
            if (!options.siteRules) options.siteRules = {};

            // 合并导入的规则（同名域名覆盖）
            for (const domain in imported) {
                options.siteRules[domain] = imported[domain];
            }

            let newOptions = await odhback().opt_optionsChanged(options);
            await optionsSave(newOptions);
            populateSiteRules(newOptions.siteRules);
        } catch (err) {
            alert('Failed to parse JSON file: ' + err.message);
        }
    };
    reader.readAsText(file);
    // 重置 input 以便能再次选同一文件
    $(e.target).val('');
}

async function onReady() {
    localizeHtmlPage();
    let options = await optionsLoad();
    $('#enabled').prop('checked', options.enabled);
    $('#mouseselection').prop('checked', options.mouseselection);
    $('#hotkey').val(options.hotkey);
    $('#theme').val(options.theme || 'system');

    populateDictionary(options.dictNamelist);
    $('#dict').val(options.dictSelected);

    $('#monolingual').val(options.monolingual);
    $('#anki-preferred-audio').val(options.preferredaudio);
    $('#maxcontext').val(options.maxcontext);
    $('#maxexample').val(options.maxexample);
    $('#maxwords').val(options.maxwords);
    $('#showtoast').prop('checked', options.showtoast !== false);

    $('#services').val(options.services);
    $('#id').val(options.id);
    $('#password').val(options.password);
    $('#ankiconnecturl').val(options.ankiconnecturl);

    $('#tags').val(options.tags);
    $('#duplicate').val(options.duplicate);

    let fields = ['deckname', 'typename', 'expression', 'reading', 'extrainfo', 'definition', 'definitions', 'sentence', 'url', 'audio'];
    fields.forEach(field => {
        $(`#${field}`).val(options[field]);
    });

    $('#sysscripts').val(options.sysscripts);
    $('#udfscripts').val(options.udfscripts);
    populateSysScriptsList(options.sysscripts);
    onHiddenClicked();

    $('#login').click(onLoginClicked);
    $('#connect').click(onConnectClicked);
    $('#saveload').click(onSaveClicked);
    $('#saveclose').click(onSaveClicked);
    $('#close').click(onCloseClicked);
    $('.gif').hide();

    $('.sl-col-onoff, .sl-col-cloud').click(onScriptListChange);
    $('#hidden').click(onHiddenClicked);
    $('#typename').change(onAnkiTypeChanged);
    $('#services').change(onServicesChanged);

    updateAnkiStatus(options);

    // Init Site Rules
    populateSiteRules(options.siteRules);
    $('#btn-add-rule').click(onAddRuleClicked);
    $('#btn-close-rule').click(onCloseRuleClicked);
    $('#btn-save-rule').click(onSaveRuleClicked);
    $('.rule-override-cb').change(onOverrideCbChanged);
    $('#btn-export-rules').click(onExportRulesClicked);
    $('#btn-import-rules').click(onImportRulesClicked);
    $('#import-rules-file').change(onImportRulesFileChanged);
}

$(document).ready(utilAsync(onReady));