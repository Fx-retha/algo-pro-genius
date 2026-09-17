# Code Base reliability and accuracy upgrade

## Goal
Make chart scanning more deliberate and trustworthy, improve responsiveness without weakening safety, and enforce a real 500-license inventory with clear used and remaining counts.

## Scanner and signal quality
- Require a signed-in user, a connected trading account, and a valid chart image before analysis.
- Read the selected account from the database instead of browser-only account IDs.
- Use a staged scan: inspect the chart, fetch current broker price, then validate direction, entry, stop loss, take profit, spread, and risk/reward before showing a signal.
- Return **No trade** when the symbol is unclear, the chart is stale or unreadable, live price differs too far from the chart, spread is unsuitable, levels are invalid, or confidence is below the safe threshold.
- Use structured responses with strict server-side validation; never silently convert malformed AI output into a tradable signal.
- Show scan progress so the intentionally deeper analysis can take a little longer without appearing stuck.
- Require stronger confidence for auto-trading and disable execution when validation fails. Manual BUY/SELL actions will use the validated signal direction only.
- Save scan results in the backend for cross-device history, while keeping the interface quick with recent-result caching.

## Trading and performance
- Consolidate account, price, and position requests where possible and avoid duplicate polling.
- Add request timeouts, clear error states, and safe retry behavior for transient broker/API failures.
- Validate all trade values server-side, confirm account ownership and connection state, and record successful or failed executions.
- Keep market and AI calls concurrent only where they are independent; preserve sequential checks where safety depends on fresh data.

## License inventory (500 total)
- Add an admin-only database function that creates a license and enforces the 500-record maximum atomically, preventing two admins from exceeding the limit at the same time.
- Treat **Total capacity** as 500, **Used** as assigned keys, and **Remaining** as `500 - all generated keys`; separately show available, revoked, and expired counts for clarity.
- Replace client-side key generation/insertion with the secure database operation.
- Add Total, Generated, Used, Remaining, Available, Revoked, and Expired summaries to license management and keep the admin dashboard consistent.
- Disable generation at 500 and show a clear capacity message.

## Data and access
- Add a user-owned scan-history table with explicit grants and row-level access rules.
- Keep broker credentials and API authentication server-side.
- Update generated database types after the migration.

## Verification
- Test license creation, the 500-key boundary, concurrent creation safety, activation, revocation, expiry, and all counters.
- Test valid, unreadable, stale, low-confidence, and malformed chart analyses.
- Test that auto-trading cannot run on neutral/rejected signals, invalid levels, disconnected accounts, or another user’s account.
- Run focused automated tests and browser checks for desktop and mobile scanner/admin flows.

## Accuracy note
No trading model can guarantee correct signals or profits. This upgrade improves evidence checks and rejects weak setups instead of presenting uncertain output as accurate.
