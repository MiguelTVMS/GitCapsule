'use strict';

// Modules
const execFile = require("child_process").execFile;
const fs = require('fs');
const url = require("url");
const util = require("util");
const eventEmitter = require('events').EventEmitter;
const path = require('path');
const debuglog = util.debuglog('gitcapsule');
const gitCapsuleErrors = require("./gitcapsuleerrors.js");
const mkdirp = require("mkdirp");

var defaultRepositoryOptions = {
    "prepareBasePath": false
}

/**
 * Git repository object
 */
var GitRepository = function () {
    eventEmitter.call(this);
    var self = this;
}
util.inherits(GitRepository, eventEmitter);

function configureGitRepository(repository, basePath, options) {
    repository._basePath = path.resolve(__dirname, basePath);

    repository._childProcessOptions = {
        //encoding: 'utf8',
        //timeout: 0,
        //maxBuffer: 200 * 1024,
        //killSignal: 'SIGTERM',
        //env: null,
        cwd: repository._basePath
    }

    repository.on('newListener', function (listener) {
        debuglog('StartApp event listener: %s', listener);
        var availableListeners = ["error", "cloned", "fetched", "pulled", "gotLatestCommit", "checkedout", "gotStatus"];
    });

    if (options.prepareBasePath) {
        prepareBasePath(repository._basePath);
    }
}

/**
 * Represents the command "git clone <url> <path>"
 * @param  {string} repositoryUrl
 * @param  {(error:gitcapsuleerrors.GitCommandError,response:any)=>void} [callback]
 */
GitRepository.prototype.clone = function (repositoryUrl, callback) {
    if (typeof (repositoryUrl) === 'undefined')
        throw new TypeError("repositoryUrl cannot be " + typeof (repositoryUrl))

    validateUrl(repositoryUrl)

    var self = this;
    var args = ["clone", repositoryUrl, self._basePath];

    console.log(util.format('Cloning "%s" to "%s"', repositoryUrl, self._basePath));
    executeGitCommand(self, args, function (error, data) {
        var err = null;
        if (error !== null) {
            err = gitCapsuleErrors.createGitCommandError(util.format('clone ERROR: %s', error), data, args);
            debuglog(err);
            self.emit("error", err);
        } else {
            self.emit("cloned", processCloneResponse(data));
        }

        if (typeof (callback) !== 'undefined')
            callback(err, processCloneResponse(data));
    });
}

/**
 * Represents the command "git fetch"
 * @param  {(error:gitcapsuleerrors.GitCommandError,response:any)=>void} [callback]
 */
GitRepository.prototype.fetch = function (callback) {
    var self = this;
    var args = ["fetch"];

    console.log("Fetching information.");
    executeGitCommand(self, args, function (error, data) {
        var err = null;
        if (error !== null) {
            err = gitCapsuleErrors.createGitCommandError(util.format('fetch ERROR: %s', error), data, args);
            debuglog(err);
            self.emit("error", err);
        } else {
            self.emit("fetched", processFetchResponse(data));
        }

        if (typeof (callback) !== 'undefined')
            callback(err, processFetchResponse(data));
    });
}

/**
 * Represents the command "git pull"
 * @param  {(error:gitcapsuleerrors.GitCommandError,response:pullResponse)=>void} [callback]
 */
GitRepository.prototype.pull = function (callback) {
    var self = this;
    var args = ["pull"];

    console.log("Pulling changes.");
    executeGitCommand(self, args, function (error, data) {
        var err = null;
        if (error !== null) {
            err = gitCapsuleErrors.createGitCommandError(util.format('pull ERROR: %s', error));
            debuglog(err);
            self.emit("error", err);
        } else {
            self.emit("pulled", processPullResponse(data));
        }

        if (typeof (callback) !== 'undefined')
            callback(err, processPullResponse(data));
    });
}

/**
 * Represents the command  "git rev-parse --verify HEAD"
 * @param  {(error:gitcapsuleerrors.GitCommandError,response:latestCommitResponse)=>void} [callback]
 */
GitRepository.prototype.getLatestCommit = function (callback) {
    var self = this;
    var args = ["rev-parse", "--verify", "HEAD"];

    executeGitCommand(self, args, function (error, data) {
        var err = null;
        if (error !== null) {
            err = gitCapsuleErrors.createGitCommandError(util.format('rev-parse ERROR: %s', error), data, args);
            debuglog(err);
            self.emit("error", err);
        } else {
            self.emit("gotLatestCommit", processRevParsedResponse(data));
        }

        if (typeof (callback) !== 'undefined')
            callback(err, processRevParsedResponse(data));
    });
}

/**
 * Represents the command "git checkout <branchName>"
 * @param  {string} branchName
 * @param  {(error:gitcapsuleerrors.GitCommandError,response:checkoutResponse)=>void} [callback]
 */
GitRepository.prototype.checkout = function (branchName, callback) {
    var self = this;
    var args = ["checkout", branchName];

    console.log("Checking out branch \"%s\".", branchName);
    executeGitCommand(self, args, function (error, data) {
        var err = null;
        if (error !== null) {
            err = gitCapsuleErrors.createGitCommandError(util.format('checkout ERROR: %s', error), data, args);
            debuglog(err);
            self.emit("error", err);
        } else {
            self.emit("checkedout", processCheckoutResponse(data));
        }

        if (typeof (callback) !== 'undefined')
            callback(err, processCheckoutResponse(data));
    });
}


/**
 * Represents the command "git status"
 * @param {(error: gitcapsuleerrors.GitCommandError, response: statusResponse) => void} [callback]
 */
GitRepository.prototype.status = function (callback) {
    var self = this;
    var args = ["status"];

    console.log("Checking repository status.");
    executeGitCommand(self, args, function (error, data) {
        var notRepositoryError = data.indexOf("Not a git repository") >= 0;

        if (notRepositoryError)
            error = null;

        var err = null;
        if (error !== null) {
            err = gitCapsuleErrors.createGitCommandError(util.format('status ERROR: %s', error), data, args);
            debuglog(err);
            self.emit("error", err);
        } else {
            self.emit("gotStatus", processStatusResponse(data));
        }

        if (typeof (callback) !== 'undefined')
            callback(err, processStatusResponse(data));
    });
}

function processCloneResponse(data) {
    var response = processBaseResponse(data)
    if (typeof (data) === 'undefined' || data.length <= 0)
        return response;

    //TODO: Make que process

    return response;
}

function processRevParsedResponse(data) {
    var response = processBaseResponse(data)
    if (typeof (data) === 'undefined' || data.length <= 0)
        return response;

    response.commit = data.trim();

    return response;
}

function processStatusResponse(data) {
    var response = processBaseResponse(data);
    if (typeof (data) === 'undefined' || data.length <= 0)
        return response;

    response.isRepository = (data.indexOf("Not a git repository") < 0);

    return response;
}

function processCheckoutResponse(data) {
    var response = processBaseResponse(data);
    if (typeof (data) === 'undefined' || data.length <= 0)
        return response;

    //TODO: Make que process

    return response;
}

function processPullResponse(data) {
    var response = processBaseResponse(data)
    if (typeof (data) === 'undefined' || data.length <= 0)
        return response;

    response.alreadyUpToDate = (data.indexOf("Already up-to-date.") >= 0);

    return response;
}

function processBaseResponse(data) {
    var response = {
        "raw": null,
        "lines": []
    };

    if (typeof (data) === 'undefined' || data.length <= 0)
        return response;

    response.raw = data;

    if (data.indexOf("\n") >= 0)
        response.lines = data.split("\n");
    else
        response.lines = [data];

    return response;
}

function processFetchResponse(data) {
    var response = processBaseResponse(data);
    if (typeof (data) === 'undefined' || data.length <= 0)
        return response;

    //TODO: Make que process

    return response;
}

function prepareBasePath(path) {

    try {
        if (fs.existsSync(path)) {
            console.log('Removing folder "%s"', path);
            deleteFolderRecursive(path);
            console.log('Folder "%s" removed', path);
        }

        console.log('Creating folder "%s"', path);
        mkdirp.sync(path);
        console.log('Folder "%s" created', path);

    } catch (error) {
        if (error !== null) {
            var err = new Error(util.format("Error preparing the base path: %s", error));
            console.error(err)
            throw err;
        }
    }
}

function deleteFolderRecursive(path) {
    if (fs.existsSync(path)) {
        fs.readdirSync(path).forEach(function (file, index) {
            var curPath = path + "/" + file;
            if (fs.lstatSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
}

function executeGitCommand(self, args, callback) {
    if (typeof (args) === 'undefined')
        throw new TypeError("args cannot be " + typeof (args))

    if (typeof (callback) === 'undefined')
        throw new TypeError("callback cannot be " + typeof (callback))

    debuglog("EXECUTING => git " + args.join(" "));

    /**
     * 
     * 
     * @param {any} error
     * @param {any} stdout
     * @param {any} stderr
     */
    var child = execFile("git", args, self._childProcessOptions, function (error, stdout, stderr) {
        var err = null;

        if (error !== null) {
            err = new Error(util.format('execFile ERROR: %s', error));
            debuglog(err);
        }

        callback(err, stdout.trim() + "\n" + stderr.trim());
    });
    monitorChildProcess(child);

    return child;
}

function monitorChildProcess(child) {

    child.stdin.on('data', function (data) {
        debuglog("STDIN => %s", data);
    });

    child.stdout.on('data', function (data) {
        debuglog("STDOUT => %s", data);
    });

    child.stderr.on('data', function (data) {
        debuglog("STDERR => %s", data);
    });
}

function validateUrl(repositoryUrl) {

    try {
        var result = url.parse(repositoryUrl);
        if (typeof (result) === "undefined")
            throw new Error("Repository url is not valid.");
    } catch (error) {
        debuglog(error);
        throw new Error("Repository url is not valid.");
    }

}

/**
 * Create a instance of a GitCapsule.
 * @param  {string} basePath The path where the repository will be stored locally.
 * @param  {RepositoryOptions} options? the repository options that will be used.
 * @returns GitRepository
 */
function createGitRepository(basePath, options) {
    if (typeof (options) === "undefined")
        options = defaultRepositoryOptions;

    var gitRepository = new GitRepository();
    configureGitRepository(gitRepository, basePath, options);
    return gitRepository;
}

module.exports = {
    GitRepository: GitRepository,
    createGitRepository: createGitRepository
}

