/// <reference path="../typings/index.d.ts" />

const gitCapsule = require("../lib/index.js");

var gitRepository = gitCapsule.createGitRepository("/repo/testAll");

gitRepository.pull();