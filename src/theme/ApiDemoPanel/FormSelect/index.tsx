import React from "react";

import sharedStyles from "../shared.module.css";
import { normalizeSelectOptions, SelectOption } from "../utils";

export interface Props {
  value?: string;
  options?: Array<string | SelectOption>;
  onChange?: React.ChangeEventHandler<HTMLSelectElement>;
}

function FormSelect({ value, options, onChange }: Props) {
  const normalizedOptions = normalizeSelectOptions(options);

  if (normalizedOptions.length === 0) {
    return null;
  }

  const selectedValue = value ?? normalizedOptions[0].value;

  return (
    <select
      className={sharedStyles.selectControl}
      onChange={onChange}
      value={selectedValue}
    >
      {normalizedOptions.map((option, index) => (
        <option key={`${option.value}-${index}`} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

export default FormSelect;
