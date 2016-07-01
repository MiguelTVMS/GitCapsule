# GitCapsule
Git client on nodejs

**This package is in development and is very unstable as this point.**

### Requirements
This package uses the git CLI. You must to have it installed on your machine to use this module. Go [here](https://git-scm.com/) to download it.

### installation   
This package is meant to be used by other nodejs applications and it's published on [NPM](https://www.npmjs.com/package/gitcapsule)   
[![npm version](https://badge.fury.io/js/gitcapsule.svg)](https://badge.fury.io/js/gitcapsule)

```sh
    $ npm install gitcapsule
```
#### Changes
* Better documentation.
* Changed the module js name.
* Fixed the tests to work again.

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
* _**cloned**_ - When the **clone(sting, Function(error, data))** function is terminated successfuly.
* _**fetched**_ - When the **fetch(Function(error, data))** function is terminated successfuly.
* _**pulled**_ - When the **pull(Function(error, data))** function is terminated successfuly.
* _**gotLatestCommit**_ - When the **getLatestCommit(Function(error, data))** function is terminated successfuly.
* _**checkedOut**_ - When the **checkout(sting, Function(error, data))** function is terminated successfuly.

##### Help us to make this the best GIT package for node.   
To contribute to this package, just ask us or create a pull request.
