import React from "react";

import sdk from "@paloaltonetworks/postman-collection";
import buildPostmanRequest from "@theme/ApiDemoPanel/buildPostmanRequest";
import { Param } from "@theme/ApiDemoPanel/ParamOptions/slice";
import { setResponse } from "@theme/ApiDemoPanel/Response/slice";
import { useTypedDispatch, useTypedSelector } from "@theme/ApiItem/hooks";

import sharedStyles from "../shared.module.css";
import makeRequest from "@theme/ApiDemoPanel/Execute/makeRequest";

function validateRequest(params: {
  path: Param[];
  query: Param[];
  header: Param[];
  cookie: Param[];
}) {
  for (const paramList of Object.values(params)) {
    for (const param of paramList) {
      if (param.required && !param.value) {
        return false;
      }
    }
  }

  return true;
}

export interface Props {
  postman: sdk.Request;
  proxy?: string;
}

function Execute({ postman, proxy }: Props) {
  const pathParams = useTypedSelector((state: any) => state.params.path);
  const queryParams = useTypedSelector((state: any) => state.params.query);
  const cookieParams = useTypedSelector((state: any) => state.params.cookie);
  const headerParams = useTypedSelector((state: any) => state.params.header);
  const contentType = useTypedSelector((state: any) => state.contentType.value);
  const body = useTypedSelector((state: any) => state.body);
  const accept = useTypedSelector((state: any) => state.accept.value);
  const server = useTypedSelector((state: any) => state.server.value);
  const params = useTypedSelector((state: any) => state.params);
  const auth = useTypedSelector((state: any) => state.auth);
  const dispatch = useTypedDispatch();

  const isValidRequest = validateRequest(params);
  const postmanRequest = buildPostmanRequest(postman, {
    accept,
    auth,
    body,
    contentType,
    cookieParams,
    headerParams,
    pathParams,
    queryParams,
    server,
  });

  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));
  const handleActionClickCapture = (event: React.MouseEvent<HTMLDivElement>) => {
    if (isValidRequest) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <div
      className={sharedStyles.actionStack}
      onClickCapture={handleActionClickCapture}
    >
      <button
        className={`button button--primary button--sm ${sharedStyles.actionButton}`}
        disabled={!isValidRequest}
        onClick={async () => {
          dispatch(setResponse("Fetching..."));

          try {
            await delay(1200);
            const response = await makeRequest(postmanRequest, proxy, body);
            dispatch(setResponse(response));
          } catch {
            dispatch(setResponse("Connection failed"));
          }
        }}
        type="button"
      >
        Send API Request
      </button>
      {!isValidRequest && (
        <p className={sharedStyles.actionHint}>
          Complete required inputs to send the request.
        </p>
      )}
    </div>
  );
}

export default Execute;
