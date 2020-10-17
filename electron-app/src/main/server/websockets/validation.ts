import * as Joi from "joi";

export interface BaseWebsocketMessage {
  name: string;
  id: string;
  timestamp: number;
  text: string;
  source?: "console";
  level?: "info" | "log" | "debug" | "warn" | "error";
}

const websocketMessageSchema = Joi.alternatives(
  Joi.object({
    name: Joi.string(),
    id: Joi.string(),
    source: Joi.string().valid("console"),
    level: Joi.string().valid("info", "log", "debug", "warn", "error"),
    timestamp: Joi.number().integer().min(0),
    text: Joi.string().required(),
  }),
  Joi.string()
);

const DEFAULT_ID = "default";

export async function parseMessage(
  message: string
): Promise<BaseWebsocketMessage> {
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
      name: DEFAULT_ID,
      id: DEFAULT_ID,
    };
  }

  return {
    timestamp: Date.now(),
    ...parsed,
    id: parsed.id || parsed.name || DEFAULT_ID,
    name: parsed.name || parsed.id || DEFAULT_ID,
  };
}
