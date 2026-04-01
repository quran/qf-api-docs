import React, { useEffect } from "react";

import FormItem from "@theme/ApiDemoPanel/FormItem";
import FormSelect from "@theme/ApiDemoPanel/FormSelect";
import FormTextInput from "@theme/ApiDemoPanel/FormTextInput";
import { useTypedDispatch, useTypedSelector } from "@theme/ApiItem/hooks";

import sharedStyles from "../shared.module.css";
import {
  normalizeSelectOptions,
  prettifyIdentifier,
  resolveServerLabel,
  resolveServerUrl,
} from "../utils";
import { setServer, setServerVariable } from "@theme/ApiDemoPanel/Server/slice";

function Server() {
  const value = useTypedSelector((state: any) => state.server.value);
  const options = useTypedSelector((state: any) => state.server.options);
  const dispatch = useTypedDispatch();

  const currentServer =
    Array.isArray(options) && options.length > 0
      ? options.find((option: any) => option.url === value?.url) || options[0]
      : undefined;
  const handleVariableChange =
    (key: string) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      dispatch(
        setServerVariable(JSON.stringify({ key, value: event.target.value }))
      );
    };

  useEffect(() => {
    if (!currentServer) {
      return;
    }

    if (!value || value.url !== currentServer.url) {
      dispatch(setServer(JSON.stringify(currentServer)));
    }
  }, [currentServer, dispatch, value]);

  if (!currentServer || !Array.isArray(options) || options.length === 0) {
    return null;
  }

  const optionList = normalizeSelectOptions(
    options.map((option: any, index: number) => ({
      label: resolveServerLabel(option, index),
      value: option.url,
    }))
  );
  const variableEntries = Object.entries(currentServer.variables ?? {});

  return (
    <div className={sharedStyles.section}>
      <h5 className={sharedStyles.sectionTitle}>Environment</h5>
      <p className={sharedStyles.sectionDescription}>
        Choose the server used for the live API request.
      </p>

      <FormItem
        description={
          options.length > 1
            ? "Switch between the published environments for this endpoint."
            : "This endpoint is served from a single environment."
        }
        label="Environment"
      >
        {options.length > 1 ? (
          <FormSelect
            onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
              const nextServer = options.find((option: any) => option.url === event.target.value);

              if (nextServer) {
                dispatch(setServer(JSON.stringify(nextServer)));
              }
            }}
            options={optionList}
            value={currentServer.url}
          />
        ) : (
          <div className={sharedStyles.readOnlyValue}>
            {resolveServerLabel(currentServer, 0)}
          </div>
        )}
      </FormItem>

      <div className={sharedStyles.urlPreview}>{resolveServerUrl(currentServer)}</div>

      {variableEntries.map(([key, variable]: any) => (
          <FormItem
            description={variable.description}
            helperText={`Server variable: ${key}`}
            key={key}
            label={prettifyIdentifier(key)}
          >
            {Array.isArray(variable.enum) && variable.enum.length > 0 ? (
              <FormSelect
                onChange={handleVariableChange(key)}
                options={variable.enum.map(String)}
                value={String(variable.default ?? "")}
              />
            ) : (
              <FormTextInput
                onChange={handleVariableChange(key)}
                placeholder={variable.description || key}
                value={String(variable.default ?? "")}
              />
            )}
          </FormItem>
        ))}
    </div>
  );
}

export default Server;
