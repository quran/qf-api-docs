import runtime from "../src/markdown-negotiation-runtime.cjs";

const { negotiateMarkdownResponse } = runtime;

export async function onRequest(context) {
  const { env, next, request } = context;
  const response = await next();

  return negotiateMarkdownResponse({
    assetsFetch: env.ASSETS.fetch.bind(env.ASSETS),
    request,
    response,
  });
}
