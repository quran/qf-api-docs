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
  const serverOptions = Array.isArray(options) ? options : [];
  const fallbackServer =
    serverOptions.find((option: any) => option.url === value?.url) ||
    serverOptions[0];

  const currentServer =
    value && fallbackServer && value.url === fallbackServer.url
      ? value
      : fallbackServer;
  const handleVariableChange =
    (key: string) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      dispatch(
        setServerVariable(JSON.stringify({ key, value: event.target.value }))
      );
    };

  useEffect(() => {
    if (!fallbackServer) {
      return;
    }

    if (!value || value.url !== fallbackServer.url) {
      dispatch(setServer(JSON.stringify(fallbackServer)));
    }
  }, [dispatch, fallbackServer, value]);

  if (!currentServer || serverOptions.length === 0) {
    return null;
  }

  const optionList = normalizeSelectOptions(
    serverOptions.map((option: any, index: number) => ({
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
          serverOptions.length > 1
            ? "Switch between the published environments for this endpoint."
            : "This endpoint is served from a single environment."
        }
        label="Environment"
      >
        {serverOptions.length > 1 ? (
          <FormSelect
            onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
              const nextServer = serverOptions.find(
                (option: any) => option.url === event.target.value
              );

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
