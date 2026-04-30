declare module "@theme/ApiDemoPanel/buildPostmanRequest" {
  const buildPostmanRequest: (...args: any[]) => any;
  export default buildPostmanRequest;
}

declare module "@theme/ApiDemoPanel/CodeTabs" {
  const CodeTabs: any;
  export default CodeTabs;
}

declare module "@theme/ApiDemoPanel/Accept" {
  const Accept: any;
  export default Accept;
}

declare module "@theme/ApiDemoPanel/Authorization" {
  const Authorization: any;
  export default Authorization;
}

declare module "@theme/ApiDemoPanel/Authorization/slice" {
  export type Scheme = any;
  export const setAuthData: any;
  export const setSelectedAuth: any;
}

declare module "@theme/ApiDemoPanel/Body" {
  const Body: any;
  export default Body;
}

declare module "@theme/ApiDemoPanel/Execute" {
  const Execute: any;
  export default Execute;
}

declare module "@theme/ApiDemoPanel/Execute/makeRequest" {
  const makeRequest: any;
  export default makeRequest;
}

declare module "@theme/ApiDemoPanel/FormItem" {
  const FormItem: any;
  export default FormItem;
}

declare module "@theme/ApiDemoPanel/FormMultiSelect" {
  const FormMultiSelect: any;
  export default FormMultiSelect;
}

declare module "@theme/ApiDemoPanel/FormSelect" {
  const FormSelect: any;
  export default FormSelect;
}

declare module "@theme/ApiDemoPanel/FormTextInput" {
  const FormTextInput: any;
  export default FormTextInput;
}

declare module "@theme/ApiDemoPanel/ParamOptions" {
  const ParamOptions: any;
  export default ParamOptions;
}

declare module "@theme/ApiDemoPanel/ParamOptions/slice" {
  export type Param = any;
  export const setParam: any;
}

declare module "@theme/ApiDemoPanel/Response/slice" {
  export const setResponse: any;
}

declare module "@theme/ApiDemoPanel/Server" {
  const Server: any;
  export default Server;
}

declare module "@theme/ApiDemoPanel/Server/slice" {
  export const setServer: any;
  export const setServerVariable: any;
}

declare module "@theme/ApiItem/hooks" {
  export const useTypedDispatch: any;
  export const useTypedSelector: any;
}

declare module "@docusaurus/plugin-content-docs-types" {
  export type PropSidebarItemCategory = any;
  export type SidebarItemLink = any;
  export type PropSidebar = any;
  export type PropSidebarItem = any;
}
