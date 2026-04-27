import React from "react";

import { useDoc } from "@docusaurus/theme-common/internal";
import sdk from "@paloaltonetworks/postman-collection";
import Accept from "@theme/ApiDemoPanel/Accept";
import Authorization from "@theme/ApiDemoPanel/Authorization";
import Body from "@theme/ApiDemoPanel/Body";
import Execute from "@theme/ApiDemoPanel/Execute";
import ParamOptions from "@theme/ApiDemoPanel/ParamOptions";
import Server from "@theme/ApiDemoPanel/Server";
import { useTypedSelector } from "@theme/ApiItem/hooks";
import { ApiItem } from "docusaurus-plugin-openapi-docs/src/types";
import type { DocFrontMatter } from "docusaurus-theme-openapi-docs/src/types";

import sharedStyles from "../shared.module.css";

interface RequestFrontMatter extends DocFrontMatter {
  readonly proxy?: string;
  readonly hide_send_button?: boolean;
}

function Request({ item }: { item: NonNullable<ApiItem> }) {
  const response = useTypedSelector((state: any) => state.response.value);
  const postman = new sdk.Request(item.postman);
  const metadata = useDoc();
  const { proxy, hide_send_button } = metadata.frontMatter as RequestFrontMatter;

  return (
    <div>
      <details className="details__demo-panel" open={response ? false : true}>
        <summary>
          <div className={`${sharedStyles.summaryRow} details__request-summary`}>
            <div className={sharedStyles.summaryCopy}>
              <h4>Request</h4>
              <p className={sharedStyles.summaryText}>
                Configure the environment, credentials, and inputs for a live API
                request.
              </p>
            </div>
            {item.servers && !hide_send_button && (
              <Execute postman={postman} proxy={proxy} />
            )}
          </div>
        </summary>
        <div className={sharedStyles.panelBody}>
          <Server />
          <Authorization />
          <ParamOptions />
          <Body
            jsonRequestBodyExample={item.jsonRequestBodyExample}
            requestBodyMetadata={item.requestBody}
          />
          <Accept />
        </div>
      </details>
    </div>
  );
}

export default Request;
