import React from "react";

import Link from "@docusaurus/Link";
import { useTypedSelector } from "@theme/ApiItem/hooks";

import sharedStyles from "../shared.module.css";
import { resolveSchemeDisplayName, getLocationLabel } from "../utils";

function SecuritySchemes(props: any) {
  const options = useTypedSelector((state: any) => state.auth.options);
  const selected = useTypedSelector((state: any) => state.auth.selected);
  const infoAuthPath = `/${props.infoPath}#authentication`;

  if (selected === undefined) {
    return null;
  }

  const selectedAuth = options[selected];
  if (!selectedAuth || selectedAuth[0]?.type === undefined) {
    return null;
  }

  return (
    <details className="details__demo-panel" open={false}>
      <summary>
        <div className={`${sharedStyles.summaryRow} details__request-summary`}>
          <h4>Authentication Details</h4>
        </div>
      </summary>
      <div className={sharedStyles.referenceList}>
        {selectedAuth.map((auth: any) => (
          <div className={sharedStyles.referenceCard} key={auth.key}>
            <Link className={sharedStyles.referenceTitle} to={infoAuthPath}>
              {resolveSchemeDisplayName(auth)}
            </Link>

            <div className={sharedStyles.referenceMeta}>
              <span className={sharedStyles.referenceChip}>{auth.type}</span>
              {auth.scheme && (
                <span className={sharedStyles.referenceChip}>{auth.scheme}</span>
              )}
              {auth.in && (
                <span className={sharedStyles.referenceChip}>
                  {getLocationLabel(auth.in)}
                </span>
              )}
            </div>

            {auth.description && (
              <p className={sharedStyles.referenceText}>{auth.description}</p>
            )}

            <dl className={sharedStyles.referenceGrid}>
              {(auth.name || auth.key) && (
                <div className={sharedStyles.referenceGridItem}>
                  <dt>Name</dt>
                  <dd>
                    <code>{auth.name || auth.key}</code>
                  </dd>
                </div>
              )}
              {Array.isArray(auth.scopes) && auth.scopes.length > 0 && (
                <div className={sharedStyles.referenceGridItem}>
                  <dt>Scopes</dt>
                  <dd>{auth.scopes.join(", ")}</dd>
                </div>
              )}
              {auth.openIdConnectUrl && (
                <div className={sharedStyles.referenceGridItem}>
                  <dt>OpenID Connect URL</dt>
                  <dd>{auth.openIdConnectUrl}</dd>
                </div>
              )}
            </dl>

            {auth.flows && (
              <pre className={sharedStyles.referenceCode}>
                {JSON.stringify(auth.flows, null, 2)}
              </pre>
            )}
          </div>
        ))}
      </div>
    </details>
  );
}

export default SecuritySchemes;
