import React from "react";

import sharedStyles from "../shared.module.css";
import { getLocationLabel } from "../utils";

export interface Props {
  label?: React.ReactNode;
  type?: string;
  required?: boolean;
  description?: React.ReactNode;
  helperText?: React.ReactNode;
  children?: React.ReactNode;
}

function FormItem({
  label,
  type,
  required,
  description,
  helperText,
  children,
}: Props) {
  const typeLabel = getLocationLabel(type);

  return (
    <div className={sharedStyles.field}>
      {(label || typeLabel || required) && (
        <div className={sharedStyles.fieldHeader}>
          {label && <span className={sharedStyles.fieldLabel}>{label}</span>}
          {typeLabel && <span className={sharedStyles.fieldType}>{typeLabel}</span>}
          {required && (
            <span className={sharedStyles.requiredBadge}>Required</span>
          )}
        </div>
      )}
      {description && (
        <p className={sharedStyles.fieldDescription}>{description}</p>
      )}
      <div className={sharedStyles.fieldBody}>{children}</div>
      {helperText && <p className={sharedStyles.fieldHelp}>{helperText}</p>}
    </div>
  );
}

export default FormItem;
