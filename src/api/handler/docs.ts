import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import yaml from "yaml";
import { respondWithJSON } from "@/api/json";

// Define the root of the project
const projectRoot = process.cwd();

export async function openApiSpec() {
  // Use a consistent absolute path to the static file
  const openApiYamlPath = path.join(projectRoot, "public", "openapi.yaml");
  const openApiDocs = yaml.parse(fs.readFileSync(openApiYamlPath, "utf-8"));
  return openApiDocs;
}

export async function apiDocumentation(req: Request, res: Response) {
  const apiDocs = await openApiSpec();
  respondWithJSON(res, 200, apiDocs);
}
