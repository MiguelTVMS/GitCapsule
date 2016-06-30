
const gitControl = require('./lib/gitcontrol');

var gitRepository = gitControl.createGitControl("https://github.com/jmtvms/GitCapsule.git");

gitRepository.on("cloned", function (path) {
var latestCommit = "";
    gitRepository.fetch(function (error, data) {
        gitRepository.pull(function(error,data){
            gitRepository.getLatestCommit(function(error,data){
                latestCommit = data.commit;
                console.log("Latest commit:" + latestCommit);
            })
        })
    });
});

gitRepository.clone();