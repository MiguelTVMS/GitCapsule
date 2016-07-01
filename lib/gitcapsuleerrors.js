/// <reference path="gitcapsuleerrors.d.ts" />
'use strict';

const util = require('util');
const debuglog = util.debuglog('gitcapsule');

var GitCommandError = function (message, output, args) {
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.message = message;
    this.output = output;
    this.args = args;

    /**
     * Get the string representation of the error
     * @returns string
     */
    var toString = function () {
        var errorString = "ERROR GitCommandError";

        if (Array.isArray(args)) {
            errorString += "\nARGS: " + args.join(" ");
        }

        if (typeof (output) !== "undefined" && output.length > 0) {
            errorString += "\nOUTPUT: \n" + output;
        }

        return errorString;
    }

    debuglog(this.toString())
};
util.inherits(GitCommandError, Error);

/**
 * Create a new gitCommandError.
 * @param  {string} message? The error message that will be shown.
 * @param  {string} output? The command output.
 * @param  {string[]} args? The arguments passed to the git command.
 * @returns gitCommandError
 */
function createGitCommandError(message, output, args) {
    return new GitCommandError(message, output, args);
}

module.exports = {
    GitCommandError: GitCommandError,
    createGitCommandError: createGitCommandError
}