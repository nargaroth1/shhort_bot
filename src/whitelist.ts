export class Whitelist {
    users: number[];
    path: string;

    constructor(path: string) {
        this.path = path;
        try {
            const ids = (getJsonSync(path) as number[]);
            this.users = ids;
        } catch (ex) {
            this.users = []
        }
    }

    addUser(id: number): boolean {
        if (!this.users.includes(id)) {
            this.users.push(id);
            return this.saveWhitelist();
        }
        return false;
    }

    removeUser(id: number): boolean {
        if (this.users.includes(id)) {
            this.users = this.users.filter((user) => user != id);
            return this.saveWhitelist();
        }
        return false;
    }

    isWhitelisted(id: number): boolean {
        return this.users.includes(id)
    }

    saveWhitelist(): boolean {
        try {
            Deno.writeTextFileSync(this.path, JSON.stringify(this.users));
            return true;
        } catch(ex) {
            return false;
        }
    }
}

function getJsonSync(filePath: string) {
    return JSON.parse(Deno.readTextFileSync(filePath));
}