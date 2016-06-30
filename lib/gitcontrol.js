'use strict';

// Modules
const execFile = require("child_process").execFile;
const fs = require('fs');
const url = require("url");
const util = require("util");
const eventEmitter = require('events').EventEmitter;
const path = require('path');
const debuglog = util.debuglog('gitcontrol');

/**
 * @param  {String} repositoryUrl Url from the GIT repository
 */
var GitControl = function (repositoryUrl, basePath) {
    eventEmitter.call(this);

    validateUrl(repositoryUrl)

    var self = this;
    this._repositoryUrl = repositoryUrl;
    this._basePath = path.resolve(__dirname, basePath);
    this._environmentReady = false;

    prepareBasePath(this._basePath);

    this._childProcessOptions = {
        //encoding: 'utf8',
        //timeout: 0,
        //maxBuffer: 200 * 1024,
        //killSignal: 'SIGTERM',
        //env: null,
        cwd: this._basePath
    }

    this.on('newListener', function (listener) {
        debuglog('StartApp event listener: %s', listener);
    });
}
util.inherits(GitControl, eventEmitter);


//git clone <url> <path>
GitControl.prototype.clone = function (callback) {
    var self = this;
    var args = ["clone", self._repositoryUrl, self._basePath];

    console.log(util.format('Cloning "%s" to "%s"', self._repositoryUrl, self._basePath));
    executeGitCommand(self, args, function (error, data) {
        var err = null;
        if (error !== null) {
            err = new Error(util.format('clone ERROR: %s', error));
            debuglog(err);
            self.emit("error", err);
        } else {
            self.emit("cloned", self._basePath);
        }

        if (typeof (callback) !== 'undefined')
            callback(err, self._basePath);
    });
}

//git fetch
GitControl.prototype.fetch = function (callback) {
    var self = this;
    var args = ["fetch"];

    console.log(util.format('Fetching information from "%s"', self._repositoryUrl));
    executeGitCommand(self, args, function (error, data) {
        var err = null;
        if (error !== null) {
            err = new Error(util.format('fetch ERROR: %s', error));
            debuglog(err);
            self.emit("error", err);
        } else {
            self.emit("fetched", data);
        }

        if (typeof (callback) !== 'undefined')
            callback(err, data);
    });
}

//git pull
GitControl.prototype.pull = function (callback) {
    var self = this;
    var args = ["pull"];

    console.log(util.format('Pulling changes from "%s"', self._repositoryUrl));
    executeGitCommand(self, args, function (error, data) {
        var err = null;
        if (error !== null) {
            err = new Error(util.format('pull ERROR: %s', error));
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
 * @param  {Function} callback Callback function that will be called on the end of the proces: function(error, data)
 */
GitControl.prototype.getLatestCommit = function (callback) {
    var self = this;
    var args = ["rev-parse", "--verify", "HEAD"];

    executeGitCommand(self, args, function (error, data) {
        var err = null;
        if (error !== null) {
            err = new Error(util.format('rev-parse ERROR: %s', error));
            debuglog(err);
            self.emit("error", err);
        } else {
            self.emit("gotLatestCommit", processRevParsedResponse(data));
        }

        if (typeof (callback) !== 'undefined')
            callback(err, processRevParsedResponse(data));
    });
}

function processRevParsedResponse(data) {
    if (typeof (data) === 'undefined' || data.length <= 0)
        return null;

        var response = {};

        response.commit = data.trim();

        return response;
}

function processPullResponse(data) {
    if (typeof (data) === 'undefined' || data.length <= 0)
        return null;

    var response = {};

    response.alreadyUpToDate = (data.indexOf("Already up-to-date.") >= 0);

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
        fs.mkdirSync(path);
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
    if (typeof (args) === 'undefined') {
        throw new Error("The args parameter must be defined.");
    }

    if (typeof (callback) === 'undefined') {
        throw new Error("The callback parameter must be defined.");
    }

    var child = execFile("git", args, self._childProcessOptions, function (error, stdout, stderr) {
        var err = null;

        if (error !== null) {
            err = new Error(util.format('execFile ERROR: %s', error));
            debuglog(err);
        }

        callback(err, stdout.trim() + stderr.trim());
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
 * @param  {String} repositoryUrl Url from the GIT repository
 */
function createGitControl(repositoryUrl) {
    return new GitControl(repositoryUrl, "/repo");
}



module.exports = {
    GitControl: GitControl,
    createGitControl: createGitControl
}

