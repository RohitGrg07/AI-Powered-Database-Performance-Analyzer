export const checkBottleneck = (executionTime) => {
  if (executionTime > 500) {
    return "⚠️ High latency detected!";
  }
  return "OK";
};
