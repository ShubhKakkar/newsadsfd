import React, { useState } from "react";
import { TagsInput } from "react-tag-input-component";

const Input = () => {
  const [selected, setSelected] = useState([]);

  return (
    <div>
      <h1>Add Fruits</h1>
      <TagsInput
        value={selected}
        onChange={setSelected}
        name="keyword"
        placeHolder="enter keyword"
      />
      <em>press enter or comma to add new tag</em>
    </div>
  );
};

export default Input