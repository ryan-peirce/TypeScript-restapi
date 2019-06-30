import winston from "winston";

// Create a looger 
const winstonLogger = winston.createLogger({
  level: "info",
  transports: [new winston.transports.Console()]
});

export = winstonLogger;
