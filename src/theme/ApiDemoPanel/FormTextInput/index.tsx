import React from "react";

import sharedStyles from "../shared.module.css";

export interface Props {
  value?: string;
  placeholder?: string;
  password?: boolean;
  readOnly?: boolean;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
}

function FormTextInput({
  value,
  placeholder,
  password,
  readOnly,
  onChange,
}: Props) {
  const sanitizedPlaceholder = placeholder?.split("\n")[0];

  return (
    <input
      autoComplete={password ? "new-password" : "off"}
      className={sharedStyles.control}
      onChange={onChange}
      placeholder={sanitizedPlaceholder}
      readOnly={readOnly}
      spellCheck={false}
      title={sanitizedPlaceholder}
      type={password ? "password" : "text"}
      value={value}
    />
  );
}

export default FormTextInput;
