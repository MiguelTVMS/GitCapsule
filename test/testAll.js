const gitCapsule = require("../lib/index.js");

var repositoryOptions = {
    "prepareBasePath": true
}

var gitRepository = gitCapsule.createGitRepository("testrepo/testall", repositoryOptions)


function fetchRespository() {
    gitRepository.fetch(function (error, data) {
        if (error !== null) {
            console.error(error.toString());
            process.abort();
        }

        gitRepository.checkout("develop");
    });
}

gitRepository.on("cloned", function (data) {
    fetchRespository()
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

gitRepository.status(function (error, data) {
    if (error !== null) {
        console.error(error.toString());
        process.abort();
    }

    if (data.isRepository)
        fetchRespository();
    else
        gitRepository.clone("https://github.com/jmtvms/GitCapsule.git");
})