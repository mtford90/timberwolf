import * as Joi from "joi";

export interface WebsocketMessage {
  name: string;
  timestamp: number;
  text: string;
}

const websocketMessageSchema = Joi.object({
  name: Joi.string().required(),
  timestamp: Joi.number().integer().min(0).required(),
  text: Joi.string().required(),
});

export function parseMessage(message: string): Promise<WebsocketMessage> {
  return websocketMessageSchema.validateAsync(JSON.parse(message));
}
