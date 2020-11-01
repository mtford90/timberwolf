import * as Joi from "joi";
import { DEFAULT_SOURCE } from "./constants";

export interface WebsocketMessage {
  timestamp: number;
  text: string;
  name?: string;
  id?: number;
}

const websocketMessageSchema = Joi.alternatives(
  Joi.object({
    name: Joi.string(),
    id: Joi.number(),
    timestamp: Joi.number().integer().min(0),
    text: Joi.string().required(),
  }),
  Joi.string()
);

export async function parseMessage(message: string): Promise<WebsocketMessage> {
  let value;

  try {
    value = JSON.parse(message);
  } catch {
    value = message;
  }

  let parsed = await websocketMessageSchema.validateAsync(value);

  if (typeof parsed === "string") {
    parsed = {
      text: parsed,
      name: DEFAULT_SOURCE,
    };
  }

  return {
    timestamp: Date.now(),
    ...parsed,
    name: parsed.name || DEFAULT_SOURCE,
  };
}
