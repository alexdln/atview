import { CredentialSession } from "@atproto/api";
import { ProxyAgent } from "@atview/xrpc";

const credentials = new CredentialSession(new URL("https://api.bsky.app"));
export const publicAgent = new ProxyAgent(credentials);
