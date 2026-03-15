import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

interface RequestWithStartTime extends Request {
startTime?: number;
}

export const requestLogger = (req: RequestWithStartTime, res: Response, next: NextFunction) => {
req.startTime = Date.now();

// Log incoming request
logger.debug(`Incoming ${req.method} ${req.originalUrl}`, {
method: req.method,
url: req.originalUrl,
userAgent: req.get('User-Agent'),
ip: req.ip,
body: req.method !== 'GET' ? req.body : undefined,
});

// Keep reference to original res.end
const originalEnd = res.end;

res.end = function (chunk?: any, encoding?: any, cb?: any) {
const responseTime = Date.now() - (req.startTime as number);


if (typeof logger.request === 'function') {
  logger.request(
    req.method,
    req.originalUrl,
    res.statusCode,
    responseTime,
    req.get('User-Agent')
  );
} else {
  logger.info(`Response ${req.method} ${req.originalUrl} - ${res.statusCode} (${responseTime}ms)`);
}

return originalEnd.apply(this, [chunk, encoding, cb]);


};

next();
};
