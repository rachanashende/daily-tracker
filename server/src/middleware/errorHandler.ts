import { Request, Response, NextFunction } from "express";

export class ApiError extends Error {
  statusCode: number;
  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error("Error:", err.message);

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  if (err.code === "P2002") {
    return res.status(409).json({ error: "A record with this value already exists." });
  }

  if (err.code === "P2025") {
    return res.status(404).json({ error: "Record not found." });
  }

  res.status(500).json({ error: "Something went wrong on the server." });
}

/** Wraps async route handlers so thrown errors reach errorHandler */
export function asyncHandler(fn: (req: any, res: Response, next: NextFunction) => Promise<any>) {
  return (req: any, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}
