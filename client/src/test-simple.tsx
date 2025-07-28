// Minimal React test component to check hooks
import React, { useState } from 'react';

export default function TestSimple() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <h1>Simple Test: {count}</h1>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}