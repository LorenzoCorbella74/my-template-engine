// Template engine in 100; https://github.com/heapwolf/txl
// .get(path) https://gomakethings.com/how-to-get-the-value-of-an-object-from-a-specific-path-with-vanilla-js/

/*
  Nested properties:
  // https://gomakethings.com/how-to-detect-changes-to-nested-arrays-and-objects-inside-a-proxy/

  Listners:
  https://dev.to/mandrewdarts/vanilla-change-detection-with-proxies-in-javascript-3kpe

  Proxy handle for array:
  https://stackoverflow.com/questions/35610242/detecting-changes-in-a-javascript-array-using-the-proxy-object
  https://stackoverflow.com/questions/45528463/properly-building-javascript-proxy-set-handlers-for-arrays
*/

import { diff } from "./diff";
import { trueTypeOf } from "./clone";
// Helpers
const If = (condition, s) => (condition ? s : "");
const Loop = (who, template) =>
  who.map((n, $index) => template(n, $index)).join("");
const replaceBrackets = (tpl) => tpl.replace(/\{/g, "${");

const combineTemplateStr = (s) => {
  const body = `return \`${replaceBrackets(s)}\``;
  return (o) => {
    o = { ...o, If, Loop };
    const keys = Object.keys(o);
    const values = Object.values(o);
    const bindedValues = values.map((element) =>
      typeof element === "function" ? element.bind(o) : element
    );
    try {
      return new Function(...keys, body)(...bindedValues);
    } catch (error) {
      console.error(`Template error: ${error.message}`);
      return "";
    }
  };
};

const combine = (str) => ({ with: combineTemplateStr(str) });

var correctedPath = (tpl) =>
  tpl
    .replace(/\.([\d]+)/g, "[$1]")
    .replace(/\.(push|pop|shift|slice|length)/g, "");

/**
 * Create settings and getters for data Proxy
 * @param  {Constructor} instance The current instantiation
 * @return {Object}               The setter and getter methods for the Proxy
 */
var dataHandler = function (callback, watch, path = "") {
  return {
    get: function (obj, prop) {
      path += `${prop}.`;
      if (["object", "array"].indexOf(trueTypeOf(obj[prop])) > -1) {
        return new Proxy(obj[prop], dataHandler(callback, watch, path));
      }
      return obj[prop];
    },
    set: function (obj, prop, value) {
      if (obj[prop] === value) return true;
      let previous = obj[prop];
      obj[prop] = value;
      if (prop !== "length") {
        path += `${prop}`;
        watch(obj, correctedPath(path), previous, obj[prop]); // like $watch
        callback(); // è la funzione che chiamerà il rerender....
      }
      return true;
    } /* ,
    deleteProperty: function (obj, prop) {
      // Do stuff when someone deletes a property
      console.log("Deleted a property... bye bye bye!");
      // Delete the property
      delete obj[prop];
      // Indicate success
      return true;
    } */
  };
};

var in_progress;
var i = 0;

var debounceRender = function (id, template, state) {
  // If there's a pending render, cancel it
  if (in_progress) {
    window.cancelAnimationFrame(in_progress);
  }

  // Setup the new render to run at the next animation frame
  in_progress = window.requestAnimationFrame(function () {
    i++;
    console.log(`Render n° ${i}`);
    render(id, template, state);
    if (i > 1) {
      const rendered = stringToHTML(combine(template).with(state));
      diff(rendered, document.getElementById(id));
    }
  });
};

const render = (id, template, state) => {
  const rendered = stringToHTML(combine(template).with(state));
  document.getElementById(id).append(rendered);
};

export function reactiveTemplate(id, template, state, watchFn) {
  const proxiedObj = new Proxy(
    state,
    dataHandler(() => debounceRender(id, template, state), watchFn)
  );

  // first time...
  debounceRender(id, template, state);

  return proxiedObj;
}

/**
 * Convert a template string into HTML DOM nodes
 * @param  {String} str The template string
 * @return {Node}       The template HTML
 */
export const stringToHTML = function (str) {
  // If DOMParser is supported, use it
  if (window.DOMParser) {
    // Create document
    var parser = new DOMParser();
    var doc = parser.parseFromString(str, "text/html");

    // If there are items in the head, move them to the body
    if (
      "head" in doc &&
      "childNodes" in doc.head &&
      doc.head.childNodes.length > 0
    ) {
      Array.prototype.slice
        .call(doc.head.childNodes)
        .reverse()
        .forEach(function (node) {
          doc.body.insertBefore(node, doc.body.firstChild);
        });
    }

    return doc.body;
  }

  // Otherwise, fallback to old-school method
  var dom = document.createElement("div");
  dom.innerHTML = str;
  return dom;
};
