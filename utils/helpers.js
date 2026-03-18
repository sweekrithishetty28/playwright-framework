// Helper to log test steps clearly
const log = {
  step: (msg) => console.log(`  → ${msg}`),
  pass: (msg) => console.log(`  ✓ PASSED: ${msg}`),
  fail: (msg) => console.error(`  ✗ FAILED: ${msg}`),
  info: (msg) => console.log(`  ℹ ${msg}`),
};

async function safeAction(actionName, fn) {
  try {
    await fn();
    log.step(actionName);
  } catch (error) {
    log.fail(`${actionName} — ${error.message}`);
    throw error; 
  }
}

module.exports = { log, safeAction };