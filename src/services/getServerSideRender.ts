import { redirect } from "next/navigation";
import { API_URL } from "@/config/apiConfig";
import { CONSTANTS } from "@/config/constant";
import { KEYS } from "@/config/key";
import crypto from "crypto";

export async function serverRequest(
  request: any,
  url: string,
  methodName: string,
  isSignature: boolean = true,
  isAuthorization: boolean,
  authorizedToken?: string | null,
  isFormData: boolean = false,
  isJsonStringifyRequired: boolean = true,
  responseType: "json" | "blob" = "json"
) {
  const timestamp = Date.now().toString();
  const requestHeaders = await getHeader(
    url,
    request,
    timestamp,
    isSignature,
    isFormData
  );

  if (isAuthorization && authorizedToken) {
    requestHeaders[KEYS.AUTHORIZATION] = KEYS.BEARER + authorizedToken;
  }
  let response: any = null;
  if (methodName === CONSTANTS.REQUEST_GET) {
    response = await fetch(url, {
      method: methodName,
      headers: requestHeaders,
    });
  } else {
    response = await fetch(url, {
      method: methodName,
      headers: requestHeaders,
      body: !isJsonStringifyRequired ? request : JSON.stringify(request),
    });
  }
  if (response.status == 401 && response.statusText == "Unauthorized") {
    window.location.href = `/${process.env.NEXT_PUBLIC_SUB_PATH}`;
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("userInfo");
    sessionStorage.removeItem("authState");
    sessionStorage.removeItem("dataState");
    sessionStorage.removeItem("sidebarItems");
    sessionStorage.removeItem("financialYearData");
    return;
  }
  let json: any;
  if (responseType == "blob") {
    json = await response.blob();
  } else {
    const text = await response.text();
    if (!text) {
      json = {};
    } else {
      try {
        json = JSON.parse(text);
      } catch (error) {
        // If the response is not valid JSON, return raw text so caller can handle it.
        json = text;
      }
    }
  }

  if (
    json &&
    typeof json === "object" &&
    json?.errors &&
    json.errors.length > 0 &&
    json?.errors[0]?.message
  ) {
  }
  return json;
}

export async function getHeader(
  url: string,
  request: any,
  timestamp: string,
  isSignature: boolean = true,
  isFormData: boolean = false
  // isAuthorization: boolean = true,
) {
  const headers: any = {};
  if (!isFormData) {
    headers[KEYS.CONTENT_TYPE] = CONSTANTS.REQUEST_FORMAT;
  }
  headers[KEYS.ACCEPT_TYPE] = CONSTANTS.RESPONSE_FORMAT;
  headers[KEYS.ACCEPT_LANGUAGE] = CONSTANTS.LANGUAGE_ENGLISH;
  headers[KEYS.X_AUTHORIZATION_TOKEN] = CONSTANTS.X_AUTHORIZATION_TOKEN;
  headers[KEYS.X_API_KEY] = CONSTANTS.X_API_KEY;
  headers[KEYS.TOKEN] = CONSTANTS.TOKEN;

  // get signature
  if (isSignature) {
    headers[KEYS.TIMESTAMP] = timestamp;
    headers[KEYS.SIGNATURE] = await generateSignature(timestamp, url, request);
  }

  return headers;
}
export async function generateSignature(
  timestamp: string,
  url: string,
  request: any
) {
  var strArr = url.split("/");
  var methodName = strArr[4];
  var inServiceParam = strArr[5];
  var inClientParam = strArr[6];

  var detail = "null" + timestamp;
  detail = detail + getHashCode(detail);

  detail = detail + JSON.stringify(request);
  var data = methodName + timestamp + inServiceParam + inClientParam + detail;
  // var cipher = crypto.createCipheriv(
  //   CONSTANTS.CIPHER_KEY,
  //   CONSTANTS.SECRET_KEY,
  //   CONSTANTS.IV
  // );
  // let encrypted = cipher.update(data);
  // encrypted = Buffer.concat([encrypted, cipher.final()]);
  // console.log('data=>', encrypted.toString('hex'));
  // return encrypted.toString('base64');

  var cipher = crypto.createHmac(
    CONSTANTS.HASHING_ALGORITHM,
    CONSTANTS.SIGNATURE_KEY
  );
  const signature = cipher.update(data).digest("base64");
  return signature.toString() + "hjfghfghfghff";
}
export function getHashCode(data: any) {
  var hash = 0;
  var char;
  var mCodeArray = strToUtf16Bytes(data);
  var codeArray = mCodeArray.filter((item) => {
    return item != 0;
  });

  for (var i = 0; i < codeArray.length; i++) {
    char = codeArray[i];
    hash = (hash << 5) - hash + char;
  }
  return hash.toString();
}
export function strToUtf16Bytes(str: any) {
  const bytes = [];
  for (let ii = 0; ii < str.length; ii++) {
    const code = str.charCodeAt(ii); // x00-xFFFF
    bytes.push(code & 255, code >> 8); // low, high
  }
  return bytes;
}
