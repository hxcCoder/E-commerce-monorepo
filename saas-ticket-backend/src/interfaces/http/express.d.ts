import 'express';

// augment the Express Request type so that middleware can attach a logger
// object (typically a winston child logger) without causing TS errors.
// We keep the type loose (`any`) because the concrete logger may vary.
declare module 'express' {
  interface Request {
    logger?: any;
  }
}
