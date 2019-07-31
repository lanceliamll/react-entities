import React, { useEffect } from 'react';
import { mount } from 'enzyme';

import { makeEntity } from '../src/makeEntity';

let hookValue = null;
let component = null;

let useCounter = null;

const CounterView = () => {
  hookValue = useCounter();

  return null;
};

beforeAll(() => {
  const initialState = {
    value: 0,
  };

  function increment() {
    this.setState({ value: this.state.value + 1 });
  }

  function decrement() {
    this.setState({ value: this.state.value - 1 });
  }

  useCounter = makeEntity({ initialState, increment, decrement });
});

beforeEach(() => {
  component = mount(<CounterView />);
});

afterEach(() => {
  if (component.exists()) component.unmount();
});

describe('makeEntity', () => {
  it('returns an entity hook function', () => {
    expect(useCounter).toBeInstanceOf(Function);
    expect(hookValue).toBeInstanceOf(Array);
    expect(hookValue).toHaveLength(2);
  });
  it('sets the initial state of the entity', () => {
    const counter = hookValue[0];
    expect(counter).toHaveProperty('value', 0);
  });
});