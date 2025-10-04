const ENTITY_ERROR_STATUS = 422 as const;
const AUTHENTICATION_ERROR_STATUS = 401 as const;

type ValidationError = {
  origin?: string;
  code: string;
  format?: string;
  pattern?: string;
  path: string;
  message: string;
  minimum?: number;
  inclusive?: boolean;
};

type EntityErrorPayload = {
  message: ValidationError[];
  error: string;
  statusCode: number;
};

export class HttpError extends Error {
  status: number;
  payload: {
    message: ValidationError[] | string;
    [key: string]: any;
  };

  constructor({
    status,
    payload,
    message = "Lỗi HTTP",
  }: {
    status: number;
    payload: any;
    message?: string;
  }) {
    super(message);
    this.status = status;
    this.payload = payload;
  }
}

export class EntityError extends HttpError {
  status: 422;
  payload: EntityErrorPayload;
  constructor({
    status,
    payload,
  }: {
    status: 422;
    payload: EntityErrorPayload;
  }) {
    super({ status, payload, message: "Lỗi thực thể" });
    this.status = status;
    this.payload = payload;
  }
}
