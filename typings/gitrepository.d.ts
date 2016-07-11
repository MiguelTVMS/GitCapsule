/** The options for the repository instance. */
declare interface RepositoryOptions {
    /** 
     * If the base path should be prepared. 
     * This means if the folder exists will be deleted and recreated and if not it will be created.
     */
    prepareBasePath: boolean;
}

declare interface baseResponse {
    raw: string;
    lines: string[];
}

declare interface cloneResponse extends baseResponse { }
declare interface fetchResponse extends baseResponse { }
declare interface checkoutResponse extends baseResponse { }

declare interface statusResponse extends baseResponse {
    isRepository: boolean;
}

declare interface pullResponse extends baseResponse {
    alreadyUpToDate: boolean;
}

declare interface latestCommitResponse extends baseResponse {
    commit: string;
}


declare module gitrepository {
    export interface GitRepository {
        /**
         * Represents the command "git clone <url> <path>"
         * @param  {string} repositoryUrl
         * @param  {(error:gitcapsuleerrors.GitCommandError,response:any)=>void} [callback]
         */
        clone(repositoryUrl: string, callback?: (error: gitcapsuleerrors.GitCommandError, response: cloneResponse) => void): void;

        /**
         * Represents the command "git fetch"
         * @param  {(error:gitcapsuleerrors.GitCommandError,response:any)=>void} [callback]
         */
        fetch(callback?: (error: gitcapsuleerrors.GitCommandError, response: fetchResponse) => void): void;

        /**
         * Represents the command "git pull"
         * @param  {(error:gitcapsuleerrors.GitCommandError,response:pullResponse)=>void} [callback]
         */
        pull(callback?: (error: gitcapsuleerrors.GitCommandError, response: pullResponse) => void): void;

        /**
         * Represents the command  "git rev-parse --verify HEAD"
         * @param  {(error:gitcapsuleerrors.GitCommandError,response:latestCommitResponse)=>void} [callback]
         */
        getLatestCommit(callback?: (error: gitcapsuleerrors.GitCommandError, response: latestCommitResponse) => void): void;

        /**
         * Represents the command "git checkout <branchName>"
         * @param  {string} branchName
         * @param  {(error:gitcapsuleerrors.GitCommandError,response:checkoutResponse)=>void} [callback]
         */
        checkout(branchName: string, callback?: (error: gitcapsuleerrors.GitCommandError, response: checkoutResponse) => void): void;

        /**
         * Represents the command "git status"
         * @param {(error: gitcapsuleerrors.GitCommandError, response: statusResponse) => void} [callback]
         */
        status(callback?: (error: gitcapsuleerrors.GitCommandError, response: statusResponse) => void): void;
    }


}

declare module "gitrepository" {
    export = gitrepository;
}