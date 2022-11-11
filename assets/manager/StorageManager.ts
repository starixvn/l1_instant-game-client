interface ActionStorage {
    remove: (name: string) => void;
    get: (name: string) => string;
    set: (name: string, value: string, expiresDay?: number) => void;
    isAvailable: () => boolean;
}

class LocalStorage implements ActionStorage {
    remove(name: string) {
        cc.sys.localStorage.removeItem(name);
    }

    get(name: string) {
        const storage = cc.sys.localStorage.getItem(name);
        try {
            return storage ? JSON.parse(storage) : null;
        } catch (error) {
            return storage ?? null;
        }
    }

    set(name: string, value: string) {
        cc.sys.localStorage.setItem(name, JSON.stringify(value));
    }

    isAvailable() {
        const test = "test";
        try {
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            console.log("Browser not support Local Storage");
            return false;
        }
    }
}

class Cookie implements ActionStorage {
    remove(name: string) {
        this.set(name, "", 0);
    }

    get(name: string) {
        name = name + "=";
        const cDecoded = decodeURIComponent(document.cookie);
        const cArr = cDecoded.split("; ");
        let result;
        cArr.forEach((val) => {
            if (val.indexOf(name) === 0) result = val.substring(name.length);
        });

        return result;
    }

    set(name: string, value: string, expiresDay = 1) {
        const date = new Date();
        date.setTime(date.getTime() + expiresDay * 24 * 60 * 60 * 1000);
        let expires = "expires=" + date.toUTCString();
        document.cookie = name + "=" + value + ";" + expires + ";path=/";
    }

    isAvailable() {
        return true;
    }
}

class StorageManager {
    static supportStorage: ActionStorage;

    static get() {
        if (!StorageManager.supportStorage) {
            const allStorage = [new LocalStorage(), new Cookie()];

            // default Cookie storage always is available.
            StorageManager.supportStorage = allStorage.filter((storage) => storage.isAvailable())[0];
        }

        return StorageManager.supportStorage;
    }
}

export { StorageManager };
