async function sendtoBackend(request){
    return new Promise((resolve, reject)=>{
        try {
            if (!chrome.runtime || !chrome.runtime.sendMessage) {
                resolve(null);
                return;
            }
            chrome.runtime.sendMessage(request, result => {
                if (chrome.runtime.lastError) {
                    resolve(null);
                    return;
                }
                resolve(result);
            });
        } catch (err) {
            resolve(null);
        }
    });
}

async function isConnected(){
    try {
        return await sendtoBackend({action:'isConnected', params:{}});
    } catch (err) {
        return null;
    }
}

async function getTranslation(expression){
    try {
        return await sendtoBackend({action:'getTranslation', params:{expression}});
    } catch (err) {
        return null;
    }
}

async  function addNote(notedef){
    try {
        return await sendtoBackend({action:'addNote',params:{notedef}});
    } catch (err) {
        return null;
    }
}

async  function playAudio(url){
    try {
        return await sendtoBackend({action:'playAudio',params:{url}});
    } catch (err) {
        return null;
    }
}