import React from "react";
import { useLocation } from "@docusaurus/router";
import ApiItemLayout from "@theme-original/ApiItem/Layout";

import UserRelatedApiEnvironmentNotice from "@site/src/components/UserRelatedApiEnvironmentNotice";

export default function ApiItemLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const location = useLocation();

  return (
    <ApiItemLayout>
      <UserRelatedApiEnvironmentNotice
        hash={location.hash}
        pathname={location.pathname}
        search={location.search}
      />
      {children}
    </ApiItemLayout>
  );
}
