import { reactiveTemplate } from "./index";

// 1) si definisce uno stato
const STATE = {
  profile: {
    surname: "Doe",
    name: " John",
    relatives: [{ name: "Dad" }, { name: "Mum" }]
  },
  age: 46,
  woman: ["Chiara", "Luce"],
  get proper() {
    return `Mr ${this.profile.surname}`;
  },
  testFn() {
    return `${this.proper} has been here...`;
  }
};

// 2) si definisce una striga rappresentante un template con interpolazioni da valorizzare
const myTemplate =
  "<h3> Test property: {profile.surname}</h3>" +
  "<h4>Test getter:{proper}</h4>" +
  "<h5>Test method:{testFn()}</h5>  " +
  "<h6>Test If:{If(age>=40, `{profile.surname} is {age} years old`)} </h6>" +
  "<p>Test Loop:<ul>{Loop(woman, (n)=>`<li>{n}</li>`)}</ul></p>" +
  "<p>Test Loop:<ul>{Loop(profile.relatives, (n)=>`<li>{n.name}</li>`)}</ul></p>";

const log = (...log) => console.log(...log);

const myFn = (ctx) => console.log(ctx);

// si definisce un template reattivo passando:
// 1) l'id dell'elemento ospitante
// 2) il template
// 3) lo stato
// 4) la watch function da chiamare quando qualcosa è cambiato
let reactiveData = reactiveTemplate(
  "app",
  myTemplate,
  STATE,
  // watch function
  (value, path, previous, newvalue) => {
    log(value, path, previous, newvalue);
    if (path === "profile.relatives[1].name" && previous !== newvalue) {
      console.log("Bingoo watch trap!!!");
      myFn(STATE);
    }
  }
);

// simulating user interaction
setTimeout(() => {
  reactiveData.profile.relatives[1].name = "Oh, My mum";
}, 1250);

setTimeout(() => {
  reactiveData.woman.push("Gloria");
}, 2500);

setTimeout(() => {
  reactiveData.profile.relatives[1].name = "Mum";
}, 3750);

setTimeout(() => {
  reactiveData.woman.shift();
}, 5000);

setTimeout(() => {
  reactiveData.profile = {
    surname: "Lorenzo",
    name: " Corbella",
    relatives: []
  };
}, 10000);
