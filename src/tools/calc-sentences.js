/**
 * Recursively counts the number of sentences in an object
 * @param obj
 * @return {number}
 */
export function calcSentences(obj){

  let count = 0;

  function recursiveCount(o) {
    for (let key in o) {
      if (typeof o[key] === 'string') {
        count++;
      } else if (typeof o[key] === 'object' && o[key] !== null) {
        recursiveCount(o[key]);
      }
    }
  }

  recursiveCount(obj);
  return count;

}
