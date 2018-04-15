# Damu
A lightweight JavaScript library for composing functions together using an immutable common context.

[![Build Status](https://travis-ci.org/jolson88/damu.svg?branch=master)](https://travis-ci.org/jolson88/damu)
[![NPM Module](https://badge.fury.io/js/damu.svg)](https://www.npmjs.org/package/damu)
[![Dependencies](https://david-dm.org/jolson88/damu.svg)](https://david-dm.org/jolson88/damu)

## Why does Damu exist?
> "It is better to have 100 functions operate on one data structure than 10 functions on 10 data structures."
>
> Alan Perlis

TODO

## Usage
The main functionality of Damu is provided via the `compose` function. This function uses functional composition to chain functions together. Unlike normal function composition, `compose` will take the return value from a function and incorporate it into the common context that was provided to it, resulting in a new context that is passed to the next function.

This way, functions themselves can get just the parameters they need via destructuring and return only the new information it's calculated. `compose` takes care of all the necessary plumbing through and immutability of the common context.

```javascript
const R = require("ramda");
const { compose } = require("damu");

const users = [
    { login: "jolson88", name: "Jason" },
    { login: "praqzis", name: "Josh" }
];

function getUser({ userId }) {
    return {
        user: R.find(R.propEq("login", userId), users)
    };
}

function greet({ user: { name } }) {
    return {
        greeting: `Hello, ${name}`
    };
}

const fn = compose(greet, getUser);
const beginContext = { userId: "jolson88" };
const endContext = fn(beginContext);
endContext.user.name; //--> "Jason"
endContext.greeting;  //--> "Hello, Jason"
```

In the above example, the initial context is:
```javascript
{
    userId: "jolson88"
}
```

After calling the first function `getUser` (remember, function composition is done from end to beginning so it's like `getGreeting(getUser(ctx))`), the context is now:
```javascript
{
    userId: "jolson88",
    user: {
        login: "jolson88",
        name: "Jason"
    }
}
```

Finally, after calling the next function `greet`, the final returned context looks like:
```javascript
{
    userId: "jolson88",
    user: {
        login: "jolson88",
        name: "Jason"
    },
    greeting: "Hello, Jason"
}
```

### Primitive functionality
The main `compose` functionality is made possible through primitive functions like `wrap`. Wrap takes an existing single-parameter function and will abstracts away the merging of the function's return value with the running context that is being passed between functions.

```javascript
const { wrap } = require("damu");

function sayHello({ name }) {
    return {
        greeting: `Hello, ${name}!`
    };
}

let ctx = { name: "Jason" };
sayHello(ctx);
//> {
//>     greeting: "Hello, Jason!"
//> }    

wrap(sayHello)(ctx);
//> {
//>     greeting: "Hello, Jason!",
//>     name: "Jason",
//>     __: { greeting: "Hello, Jason!" }
//> }
```

`wrap` will only merge objects directly into the context. Other values are made available to the next function via the `__` property in the common context.
