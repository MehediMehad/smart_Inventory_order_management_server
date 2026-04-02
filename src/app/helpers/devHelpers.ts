import os from 'os';

export const getLocalIP = (): string => {
  let message = '⚠️ No local IPv4 addresses found or server not running in development mode.';
  if (process.env.NODE_ENV !== 'development') {
    console.log(message);
    return message;
  }

  const interfaces = os.networkInterfaces();
  const addresses: string[] = [];

  for (const name of Object.keys(interfaces)) {
    const nets = interfaces[name];
    if (nets) {
      for (const net of nets) {
        if (net.family === 'IPv4' && !net.internal) {
          addresses.push(net.address);
        }
      }
    }
  }

  if (addresses.length > 0) {
    message = `🖥️  Your PC's local IPv4 address(es) detected: ${addresses.join(', ')}`;
  } else {
    return message;
  }

  console.log(message);
  return message;
};
