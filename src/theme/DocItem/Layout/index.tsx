import React from "react";
import { useLocation } from "@docusaurus/router";
import DocItemLayout from "@theme-original/DocItem/Layout";

import UserRelatedApiEnvironmentNotice from "@site/src/components/UserRelatedApiEnvironmentNotice";
import { getUserRelatedDocsEnvironment } from "@site/src/components/UserRelatedApiEnvironmentNotice/paths";
import { UserRelatedApiEnvironmentNoticeRenderedProvider } from "@site/src/components/UserRelatedApiEnvironmentNotice/renderContext";

type DocItemLayoutProps = React.ComponentProps<typeof DocItemLayout>;

export default function DocItemLayoutWrapper(props: DocItemLayoutProps) {
  const { children, ...restProps } = props;
  const location = useLocation();
  const shouldRenderNotice = Boolean(
    getUserRelatedDocsEnvironment(location.pathname),
  );

  return (
    <DocItemLayout {...restProps}>
      <UserRelatedApiEnvironmentNoticeRenderedProvider
        value={shouldRenderNotice}
      >
        {shouldRenderNotice && (
          <UserRelatedApiEnvironmentNotice
            hash={location.hash}
            pathname={location.pathname}
            search={location.search}
          />
        )}
        {children}
      </UserRelatedApiEnvironmentNoticeRenderedProvider>
    </DocItemLayout>
  );
}
