# Damu
A lightweight JavaScript library for composing functions together using an immutable common context.

[![Build Status](https://travis-ci.org/jolson88/damu.svg?branch=master)](https://travis-ci.org/jolson88/damu)
[![NPM Module](https://badge.fury.io/js/damu.svg)](https://www.npmjs.org/package/damu)
[![Dependencies](https://david-dm.org/jolson88/damu.svg)](https://david-dm.org/jolson88/damu)

> [Damu](https://en.wikipedia.org/wiki/Damu) - God of vegetation and rebirth in Sumerian mythology

## Installation
```sh
npm i damu
```

## Why does Damu exist?

### Implicit types and dependency problems
There's a problem that's easily overlooked when doing typical [function composition](https://www.mathsisfun.com/sets/functions-composition.html) in JavaScript.

```javascript
function f(x) {
    return x + 1;
}

function g(x) {
    return x * 2;
}

g(f(1)); //--> 4
```

We see two simple functions (`f` and `g`) that operate on a single data structure: a number. There doesn't seem to be any immediate complexities. It's downright straightforward for such a simple example.

But let's see a less contrived example that is more common in everyday development:

```javascript
async function getUser(userId) {
    const userRepository = createUserRepository();
    const user = await userRepository.get(userId);
    return {
        id: user.id,
        name: user.name
    };
}

async function getRecords(user) {
    const recordRepository = createRecordRepository();
    return await recordRepository.getAll(user.id);
}

await getRecords(await getUser("jolson88"));
//--> [
//-->     { id: 0, recordTitle: "Foo", updated: "April 14th, 2018" },
//-->     { id: 1, recordTitle: "Bar", updated: "April 8th, 2017" }
//--> ]
```

Now we have two functions (`getUser` and `getRecords`) that deal with four different data structures:
- A string: *the `userId` parameter of `getUser`*
- A user object: *the object returned from the `getUser` function*
- An object that has an id property: *the `user` parameter expected by `getRecords`*
- An array of records: *the array returned from the `getRecords` function*

We also have an added dimension of sync/async to worry about that limits our ability to directly compose functions together.

So it isn't as simple as two functions + one data structure like the first example was. We are needing to remember (and possibly interact) with **six** different concepts plus sync/async, for two simple functions. Even more insidious is that these four data structures are implicit: based on function parameters and return values. These data structures are custom to each individual function, so breaking them out to their own create functions/types/classes doesn't solve our dependency problem. It only makes it a little more visible.

While this problem may not seem significant when dealing with a small number of functions, it can quickly become unwieldy as the number of functions in the source code continues to grow. If we had ten functions pipelined and composed together like this, we would be dealing with **30** unique objects (ten functions, and each function's input and return value).

What if this was a web server where we composed together functions for each URL endpoint. If we had merely 10 endpoints that were each like this, we would have nearly **300** unique concepts to deal with. Of course, many of the functions may be shared between endpoints, so let's call it **150** with good reuse. That is still a lot of things to have to keep in your head to understand a system.

Now imagine yourself later needing to use a value returned from the first function within the tenth function. How is that done? More than likely, you are going to need to plumb that value from the first function's return value, through all the intermediate types, and make it available as a parameter in the last function. That's a very viral change and one that could have very wide-reaching impact, especially if the intermediate functions and types are reused elsewhere.

### Better 100 functions operating on one data structure
> "It is better to have 100 functions operate on one data structure than 10 functions on 10 data structures."
>
> Alan Perlis

There are examples of other languages and frameworks that embrace this "have 100 functions operate on one data structure" approach today: Clojure's focus on Maps as a main primitive data structure to communicate through, the Phoenix framework in Elixir [using Plug and `conn`](https://hexdocs.pm/phoenix/plug.html) as a common Map to assign values to, and Erlang's use of immutable state in `gen_server`/`gen_fsm`/`get_statem` (especially if you consider a functional composition to be a state machine comprised of X states, where X is the number of functions within the functional composition).

Damu takes a similar approach by leveraging a JavaScript object as a common map/context that functions write to and read from when they are composed together. Using this approach with Damu, the above `getUser/getRecords` composition would now look like this:

```javascript
const D = require("damu");

async function getUser({ login }) {
    const userRepository = createUserRepository();
    const user = await userRepository.get(login);
    return {
        user: {
            id: user.id,
            name: user.name
        }
    };
}

async function getRecords({ user: { id } }) {
    const recordRepository = createRecordRepository();
    const records = await recordRepository.getAll(id);
    return {
        user: {
            records
        }
    };
}

const fn = D.compose(getRecords, getUser);
await fn({ login: "jolson88" });
//--> {
//-->     login: "jolson88",
//-->     user: {
//-->         id: "fg142a98bc",
//-->         name: "Jason",
//-->         records: [
//-->             { id: 0, recordTitle: "Foo", updated: "April 14th, 2018" },
//-->             { id: 1, recordTitle: "Bar", updated: "April 8th, 2017" }
//-->         ]
//-->     }
//--> }
```

As you can see, there is a single common context that is passed to functions being composed. The return values from these functions are incorporated into the common context in an immutable fashion. The individual functions don't need to worry about preserving the context themselves, they can simply return a new structure/value and Damu will take care of preserving the context across calls. Functions also don't need to worry about whether they are in a Promise chain or not.

Now, if we want a value populated by the first function to be used by the last function in our composition, we don't need to worry about virally plumbing it through a large number of functions. We can simply destructure the value in our last function since the common context is preserved through the entire composition.

We can also use the common context for dependency injection if we wish:
```javascript
const D = require("damu");

async function getUser({ login, config: { userRepository } }) {
    const user = await userRepository.get(login);
    return {
        user: {
            id: user.id,
            name: user.name
        }
    };
}

async function getRecords({ user: { id }, config: { recordRepository } }) {
    const records = await recordRepository.getAll(id);
    return {
        user: {
            records
        }
    };
}

const ctx = {
    config: {
        recordRepository: createRecordRepository()
        userRepository: createUserRepository(),
    },
    login: "jolson88"
};
const fn = D.compose(getRecords, getUser);
await fn(ctx);
//--> {
//-->     login: "jolson88",
//-->     user: {
//-->         id: "fg142a98bc",
//-->         name: "Jason",
//-->         records: [
//-->             { id: 0, recordTitle: "Foo", updated: "April 14th, 2018" },
//-->             { id: 1, recordTitle: "Bar", updated: "April 8th, 2017" }
//-->         ]
//-->     }
//--> }
```

## Usage

### Compose
The main functionality of Damu is provided via the `compose` function. This function uses functional composition to chain functions together. Unlike normal function composition, `compose` will take the return value from a function and incorporate it into the common context that was provided to it, resulting in a new context that is passed to the next function.

This way, functions themselves can get just the parameters they need via destructuring and return only the new information it's calculated. `compose` takes care of all the necessary plumbing through and immutability of the common context.

```javascript
const R = require("ramda");
const D = require("damu");

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

const composedFn = D.compose(greet, getUser);
const beginContext = { userId: "jolson88" };
const endContext = composedFn(beginContext);
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

### Pipe
There is also a function called `pipe` that is similar to `compose`. But instead of evaluations functions right to left, it evaluates them left to right. This can make the code easier to read since the order of the functions passed in is the same order they get evaluated in.

Using `pipe`, the `compose` example above would now look like:

```javascript
const R = require("ramda");
const D = require("damu");

...

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

const fn = D.pipe(getUser, greet); // Instead of D.compose(greet, getUser)
const beginContext = { userId: "jolson88" };
const endContext = fn(beginContext);
```

### Working with Promises
Damu supports working with Promises directly out the box. You don't need to change anything about how your functions are composed together regardless of whether they are asynchronous or not. Damu will take care of it for you. 

```javascript
const f = ({ x }) => {
    return {
        fx: x + 20
    };
};
const g = ({ fx }) => {
    return Promise.resolve({
        gx: fx * 2
    });
};
const h = ({ gx }) => {
    return {
        hx: gx * 2
    };
};

const p = D.pipe(f, g, h);
p({ x: 1 }).then(console.log);
//--> {
//-->     x: 1,
//-->     fx: 21,
//-->     gx: 42,
//-->     hx: 84
//--> }
```

Even though `g` is an asynchronous function that returns a promise and the following `h` function is a normal function, you can see that we don't have to `pipe` or `compose` our functions together any differently and any functions coming after an async function don't need to be wrapped to be Promise-based either.

### Accessing previous return value directly
Similar to a REPL experience, Damu makes the previous return value directly accessible via the `__` value in the passed context. Since only object return values from a composed function will be merged into common context, this provides a way to access the previously returned value if it's a non-Object primitive.

```javascript
const D = require("damu");

function f({ x }) {
    return x + 41;
}

D.compose(f)({ x: 1 });
//--> {
//-->     __: 42,
//-->     x: 1
//--> }
```

This should be used with caution as it makes one function directly tied to the function composed before it and could lead to brittle breaks if the order of functions is changed.