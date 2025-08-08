import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import yaml from "yaml";
import { respondWithJSON } from "@/api/json";

export async function openApiSpec() {
  const openApiYamlPath = path.join(__dirname, "../../openapi.yaml");
  const openApiDocs = yaml.parse(fs.readFileSync(openApiYamlPath, "utf-8"));
  return openApiDocs;
}

export async function apiDocumentation(req: Request, res: Response) {
  const apiDocs = await openApiSpec();
  respondWithJSON(res, 200, apiDocs);
}
