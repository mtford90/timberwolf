import * as Joi from "joi";

export interface WebsocketMessage {
  name: string;
  timestamp: number;
  text: string;
}

const websocketMessageSchema = Joi.alternatives(
  Joi.object({
    name: Joi.string().required(),
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
      name: "default",
    };
  }

  return {
    timestamp: Date.now(),
    ...parsed,
  };
}
