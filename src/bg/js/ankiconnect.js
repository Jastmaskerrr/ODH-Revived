class Ankiconnect {
    constructor() {
        this.version = 6;
        this.url = 'http://127.0.0.1:8765';
    }

    initConnection(options) {
        if (options.ankiconnecturl) {
            this.url = options.ankiconnecturl;
        }
    }

    async ankiInvoke(action, params = {}, timeout = 3000) {
        let version = this.version;
        let request = { action, version, params };
        return new Promise((resolve, reject) => {
            $.ajax({
                url: this.url,
                type: 'POST',
                data: JSON.stringify(request),
                timeout,
                contentType: 'application/json; charset=utf-8',
                dataType: 'json',
                success: (response) => {
                    try {
                        if (Object.getOwnPropertyNames(response).length != 2) {
                            throw 'response has an unexpected number of fields';
                        }
                        if (!response.hasOwnProperty('error')) {
                            throw 'response is missing required error field';
                        }
                        if (!response.hasOwnProperty('result')) {
                            throw 'response is missing required result field';
                        }
                        if (response.error) {
                            throw response.error;
                        }
                        resolve(response.result);
                    } catch (e) {
                        reject(e);
                    }
                },
                error: (xhr, status, err) => resolve(null),
            });
        });
    }

    async addNote(note) {
        if (!note) return { success: false, duplicate: false };
        try {
            let result = await this.ankiInvoke('addNote', { note });
            return { success: true, noteId: result, duplicate: false };
        } catch (err) {
            const errStr = String(err).toLowerCase();
            const isDuplicate = errStr.includes('duplicate');
            return { success: false, noteId: null, duplicate: isDuplicate, error: String(err) };
        }
    }

    async getDeckNames() {
        return await this.ankiInvoke('deckNames');
    }

    async getModelNames() {
        return await this.ankiInvoke('modelNames');
    }

    async getModelFieldNames(modelName) {
        return await this.ankiInvoke('modelFieldNames', { modelName });
    }

    async findNotes(query) {
        return await this.ankiInvoke('findNotes', { query });
    }

    async deleteNotes(noteIds) {
        return await this.ankiInvoke('deleteNotes', { notes: noteIds });
    }

    async getVersion() {
        let version = await this.ankiInvoke('version', {}, 100);
        return version ? 'ver:' + version : null;
    }
}