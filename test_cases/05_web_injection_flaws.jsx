/**
 * Test Case 05: Frontend Injection & Dangerous Execution
 * Language: JSX / React (.jsx)
 * Expected Result: Needs attention (High Severity Security Flaws)
 * Description: Contains unsafe HTML injection (dangerouslySetInnerHTML) and dynamic code evaluation (eval / new Function).
 */

import React, { useState } from 'react';

export default function UserCommentView({ commentData }) {
  const [renderedResult, setRenderedResult] = useState('');

  const executeCustomWidget = (userScript) => {
    // SECURITY FLAW: Dynamic code evaluation allows arbitrary script execution
    try {
      const runFn = new Function('data', userScript);
      const output = runFn(commentData);
      setRenderedResult(output);
    } catch (e) {
      // Empty catch block
    }
  };

  return (
    <div className="comment-card">
      <h3>User Review</h3>
      
      {/* SECURITY FLAW: Unsafe HTML injection bypasses React XSS protections */}
      <div 
        className="comment-body" 
        dangerouslySetInnerHTML={{ __html: commentData.rawHtml }} 
      />

      <button onClick={() => executeCustomWidget(commentData.userFormula)}>
        Run User Calculation
      </button>

      <div>{renderedResult}</div>
    </div>
  );
}
