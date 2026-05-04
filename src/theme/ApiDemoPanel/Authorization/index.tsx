import React from "react";

import FormItem from "@theme/ApiDemoPanel/FormItem";
import FormSelect from "@theme/ApiDemoPanel/FormSelect";
import FormTextInput from "@theme/ApiDemoPanel/FormTextInput";
import { useTypedDispatch, useTypedSelector } from "@theme/ApiItem/hooks";

import sharedStyles from "../shared.module.css";
import {
  resolveAuthFieldMeta,
  resolveSchemeOptionLabel,
} from "../utils";
import {
  setAuthData,
  setSelectedAuth,
} from "@theme/ApiDemoPanel/Authorization/slice";

function Authorization() {
  const data = useTypedSelector((state: any) => state.auth.data);
  const options = useTypedSelector((state: any) => state.auth.options);
  const selected = useTypedSelector((state: any) => state.auth.selected);
  const dispatch = useTypedDispatch();

  if (selected === undefined) {
    return null;
  }

  const selectedAuth = options[selected] || [];
  const optionEntries = Object.entries(options);
  const handleFieldChange =
    (scheme: string, key: string) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const nextValue = event.target.value;
      dispatch(
        setAuthData({
          scheme,
          key,
          value: nextValue ? nextValue : undefined,
        })
      );
    };

  if (selectedAuth.length === 0) {
    return null;
  }

  return (
    <div className={sharedStyles.section}>
      <h5 className={sharedStyles.sectionTitle}>Authorization</h5>
      <p className={sharedStyles.sectionDescription}>
        Provide any credentials required for the live request. Header names stay
        visible as helper text.
      </p>

      {optionEntries.length > 1 && (
        <FormItem
          description="Choose which credential set should be attached to this request."
          label="Security Scheme"
        >
          <FormSelect
            onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
              dispatch(setSelectedAuth(event.target.value))
            }
            options={optionEntries.map(([key, schemes]) => ({
              label: resolveSchemeOptionLabel(key, schemes as any[]),
              value: key,
            }))}
            value={selected}
          />
        </FormItem>
      )}

      {selectedAuth.flatMap((scheme: any) =>
        resolveAuthFieldMeta(scheme).map((field) => (
          <FormItem
            description={field.description}
            helperText={field.helperText}
            key={`${scheme.key}-${field.dataKey}`}
            label={field.label}
          >
            <FormTextInput
              onChange={handleFieldChange(scheme.key, field.dataKey)}
              password={field.password}
              placeholder={field.placeholder}
              value={data[scheme.key]?.[field.dataKey] ?? ""}
            />
          </FormItem>
        ))
      )}
    </div>
  );
}

export default Authorization;
