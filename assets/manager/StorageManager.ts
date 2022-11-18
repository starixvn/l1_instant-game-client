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

class Memory implements ActionStorage {
    remove(name: string) {
        window[name] = "";
    }

    get(name: string) {
        return window[name] ? JSON.parse(window[name]) : null;
    }

    set(name: string, value: string) {
        window[name] = JSON.stringify(value);
    }

    isAvailable() {
        return true;
    }
}

class StorageManager {
    static supportStorage: ActionStorage;

    static get() {
        if (!StorageManager.supportStorage) {
            const allStorage = [new LocalStorage(), new Memory()];

            // default Memory storage always is available.
            StorageManager.supportStorage = allStorage.filter((storage) => storage.isAvailable())[0];
        }

        return StorageManager.supportStorage;
    }
}

export { StorageManager };
