import CryptoJS from "crypto-js";

export const base64UrlEncode = (source: string | CryptoJS.lib.WordArray): string => {
  let encoded = typeof source === "string" 
    ? CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(source))
    : CryptoJS.enc.Base64.stringify(source);
    
  return encoded
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
};

export const base64UrlDecode = (source: string): string => {
  let decoded = source
    .replace(/-/g, "+")
    .replace(/_/g, "/");
    
  while (decoded.length % 4 !== 0) {
    decoded += "=";
  }
  
  return CryptoJS.enc.Utf8.stringify(CryptoJS.enc.Base64.parse(decoded));
};

export const signJwt = (header: string, payload: string, secret: string): string => {
  const encodedHeader = base64UrlEncode(header);
  const encodedPayload = base64UrlEncode(payload);
  const data = `${encodedHeader}.${encodedPayload}`;
  
  const signature = CryptoJS.HmacSHA256(data, secret);
  const encodedSignature = base64UrlEncode(signature);
  
  return `${data}.${encodedSignature}`;
};

export const verifyJwt = (token: string, secret: string): boolean => {
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  
  const [header, payload, signature] = parts;
  const data = `${header}.${payload}`;
  const expectedSignature = base64UrlEncode(CryptoJS.HmacSHA256(data, secret));
  
  return signature === expectedSignature;
};
