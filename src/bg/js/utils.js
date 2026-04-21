function sanitizeOptions(options) {
    const defaults = {
        enabled: true,
        mouseselection: true,
        hotkey: '16', // 0:off , 16:shift, 17:ctrl, 18:alt
        maxcontext: '1',
        maxexample: '2',
        maxwords: '0', // 0: unlimited
        showtoast: true,
        theme: 'system', // 'system', 'light', 'dark'
        monolingual: '0', //0: bilingual 1:monolingual
        preferredaudio: '0',
        services: 'none',
        id: '',
        password: '',

        duplicate: '1', // 0: not allowe duplicated cards; 1: allowe duplicated cards;
        tags: 'ODH',
        deckname: 'Default',
        typename: 'Basic',
        expression: 'Front',
        reading: '',
        extrainfo: '',
        definition: 'Back',
        definitions: '',
        sentence: '',
        url: '',
        audio: '',

        sysscripts: 'builtin_encn_Collins,general_Makenotes,cncn_Zdic,encn_Collins,encn_Cambridge,encn_Cambridge_tc,encn_Oxford,encn_Oxford_bing,encn_LDOCE5MDX,encn_Youdao,encn_Baicizhan,enen_Collins,enen_LDOCE6MDX,enen_UrbanDict,enfr_Cambridge,enfr_Collins,fren_Cambridge,fren_Collins,esen_Spanishdict,decn_Eudict,escn_Eudict,frcn_Eudict,frcn_Youdao,rucn_Qianyi,itcn_Dict',
        udfscripts: '',

        dictSelected: '',
        dictNamelist: [],

        siteRules: {}, // 网站规则：域名 -> 局部覆盖配置
    };

    for (const key in defaults) {
        if (!options.hasOwnProperty(key)) {
            options[key] = defaults[key];
        }
    }

    // 增量合并新补充的系统词典（针对有历史缓存的老用户）
    if (options.sysscripts) {
        let existing = options.sysscripts.split(',');
        let def = defaults.sysscripts.split(',');
        let missing = def.filter(x => !existing.includes(x));
        if (missing.length > 0) {
            options.sysscripts += ',' + missing.join(',');
        }
    }

    return options;
}

// 网站规则：Hostname 后缀匹配，返回最长（最具体）匹配的域名，无匹配返回 null
function matchSiteRule(hostname, siteRules) {
    if (!hostname || !siteRules) return null;
    let bestMatch = null;
    for (const domain in siteRules) {
        if (hostname === domain || hostname.endsWith('.' + domain)) {
            if (!bestMatch || domain.length > bestMatch.length)
                bestMatch = domain;
        }
    }
    return bestMatch;
}

// 合并全局配置与网站规则，返回生效配置（不修改原对象）
function getEffectiveOptions(globalOptions, hostname) {
    const domain = matchSiteRule(hostname, globalOptions.siteRules);
    if (!domain) return globalOptions;
    const rule = globalOptions.siteRules[domain];
    const merged = Object.assign({}, globalOptions);
    const OVERRIDABLE = ['enabled', 'dictSelected', 'maxwords', 'ankiconnecturl', 'deckname', 'typename', 'tags', 'duplicate'];
    for (const key of OVERRIDABLE) {
        if (rule.hasOwnProperty(key)) merged[key] = rule[key];
    }
    return merged;
}

async function optionsLoad() {
    // 从 local 读取全部基础配置
    const localOpts = await new Promise((resolve) => {
        chrome.storage.local.get(null, (result) => resolve(result));
    });

    // 从 sync 读取云端 siteRules（云端优先）
    let syncRules = {};
    try {
        const syncData = await new Promise((resolve) => {
            chrome.storage.sync.get('siteRules', (result) => resolve(result));
        });
        if (syncData && syncData.siteRules) {
            syncRules = syncData.siteRules;
        }
    } catch (e) {
        // sync 不可用时静默回退到 local
        console.warn('storage.sync read failed, falling back to local:', e);
    }

    // 合并：sync 中的 siteRules 覆盖 local 中的
    const merged = Object.assign({}, localOpts);
    if (Object.keys(syncRules).length > 0) {
        merged.siteRules = syncRules;
    }

    return sanitizeOptions(merged);
}

async function optionsSave(options) {
    const sanitized = sanitizeOptions(options);

    // 将 siteRules 写入 sync（云端同步）
    try {
        await new Promise((resolve, reject) => {
            chrome.storage.sync.set({ siteRules: sanitized.siteRules || {} }, () => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve();
                }
            });
        });
    } catch (e) {
        console.warn('storage.sync write failed, siteRules saved to local only:', e);
    }

    // 全部配置（含 siteRules 副本）写入 local 作为兜底缓存
    await new Promise((resolve) => {
        chrome.storage.local.set(sanitized, () => resolve());
    });
}

function utilAsync(func) {
    return function(...args) {
        func.apply(this, args);
    };
}

function odhback() {
    return chrome.extension.getBackgroundPage().odhback;
}

function localizeHtmlPage() {
    for (const el of document.querySelectorAll('[data-i18n]')) {
        el.innerHTML = chrome.i18n.getMessage(el.getAttribute('data-i18n'));
    }
}