import {  BASE_DOCS_SERVICE_URL, BASE_ACCOUNT_URL } from "../config/config";

export async function fetchApi(endpoint: string, options = {}) {
  const response = await fetch(`${BASE_ACCOUNT_URL}${endpoint}`, options);
  return response.json();
}

export async function fetchDocsApi(endpoint: string, options = {}) {
  const response = await fetch(`${BASE_DOCS_SERVICE_URL}${endpoint}`, options);
  return response;
}
