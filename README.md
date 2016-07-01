# GitCapsule
Git client on nodejs

**This package is in development and is very unstable as this point.**

### Status
Latest Version: [![npm version](https://badge.fury.io/js/gitcapsule.svg)](https://badge.fury.io/js/gitcapsule)

| Branch   | Build status |
|----------|:------------:|
| master   | [![Build Status](https://travis-ci.org/jmtvms/GitCapsule.svg?branch=master)](https://travis-ci.org/jmtvms/GitCapsule)  |
| develop  | [![Build Status](https://travis-ci.org/jmtvms/GitCapsule.svg?branch=develop)](https://travis-ci.org/jmtvms/GitCapsule)  |

### Requirements
This package uses the git CLI. You must to have it installed on your machine to use this module. Go [here](https://git-scm.com/) to download it.

### installation   
This package is meant to be used by other nodejs applications and it's published on [NPM](https://www.npmjs.com/package/gitcapsule)   
```sh
    $ npm install gitcapsule
```

#### Changes
* More documentation.
* _npm test_ command is now working.
* New checkout functionality.

### Examples
This example shows a basic flow using gitcapsule
```javascript
const gitCapsule = require("gitcapsule");

var repositoryOptions = {
    "prepareBasePath": true
}

var gitRepository = gitCapsule.createGitRepository("/repo/testAll", repositoryOptions)
gitRepository.on("cloned", function (data) {
    var latestCommit = "";
    gitRepository.fetch(function (error, data) {
        if (error !== null) {
            console.error(error.toString());
            process.abort();
        }

        gitRepository.checkout("develop");
    });
});

gitRepository.on("checkedout", function (data) {
    gitRepository.pull(function (error, data) {
        if (error !== null) {
            console.error(error.toString());
            process.abort();
        }

        gitRepository.getLatestCommit(function (error, data) {
            if (error !== null) {
                console.error(error.toString());
                process.abort();
            }

            latestCommit = data.commit;
            console.log("Latest commit: " + latestCommit);
            process.exit();
        })
    });
});

gitRepository.on("error", function (error) {
    console.error(error.toString());
});

gitRepository.clone("https://github.com/jmtvms/GitCapsule.git");
```

### Available events
Those are the available events on the GitRepository. Those events may be used in place of the callback functions, since those are optional.
* _**error**_ - When a error occurs on any command.
* _**cloned**_ - When the **clone(sting, Function(error, cloneResponse))** function is terminated successfuly.
* _**fetched**_ - When the **fetch(Function(error, fetchResponse))** function is terminated successfuly.
* _**pulled**_ - When the **pull(Function(error, pullResponse))** function is terminated successfuly.
* _**gotLatestCommit**_ - When the **getLatestCommit(Function(error, latestCommitResponse))** function is terminated successfuly.
* _**checkedOut**_ - When the **checkout(sting, Function(error, checkoutResponse))** function is terminated successfuly.

### Responses
Those responses are passes on the callback or event functions
* _**baseResponse**_ - All responses derive from this response and have this fieds available.
    * The responses **cloneResponse**, **fetchResponse** and **checkoutResponse** are exactly equal to _baseResponse_.
```typescript
{
    raw: string; //The raw output from the git CLI
    lines: string[]; //The output from the git CLI splited in lines.
}
```
* _**pullResponse**_
```typescript
{
    //...baseResponse fields...
     alreadyUpToDate: boolean; //If the local repository is already up to date with the remote.
}
```
* _**latestCommitResponse**_
```typescript
{
    //...baseResponse fields...
     commit: string; //The hash that identify the HEAD commit.
}
```

##### Help us to make this the best GIT package for node.   
To contribute to this package, just ask us or create a pull request.
