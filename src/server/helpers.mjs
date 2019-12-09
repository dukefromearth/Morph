/*jshint esversion: 6 */

export function createArray(length,fill) {
    var arr = new Array(length);
    for (var i = 0; i < length; i++) {
        for (var j = 0; j < length; j++){
            arr[i] = new Array(length).fill(fill);
        }
    }
    return arr;
}