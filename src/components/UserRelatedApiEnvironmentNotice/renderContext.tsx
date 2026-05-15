import React from "react";

const UserRelatedApiEnvironmentNoticeRenderedContext =
  React.createContext(false);

export const UserRelatedApiEnvironmentNoticeRenderedProvider =
  UserRelatedApiEnvironmentNoticeRenderedContext.Provider;

export const useUserRelatedApiEnvironmentNoticeRendered = () =>
  React.useContext(UserRelatedApiEnvironmentNoticeRenderedContext);
