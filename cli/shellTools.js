/**
 * Created by Devon Timaeus on 12/16/2014.
 */

var deasync = require("deasync");

function shellOut(command){
    var exec = require('child_process').exec;
    try {
        var execSync = deasync(exec);
        var output = execSync(command);
    } catch (err) {
        console.log(err);
    }
    return output;

}

function gitRepoCreation(repoPath){
    var command = '';

    command += 'cd ' + repoPath + ' && ';
    command += 'git init ' + ' && ';
    command += 'git add -A .' + ' && ';
    command += 'git -c user.name=\'psychic-octo-robot\' -c user.email=\'psychic-octo-robot@example.com\' ' +
        'commit -m \" repo initialized \" --allow-empty';
    shellOut(command);
}

function gitCommit(repoPath, commitMessage){
    var command = '';

    var message = commitMessage || 'repo initialized';

    command += 'cd ' + repoPath + ' && ';
    command += 'git add -A .' + ' && ';
    command += 'git -c user.name=\'psychic-octo-robot\' -c user.email=\'psychic-octo-robot@example.com\' commit -m \"'
        + message + '\" --allow-empty';
    shellOut(command);
}

// checking out to a commit
function checkoutToCommit(repoPath, commit) {
    var command = '';
    command += 'cd ' + repoPath + '&& ';
    command += 'git checkout ' + commit;
    shellOut(command);
}


module.exports = {
    shellOut: shellOut,
    gitCommit: gitCommit,
    gitRepoCreation: gitRepoCreation,
    checkoutToCommit: checkoutToCommit
};