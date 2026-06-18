export type LogType = 'info' | 'warn' | 'error';

export type LoggerGroupSettings = {
  label: string;
  body: string;
};

const PREFIX: Record<LogType, string> = {
  info: '💡[INFO]',
  warn: '⚠️[WARN]',
  error: '❌[ERROR]',
};

export function logger(args: { type: LogType; message: string }): void;
export function logger(args: { type: LogType; group: LoggerGroupSettings }): void;
export function logger(args: {
  type: LogType;
  message?: string;
  group?: LoggerGroupSettings;
}): void {
  const timestamp = new Date().toISOString();
  const prefix = `${PREFIX[args.type]} [${timestamp}]`;

  if (args.group) {
    console.groupCollapsed(`${prefix} ${args.group.label}`);
    console.log(args.group.body);
    console.groupEnd();
    return;
  }

  switch (args.type) {
    case 'info':
      console.log(`${prefix} ${args.message}`);
      break;
    case 'warn':
      console.warn(`${prefix} ${args.message}`);
      break;
    case 'error':
      console.error(`${prefix} ${args.message}`);
      break;
  }
}
