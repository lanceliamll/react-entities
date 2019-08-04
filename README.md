# React Entities

React Entities is an ultra-lightweight library that provides the simplest global state management for React apps. It takes advantage of React Hooks.

If you are familiar with Redux, you may consider this alternative for the following reasons:
- No complex boilerplate code required
- Much less steep learning curve
- No need for reducers and dispatch
- Uses plain functions to implement actions
- No need for middleware and other added complexities
- Does not use Context API; has straightforward subscription instead
- No explicit container (i.e. "store") to care about
- Made specifically for React, and built on React Hooks 
- It is tiny, only about 1 KB

You may also consider React Entities to replace other app-state libraries if you prefer to keep things as simple as possible.

**Easy to learn.** If you know React Hooks, you'll be coding React Entities in no time at all.

## Setup

To install:
```
npm install react-entities
```

## Getting Started

There is just one simple concept that you need to know to get started with React Entities--what exactly is an entity.

An _entity_ is a logical chunk of data whose _state_ can be bound to any number of components in the app. In this sense it is "global" or "shared" within the context of the entire app. Once bound to a component, an entity's state acts like local state, i.e. it causes the component to update on every change.

Apart from state, each entity would also have _actions_, which are just regular functions that make changes to the entity's state. In fact, you can think of an entity just like a regular Javascript object that has a single property (the state) and one or several methods (actions).


## Creating Entities

A typical entity definition would be a regular module that exports an `initialState` object as well as several action functions. Here is a simple example:

**entities/counter.js**
```javascript
  export const initialState = {
    value: 0
  };

  export const increment = counter => by => {
    counter.setState({ value: counter.state.value + by });
  };

  export const decrement = counter => by => {
    counter.setState({ value: counter.state.value - by });
  };
```

### Defining the initial state

It is recommended that you define the `initialState` of an entity to properly set default values. This should always be an object. Since it is optional, it defaults to an empty object `{}`.

### Defining the actions

In the example above, `increment` and `decrement` are both actions. It is important to note that actions are defined using higher-order functions, with the top level function passing down the entity reference.

Within the actual action function, you can use the `state` property of the entity to reference its current state. To make any changes to its state, you should use its `setState()`. **Do not** directly mutate the `state` object.

The function `setState()` has the following familiar signature:
```
entity.setState( changes )
```
where `changes` is an object whose properties are shallowly merged with the current state, thus overriding the old values. Unlike React's `setState()`, this one doesn't have to support updater function as argument given that the `state` value available within the action itself is *always* up-to-date.


## Creating Entity Hooks

To enable us to bind our entities to components, we'll need Hooks. To create one such hook, we use the `makeEntity` function.

```javascript
makeEntity( entityDefinition )
```
This function creates an entity based on the provided definition, then returns an _entity hook_. The argument `entityDefinition` is imported from our entity module, as in this example:

**entities/index.js**
```javascript
import { makeEntity } from 'react-entities';
import * as counter from './counter';

export const useCounter = makeEntity(counter);
```

## Using Entity Hooks in Components

An entity hook returns an array containing two items: the entity state object, and an object containing all the entity's actions. This allows the component to both reference the entity's current state, and invoke its actions within callbacks and effects.

Here is an example usage:

**CounterView.js**
```javascript
import React, { useCallback } from 'react';

import { useCounter } from './entities';

const CounterView = () => {
  const [counter, { increment, decrement }] = useCounter();

  const handleClickIncrement = useCallback(() => increment(1), []);
  const handleClickDecrement = useCallback(() => decrement(1), []);

  return (
    <>
      <div>{counter.value}</div>
      <button onClick={handleClickIncrement}>Increment</button>
      <button onClick={handleClickDecrement}>Decrement</button>
    </>
  )
};
```

As you can see in the above example, it is typical to use the object-spread operator to extract only the relevant actions from the entity, instead of the entire actions object.

## Recipes

With the very straightforward, largely unopinionated approach that React Entities brings to managing app state, you have full flexibility to implement things the way you want. It works seamlessly with whatever code architecture you choose for your React app. 

Here we provide some suggested patterns that you may consider for specific scenarios.

### Async fetch operations within actions

In some cases components require data that has to be fetched from the server. For this we would need an async operation that sends the fetch request and waits for server response.

Typical actions immediately make state changes then terminate. But because actions are just functions, they can contain any operations, including async ones. This affords us the flexibility of implementing data fetches inside actions.

Here is an example:

**settings.js**
```javascript
import { fetchConfig } from './configService';

export const initialState = {
  loading: false,
  config: null
};

export loadConfig = settings => async () => {
  settings.setState({ loading: true });

  const res = await fetchConfig();
  settings.setState({ loading: false, config: res });
}
```

### Teardown of entities for testing

All the entities are stored at the module level, outside of the React component tree. For the app itself, this is not a problem. However, in testing the app, you would typically setup and teardown the App component multiple times, and therefore entities must be reset to initial state each time.

For this purpose you can use the `useEntitiesTeardown` hook. It resets all entities each time the host component unmounts. Since you don't need this in the App component itself, in your test scripts you can wrap the App component with a shell component that uses this hook.

Here is an example usage:

**test/App.spec.js**
```javascript
import { useEntitiesTeardown } from 'react-entities';

const TestShell = () => {
  useEntitiesTeardown();

  return <App />;
};

let component;
beforeEach(() => {
  component = mount(<TestShell />);
});
afterEach(() => {
  component.unmount();
});

// Your test scripts here ...
```
