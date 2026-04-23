import React from "react";
import { useLocation } from "@docusaurus/router";
import ApiItemLayout from "@theme-original/ApiItem/Layout";

import UserRelatedApiEnvironmentNotice from "@site/src/components/UserRelatedApiEnvironmentNotice";

type ApiItemLayoutProps = React.ComponentProps<typeof ApiItemLayout>;

export default function ApiItemLayoutWrapper(props: ApiItemLayoutProps) {
  const { children, ...restProps } = props;
  const location = useLocation();

  return (
    <ApiItemLayout {...restProps}>
      <UserRelatedApiEnvironmentNotice
        hash={location.hash}
        pathname={location.pathname}
        search={location.search}
      />
      {children}
    </ApiItemLayout>
  );
}
