/**
 * Created by Devon Timaeus on 9/21/2014.
 *
 * To use this, just run a command like:
 *      browserify <input file, i.e. this> -o <output js file>
 */

var unique = require('uniq');

var data = [1, 2, 2, 3, 4, 5, 5, 5, 6];

console.log(unique(data));