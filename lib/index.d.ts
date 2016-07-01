/// <reference path="../typings/index.d.ts" />
/// <reference path="gitcapsuleerrors.d.ts" />
/// <reference path="gitrepository.d.ts" />

declare module gitcapsule {
    export var GitRepository: gitrepository.GitRepository;
    export var GitCommandError: gitcapsuleerrors.GitCommandError;

    /**
     * Create a instance of a GitCapsule.
     * @param  {string} basePath The path where the repository will be stored locally.
     * @param  {RepositoryOptions} options? the repository options that will be used.
     * @returns gitrepository.GitRepository
     */
    export function createGitRepository(basePath: string, options?: RepositoryOptions): gitrepository.GitRepository;
}

declare module "gitcapsule" {
    export = gitcapsule;
}

