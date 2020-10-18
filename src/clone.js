/**
 * More accurately check the type of a JavaScript object
 * @param  {Object} obj The object
 * @return {String}     The object type
 */
export const trueTypeOf = function (obj) {
  return Object.prototype.toString.call(obj).slice(8, -1).toLowerCase();
};

/**
 * Create an immutable copy of an object and recursively encode all of its data
 * @param  {*}       obj       The object to clone
 * @param  {Boolean} allowHTML If true, allow HTML in data strings
 * @return {*}                 The immutable, encoded object
 */
export const clone = function (obj, allowHTML) {
  // Get the object type
  var type = trueTypeOf(obj);

  // If an object, loop through and recursively encode
  if (type === "object") {
    var cloned = {};
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = clone(obj[key], allowHTML);
      }
    }
    return cloned;
  }

  // If an array, create a new array and recursively encode
  if (type === "array") {
    return obj.map(function (item) {
      return clone(item, allowHTML);
    });
  }

  // If the data is a string, encode it
  if (type === "string" && !allowHTML) {
    var temp = document.createElement("div");
    temp.textContent = obj;
    return temp.innerHTML;
  }

  // Otherwise, return object as is
  return obj;
};
