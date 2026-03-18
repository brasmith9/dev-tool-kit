import { Metadata } from "next";
import JwtToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "JWT Tool - Decode, Verify & Generate JSON Web Tokens",
  description: "Comprehensive JWT utility for decoding, verifying signatures, and generating new signed tokens (HS256). View header, payload, and exp claim data instantly. 100% local.",
  keywords: ["jwt debugger", "jwt generator", "decode jwt", "verify jwt signature", "hs256 sign", "check jwt exp"],
};

export default function Page() {
  return <JwtToolClient />;
}
