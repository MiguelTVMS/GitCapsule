declare module gitcapsuleerrors {
    export interface GitCommandError extends Error {
        name: any;
        message: string;
        output: string;
        args: string[];

        /**
         * Get the string representation of the error
         * @returns string
         */
        toString(): string;
    }

    /**
     * Create a new GitCommandError.
     * @param  {string} message? The error message.
     * @param  {string} output? The output from the command.
     * @param  {string[]} args? The 
     * @returns GitCommandError
     */
    export function createGitCommandError(message?: string, output?: string, args?: string[]): GitCommandError;
}

declare module "gitcapsuleerrors" {
    export = gitcapsuleerrors;
}