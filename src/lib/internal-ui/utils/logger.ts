export function logger({ message, type }: { message: string; type: 'info' | 'warn' | 'error' }) {
  const timestamp = new Date().toISOString();
  switch (type) {
    case 'info':
      console.log(`💡[INFO] [${timestamp}] ${message}`);
      break;
    case 'warn':
      console.warn(`⚠️[WARN] [${timestamp}] ${message}`);
      break;
    case 'error':
      console.error(`❌[ERROR] [${timestamp}] ${message}`);
      break;
  }
}
