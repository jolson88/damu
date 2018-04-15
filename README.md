# komp
A JavaScript library for composing functions together using a common context.

## Why does komp exist?
> "It is better to have 100 functions operate on one data structure than 10 functions on 10 data structures."
>
> Alan Perlis

TODO

## Usage
TODO

### Primitive functionality
The main `kompose` functionality is made possible through primitive functions like `wrap`. Wrap takes an existing single-parameter function and will abstracts away the merging of the function's return value with the running context that is being passed between functions.

```javascript
const { wrap } = require("komp");

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

## Development

```sh
# Run tests
yarn test

# Run tests in watcher mode
yarn run test.watch

# Linting (will happen as pre-commit hook as well)
yarn run lint
```
