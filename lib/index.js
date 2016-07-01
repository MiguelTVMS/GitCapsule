/// <reference path="gitrepository.d.ts" />
/// <reference path="gitcapsuleerrors.d.ts" />
/// <reference path="index.d.ts" />
'use strict';

const gitRepository = require("./gitrepository.js");
const gitCapsuleErrors = require("./gitcapsuleerrors.js");

module.exports = {
    GitRepository: gitRepository.GitRepository,
    GitCommandError: gitCapsuleErrors.GitCommandError,
    createGitRepository: gitRepository.createGitRepository,
}