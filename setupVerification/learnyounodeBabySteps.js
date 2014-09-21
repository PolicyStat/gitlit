/**
 * Created by Devon Timaeus on 9/21/2014.
 * Used for the learnyounode tutorial, just a basic application to show node.js works
 */

if (process.argv.length < 3) {
    throw "Too few arguments.\nUsage: node <this file> <arg> <arg> <arg>...";
}

var sum = 0;

for(var i = 2; i < process.argv.length ; i++) {
    sum += Number(process.argv[i]);
}

console.log(sum);