"use client";

import { useState, useMemo } from "react";
import "./cfoworks-brokerage.css";

const fmtCurrency = (n: number) =>
  !Number.isFinite(n)
    ? "—"
    : new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

const fmtCurrencyPrecise = (n: number) =>
  !Number.isFinite(n)
    ? "—"
    : new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(n);

function monthlyPayment(principal: number, annualRatePct: number, amortYears: number) {
  const r = annualRatePct / 100 / 12;
  const n = amortYears * 12;
  if (r === 0) return principal / n;
  return (principal * (r * Math.pow(1 + r, n))) / (Math.pow(1 + r, n) - 1);
}

function buildSchedule(
  principal: number,
  annualRatePct: number,
  amortYears: number,
  remainingYears: number
) {
  const r = annualRatePct / 100 / 12;
  const totalAmortMonths = Math.round(amortYears * 12);
  const horizonMonths = Math.round(remainingYears * 12);
  const payment = monthlyPayment(principal, annualRatePct, amortYears);
  let bal = principal;
  const rows: { month: number; payment: number; interest: number; principal: number; balance: number }[] = [];

  for (let m = 1; m <= horizonMonths; m++) {
    const interest = r === 0 ? 0 : bal * r;
    let principalPaid = payment - interest;
    if (m > totalAmortMonths) principalPaid = 0;
    if (principalPaid > bal) principalPaid = bal;
    bal -= principalPaid;
    rows.push({
      month: m,
      payment,
      interest,
      principal: principalPaid,
      balance: bal < 0 ? 0 : bal,
    });
    if (bal <= 0.01) break;
  }

  return {
    payment,
    rows,
    balloon: bal < 0 ? 0 : bal,
  };
}

function aggregateAnnual(
  rows: { month: number; payment: number; interest: number; principal: number; balance: number }[]
) {
  const out: { year: number; payment: number; interest: number; principal: number; balance: number }[] = [];
  for (let i = 0; i < rows.length; i += 12) {
    const chunk = rows.slice(i, i + 12);
    if (!chunk.length) continue;
    const yearNum = Math.floor(i / 12) + 1;
    out.push({
      year: yearNum,
      payment: chunk.reduce((a, r) => a + r.payment, 0),
      interest: chunk.reduce((a, r) => a + r.interest, 0),
      principal: chunk.reduce((a, r) => a + r.principal, 0),
      balance: chunk[chunk.length - 1].balance,
    });
  }
  return out;
}

const DEAL_TYPES = [
  "Refinance",
  "Acquisition",
  "Cash-out refi",
  "Working capital LOC",
  "Construction / bridge",
  "SBA / owner-occupied",
];

const BOTTOM_TABS = ["Home", "Personal", "Business", "Assets", "AI", "Settings"];

function BottomNav() {
  return (
    <div className="cf-bottom-nav">
      {BOTTOM_TABS.map((t) => (
        <span key={t} className={t === "Business" ? "cf-bottom-tab cf-active" : "cf-bottom-tab"}>
          {t}
        </span>
      ))}
    </div>
  );
}

function ScreenHeader({ chip }: { chip: string }) {
  return (
    <>
      <div className="cf-status-bar">
        <span>9:41</span>
        <span>5G ◉◉◉</span>
      </div>
      <div className="cf-top-row">
        <div className="cf-brand">
          <div className="cf-logo">CF</div>
          <div className="cf-brand-name">CFOworks</div>
        </div>
        <div className="cf-chip">{chip}</div>
      </div>
    </>
  );
}

function ScenarioRunnerBlock() {
  const [balance, setBalance] = useState("8420000");
  const [currentRate, setCurrentRate] = useState("5.65");
  const [scenarioRate, setScenarioRate] = useState("4.85");
  const [remainingYears, setRemainingYears] = useState("9.5");
  const [amortYears, setAmortYears] = useState("25");
  const [closingCosts, setClosingCosts] = useState("95000");
  const [monthlyEscrow, setMonthlyEscrow] = useState("10500");
  const [view, setView] = useState<"monthly" | "annual">("monthly");

  type Cached = {
    current: ReturnType<typeof buildSchedule>;
    monthly: ReturnType<typeof buildSchedule>;
    annual: ReturnType<typeof aggregateAnnual>;
    monthlySavings: number;
    annualSavings: number;
    breakeven: number;
  };

  const cached = useMemo((): Cached | null => {
    const principal = parseFloat(balance || "0");
    const cr = parseFloat(currentRate || "0");
    const sr = parseFloat(scenarioRate || "0");
    const ry = parseFloat(remainingYears || "0");
    const ay = parseFloat(amortYears || "0");
    const closing = parseFloat(closingCosts || "0");
    if (!principal || !ry || !ay) return null;

    const current = buildSchedule(principal, cr, ay, ry);
    const scenario = buildSchedule(principal, sr, ay, ry);
    const monthlySavings = current.payment - scenario.payment;
    const annualSavings = monthlySavings * 12;
    const breakeven = monthlySavings > 0 ? closing / monthlySavings : 0;

    return {
      current,
      monthly: scenario,
      annual: aggregateAnnual(scenario.rows),
      monthlySavings,
      annualSavings,
      breakeven,
    };
  }, [balance, currentRate, scenarioRate, remainingYears, amortYears, closingCosts, monthlyEscrow]);

  const escrow = parseFloat(monthlyEscrow || "0");

  const display = cached;
  const cr = parseFloat(currentRate || "0");
  const sr = parseFloat(scenarioRate || "0");
  const ry = parseFloat(remainingYears || "0");
  const ay = parseFloat(amortYears || "0");

  return (
    <>
      <div className="cf-card">
        <div className="cf-field-label">Inputs</div>
        <div className="cf-field-row">
          <div className="cf-field-label">Current balance</div>
          <input className="cf-input" value={balance} onChange={(e) => setBalance(e.target.value)} />
        </div>
        <div className="cf-field-row">
          <div className="cf-field-label">Current rate (%)</div>
          <input className="cf-input" value={currentRate} onChange={(e) => setCurrentRate(e.target.value)} />
        </div>
        <div className="cf-field-row">
          <div className="cf-field-label">Scenario rate (%)</div>
          <input className="cf-input" value={scenarioRate} onChange={(e) => setScenarioRate(e.target.value)} />
        </div>
        <div className="cf-field-row">
          <div className="cf-field-label">Remaining term (years)</div>
          <input className="cf-input" value={remainingYears} onChange={(e) => setRemainingYears(e.target.value)} />
        </div>
        <div className="cf-field-row">
          <div className="cf-field-label">Amortization term (years)</div>
          <input className="cf-input" value={amortYears} onChange={(e) => setAmortYears(e.target.value)} />
        </div>
        <div className="cf-field-row">
          <div className="cf-field-label">Closing costs</div>
          <input className="cf-input" value={closingCosts} onChange={(e) => setClosingCosts(e.target.value)} />
        </div>
        <div className="cf-field-row">
          <div className="cf-field-label">Monthly escrow (optional)</div>
          <input className="cf-input" value={monthlyEscrow} onChange={(e) => setMonthlyEscrow(e.target.value)} />
        </div>
        <div className="cf-pill-row">
          <button
            type="button"
            className={`cf-pill-toggle ${view === "monthly" ? "cf-active" : ""}`}
            onClick={() => setView("monthly")}
          >
            Monthly amortization
          </button>
          <button
            type="button"
            className={`cf-pill-toggle ${view === "annual" ? "cf-active" : ""}`}
            onClick={() => setView("annual")}
          >
            Annual amortization
          </button>
        </div>
        <button type="button" className="cf-btn-primary">
          Run scenario
        </button>
      </div>

      {display && (
        <>
          <div className="cf-card">
            <div className="cf-field-label">Scenario summary</div>
            <div className="cf-scenario-grid">
              <div className="cf-metric-box">
                <div className="cf-metric-label">Current monthly P&I</div>
                <div className="cf-metric-value">{fmtCurrency(display.current.payment + escrow)}</div>
                <div className="cf-metric-sub">Includes escrow</div>
              </div>
              <div className="cf-metric-box">
                <div className="cf-metric-label">Scenario monthly P&I</div>
                <div className="cf-metric-value">{fmtCurrency(display.monthly.payment + escrow)}</div>
                <div className="cf-metric-sub">Includes escrow</div>
              </div>
              <div className="cf-metric-box">
                <div className="cf-metric-label">Monthly savings</div>
                <div className="cf-metric-value">{fmtCurrency(display.monthlySavings)}</div>
                <div className="cf-metric-sub">Current vs scenario</div>
              </div>
              <div className="cf-metric-box">
                <div className="cf-metric-label">Annual savings</div>
                <div className="cf-metric-value">{fmtCurrency(display.annualSavings)}</div>
                <div className="cf-metric-sub">12 × monthly delta</div>
              </div>
              <div className="cf-metric-box">
                <div className="cf-metric-label">Break-even</div>
                <div className="cf-metric-value">
                  {display.monthlySavings > 0 ? `${display.breakeven.toFixed(1)} mo` : "—"}
                </div>
                <div className="cf-metric-sub">Closing costs / monthly savings</div>
              </div>
              <div className="cf-metric-box">
                <div className="cf-metric-label">Balloon at maturity</div>
                <div className="cf-metric-value">{fmtCurrency(display.monthly.balloon)}</div>
                <div className="cf-metric-sub">At end of remaining term</div>
              </div>
            </div>
            <div className="cf-helper">
              Scenario compares <strong>{cr.toFixed(2)}%</strong> vs <strong>{sr.toFixed(2)}%</strong> over{" "}
              <strong>{ry.toFixed(1)} years remaining</strong> with <strong>{ay.toFixed(1)} years amortization</strong>.
              Monthly payments shown <em>include escrow</em> of {fmtCurrency(escrow)}.
            </div>
          </div>

          <div className="cf-card">
            <div className="cf-field-label">{view === "monthly" ? "Monthly amortization" : "Annual amortization"}</div>
            {view === "monthly" ? (
              <>
                <table className="cf-am-table">
                  <thead>
                    <tr>
                      <th>Month</th>
                      <th>Payment</th>
                      <th>Principal</th>
                      <th>Interest</th>
                      <th>Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {display.monthly.rows.slice(0, 24).map((r) => (
                      <tr key={r.month}>
                        <td>{r.month}</td>
                        <td>{fmtCurrencyPrecise(r.payment)}</td>
                        <td>{fmtCurrencyPrecise(r.principal)}</td>
                        <td>{fmtCurrencyPrecise(r.interest)}</td>
                        <td>{fmtCurrencyPrecise(r.balance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="cf-helper">Showing first 24 months. Export full schedule in production.</div>
              </>
            ) : (
              <table className="cf-am-table">
                <thead>
                  <tr>
                    <th>Year</th>
                    <th>Total Pmts</th>
                    <th>Principal</th>
                    <th>Interest</th>
                    <th>Ending Bal</th>
                  </tr>
                </thead>
                <tbody>
                  {display.annual.map((r) => (
                    <tr key={r.year}>
                      <td>Year {r.year}</td>
                      <td>{fmtCurrencyPrecise(r.payment)}</td>
                      <td>{fmtCurrencyPrecise(r.principal)}</td>
                      <td>{fmtCurrencyPrecise(r.interest)}</td>
                      <td>{fmtCurrencyPrecise(r.balance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <button type="button" className="cf-btn-secondary">
              Export schedule (dev to wire CSV/PDF)
            </button>
          </div>
        </>
      )}
    </>
  );
}

export function CfoBrokeragePhone() {
  const [dealType, setDealType] = useState("Refinance");
  const [consentOn, setConsentOn] = useState(true);

  return (
    <div id="cf-broker-root">
      <div className="cf-phone">
        {/* LB1 */}
        <div className="cf-screen" data-label="SCREEN LB1 · LOAN BROKERAGE HOME">
          <ScreenHeader chip="Loan brokerage" />
          <div className="cf-title">Loans & refi marketplace.</div>
          <div className="cf-subtitle">
            Package commercial deals for lender partners, compare term sheets, and track fees — all from CFOworks.
          </div>
          <div className="cf-card">
            <div className="cf-card-header">
              <div>
                <div className="cf-card-title">Pipeline snapshot</div>
                <div className="cf-card-sub">Across all active commercial deals.</div>
              </div>
            </div>
            <div className="cf-two-col" style={{ marginTop: 4 }}>
              <div className="cf-card">
                <div className="cf-field-label">Open deals</div>
                <div className="cf-list-main-kpi">9</div>
                <div className="cf-list-sub">4 refi, 3 acquisition, 2 LOC</div>
              </div>
              <div className="cf-card">
                <div className="cf-field-label">Term sheets out</div>
                <div className="cf-list-main-kpi">3</div>
                <div className="cf-list-sub">Awaiting borrower response</div>
              </div>
            </div>
            <div className="cf-two-col" style={{ marginTop: 8 }}>
              <div className="cf-card">
                <div className="cf-field-label">Funded YTD</div>
                <div className="cf-list-main-kpi">$18.6M</div>
                <div className="cf-list-sub">6 closed deals</div>
              </div>
              <div className="cf-card">
                <div className="cf-field-label">Potential fee pipeline</div>
                <div className="cf-list-main-kpi">$224k</div>
                <div className="cf-list-sub">Modeled referral / brokerage fees</div>
              </div>
            </div>
          </div>
          <div className="cf-card">
            <div className="cf-field-label">Workspaces</div>
            <div className="cf-list-row">
              <div className="cf-list-left">
                <div className="cf-list-title">New loan package</div>
                <div className="cf-list-sub">
                  Start refinance, acquisition, bridge, construction, or working capital deal.
                </div>
              </div>
              <div className="cf-list-right">
                <div>Start &gt;</div>
              </div>
            </div>
            <div className="cf-list-row">
              <div className="cf-list-left">
                <div className="cf-list-title">Package QA</div>
                <div className="cf-list-sub">See what&apos;s missing before sending to lender partners.</div>
              </div>
              <div className="cf-list-right">
                <div>Open &gt;</div>
              </div>
            </div>
            <div className="cf-list-row">
              <div className="cf-list-left">
                <div className="cf-list-title">Lender match</div>
                <div className="cf-list-sub">Match deals to banks, debt funds, credit unions, or SBA lenders.</div>
              </div>
              <div className="cf-list-right">
                <div>Open &gt;</div>
              </div>
            </div>
            <div className="cf-list-row">
              <div className="cf-list-left">
                <div className="cf-list-title">Refi scenarios</div>
                <div className="cf-list-sub">Run rate, term, amortization, and break-even what-ifs.</div>
              </div>
              <div className="cf-list-right">
                <div>Open &gt;</div>
              </div>
            </div>
          </div>
          <div className="cf-helper">
            CFOworks may receive lender compensation on commercial deals. Borrower disclosure and consent happen before any
            package is shared.
          </div>
          <BottomNav />
        </div>

        {/* LB2 */}
        <div className="cf-screen" data-label="SCREEN LB2 · NEW DEAL INTAKE">
          <ScreenHeader chip="New deal" />
          <div className="cf-title">Create a loan package.</div>
          <div className="cf-subtitle">Choose the deal type, borrowing entity, collateral, and target structure.</div>
          <div className="cf-card">
            <div className="cf-field-row">
              <div className="cf-field-label">Deal type</div>
              <div className="cf-pill-row">
                {DEAL_TYPES.map((d) => (
                  <button
                    key={d}
                    type="button"
                    className={`cf-pill-toggle ${dealType === d ? "cf-active" : ""}`}
                    onClick={() => setDealType(d)}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
            <div className="cf-field-row">
              <div className="cf-field-label">Borrowing entity</div>
              <input className="cf-input" placeholder="Select entity (e.g. Johnson Realty LLC)" />
            </div>
            <div className="cf-field-row">
              <div className="cf-field-label">Collateral / property</div>
              <input className="cf-input" placeholder="Select property or leave blank for unsecured / company loan" />
            </div>
            <div className="cf-field-row">
              <div className="cf-field-label">Requested amount</div>
              <input className="cf-input" placeholder="$ amount" />
            </div>
            <div className="cf-field-row">
              <div className="cf-field-label">Use of proceeds</div>
              <input className="cf-input" placeholder="e.g. Refinance existing debt + fund reserves" />
            </div>
            <div className="cf-field-row">
              <div className="cf-field-label">Target close date</div>
              <input className="cf-input" placeholder="MM / DD / YYYY" />
            </div>
          </div>
          <button type="button" className="cf-btn-primary">
            Next: Borrower & ownership
          </button>
          <button type="button" className="cf-btn-secondary">
            Save draft
          </button>
          <BottomNav />
        </div>

        {/* LB3 */}
        <div className="cf-screen" data-label="SCREEN LB3 · BORROWER & OWNERSHIP TREE">
          <ScreenHeader chip="Borrower" />
          <div className="cf-title">Borrower & ownership tree.</div>
          <div className="cf-subtitle">
            Lenders need to know who is borrowing, who owns it, and whether there are parent / holdco structures above it.
          </div>
          <div className="cf-card">
            <div className="cf-field-label">Borrower structure</div>
            <div className="cf-list-row">
              <div className="cf-list-left">
                <div className="cf-list-title">Johnson Realty LLC</div>
                <div className="cf-list-sub">Borrower · Owns Maplewood Apartments directly.</div>
              </div>
              <div className="cf-list-right">
                <div className="cf-tag">Borrower</div>
              </div>
            </div>
            <div className="cf-list-row">
              <div className="cf-list-left">
                <div className="cf-list-title">BlueLake Holdings LP</div>
                <div className="cf-list-sub">Parent / holdco owner of Johnson Realty LLC.</div>
              </div>
              <div className="cf-list-right">
                <div>Open entity &gt;</div>
              </div>
            </div>
            <div className="cf-field-row">
              <div className="cf-field-label">Why this matters</div>
              <div className="cf-field-muted">
                We&apos;ll include the borrowing entity plus any parent / holdco relationship the lender should see.
              </div>
            </div>
          </div>
          <div className="cf-card">
            <div className="cf-field-label">Current ownership</div>
            <div className="cf-list-row">
              <div className="cf-list-left">
                <div className="cf-list-title">You</div>
                <div className="cf-list-sub">52% indirect ownership via BlueLake Holdings LP.</div>
              </div>
              <div className="cf-list-right">
                <div>Open owner &gt;</div>
              </div>
            </div>
            <div className="cf-list-row">
              <div className="cf-list-left">
                <div className="cf-list-title">Sara</div>
                <div className="cf-list-sub">18% indirect ownership.</div>
              </div>
              <div className="cf-list-right">
                <div>Open owner &gt;</div>
              </div>
            </div>
            <div className="cf-list-row">
              <div className="cf-list-left">
                <div className="cf-list-title">Other LPs / shareholders</div>
                <div className="cf-list-sub">All current owners shown from Equity module.</div>
              </div>
              <div className="cf-list-right">
                <div>View all &gt;</div>
              </div>
            </div>
          </div>
          <button type="button" className="cf-btn-primary">
            Next: Shareholders / sponsor package
          </button>
          <button type="button" className="cf-btn-secondary">
            Back
          </button>
          <BottomNav />
        </div>

        {/* LB4 */}
        <div className="cf-screen" data-label="SCREEN LB4 · SHAREHOLDERS & GUARANTORS">
          <ScreenHeader chip="Sponsors" />
          <div className="cf-title">All current shareholders & guarantors.</div>
          <div className="cf-subtitle">
            Commercial lenders usually require all current shareholders / members, plus personal financial statements for
            guarantors and often for 20%+ owners.
          </div>
          <div className="cf-card">
            <div className="cf-field-label">Sponsor roster</div>
            <div className="cf-list-row">
              <div className="cf-list-left">
                <div className="cf-list-title">You</div>
                <div className="cf-list-sub">52% owner · Personal guarantor: Yes.</div>
                <div className="cf-list-sub">PFS: complete · Global cash flow: complete · Personal taxes: 2022–2024 uploaded.</div>
              </div>
              <div className="cf-list-right">
                <div className="cf-badge-on">Ready</div>
              </div>
            </div>
            <div className="cf-list-row">
              <div className="cf-list-left">
                <div className="cf-list-title">Sara</div>
                <div className="cf-list-sub">18% owner · Personal guarantor: Yes.</div>
                <div className="cf-list-sub cf-danger-text">PFS missing current statement · Cash flow incomplete.</div>
              </div>
              <div className="cf-list-right">
                <div>Edit &gt;</div>
              </div>
            </div>
            <div className="cf-list-row">
              <div className="cf-list-left">
                <div className="cf-list-title">BlueLake Holdings LP</div>
                <div className="cf-list-sub">Entity owner · Needs controlling persons attached.</div>
              </div>
              <div className="cf-list-right">
                <div>Open &gt;</div>
              </div>
            </div>
            <div className="cf-helper">
              Default rule: show <strong>all current shareholders</strong>. Lender templates can later filter to guarantors or
              20%+ owners only.
            </div>
          </div>
          <button type="button" className="cf-btn-primary">
            Next: Sponsor detail / PFS
          </button>
          <button type="button" className="cf-btn-secondary">
            Back
          </button>
          <BottomNav />
        </div>

        {/* LB5 */}
        <div className="cf-screen" data-label="SCREEN LB5 · SPONSOR PFS">
          <ScreenHeader chip="Sara · sponsor" />
          <div className="cf-title">Sponsor detail · Sara.</div>
          <div className="cf-subtitle">
            Personal financial statement, liquidity, and cash flow used for commercial guarantor package.
          </div>
          <div className="cf-card">
            <div className="cf-field-label">Sponsor summary</div>
            <div className="cf-two-col" style={{ marginTop: 4 }}>
              <div className="cf-card">
                <div className="cf-field-label">Net worth</div>
                <div className="cf-list-main-kpi">$6.4M</div>
                <div className="cf-list-sub">From Personal CFO</div>
              </div>
              <div className="cf-card">
                <div className="cf-field-label">Liquidity</div>
                <div className="cf-list-main-kpi">$1.1M</div>
                <div className="cf-list-sub">Cash + marketable</div>
              </div>
            </div>
            <div className="cf-field-row">
              <div className="cf-field-label">Global cash flow</div>
              <div className="cf-field-value">+$18k/month</div>
              <div className="cf-field-muted">Salary, distributions, debt service, family burn considered.</div>
            </div>
          </div>
          <div className="cf-card">
            <div className="cf-field-label">Package completeness</div>
            <div className="cf-list-row">
              <div className="cf-list-left">
                <div className="cf-list-title">Personal financial statement</div>
                <div className="cf-list-sub">Last updated 4 months ago.</div>
              </div>
              <div className="cf-list-right">
                <div className="cf-warn-text">Refresh</div>
              </div>
            </div>
            <div className="cf-list-row">
              <div className="cf-list-left">
                <div className="cf-list-title">Global cash flow statement</div>
                <div className="cf-list-sub">Draft exists, not finalized.</div>
              </div>
              <div className="cf-list-right">
                <div className="cf-danger-text">Missing</div>
              </div>
            </div>
            <div className="cf-list-row">
              <div className="cf-list-left">
                <div className="cf-list-title">Personal tax returns</div>
                <div className="cf-list-sub">2022, 2023, 2024 uploaded to Vault.</div>
              </div>
              <div className="cf-list-right">
                <div className="cf-good-text">Complete</div>
              </div>
            </div>
            <button type="button" className="cf-btn-primary">
              Update PFS & cash flow
            </button>
            <button type="button" className="cf-btn-secondary">
              Pull latest from Personal CFO
            </button>
          </div>
          <BottomNav />
        </div>

        {/* LB6 */}
        <div className="cf-screen" data-label="SCREEN LB6 · BORROWER FINANCIAL PACKAGE">
          <ScreenHeader chip="Borrower package" />
          <div className="cf-title">Borrower financial package.</div>
          <div className="cf-subtitle">Auto-assemble the exact package your bank partners expect for the borrowing entity.</div>
          <div className="cf-card">
            <div className="cf-field-label">Required package</div>
            <div className="cf-list-row">
              <div className="cf-list-left">
                <div className="cf-list-title">Business tax returns (3 years)</div>
                <div className="cf-list-sub">2022, 2023, 2024 federal + state returns from Vault.</div>
              </div>
              <div className="cf-list-right">
                <div className="cf-good-text">Complete</div>
              </div>
            </div>
            <div className="cf-list-row">
              <div className="cf-list-left">
                <div className="cf-list-title">Current year financials</div>
                <div className="cf-list-sub">YTD P&L, balance sheet, cash flow, trial balance.</div>
              </div>
              <div className="cf-list-right">
                <div className="cf-good-text">Live</div>
              </div>
            </div>
            <div className="cf-list-row">
              <div className="cf-list-left">
                <div className="cf-list-title">AP / AR aging</div>
                <div className="cf-list-sub">Pulled from modules and attached automatically.</div>
              </div>
              <div className="cf-list-right">
                <div className="cf-good-text">Live</div>
              </div>
            </div>
            <div className="cf-list-row">
              <div className="cf-list-left">
                <div className="cf-list-title">Debt schedule</div>
                <div className="cf-list-sub">From Loans module, current balance + maturity.</div>
              </div>
              <div className="cf-list-right">
                <div className="cf-good-text">Live</div>
              </div>
            </div>
          </div>
          <div className="cf-card">
            <div className="cf-field-label">Preview exports</div>
            <div className="cf-list-row">
              <div className="cf-list-left">
                <div className="cf-list-title">YTD financial package</div>
                <div className="cf-list-sub">P&L + BS + cash flow + TB.</div>
              </div>
              <div className="cf-list-right">
                <div>Preview &gt;</div>
              </div>
            </div>
            <div className="cf-list-row">
              <div className="cf-list-left">
                <div className="cf-list-title">Banking liquidity summary</div>
                <div className="cf-list-sub">Operating balances, recent statements if lender asks.</div>
              </div>
              <div className="cf-list-right">
                <div>Preview &gt;</div>
              </div>
            </div>
            <button type="button" className="cf-btn-secondary">
              Generate borrower package PDF / ZIP
            </button>
          </div>
          <BottomNav />
        </div>

        {/* LB7 */}
        <div className="cf-screen" data-label="SCREEN LB7 · COLLATERAL PACKAGE">
          <ScreenHeader chip="Collateral" />
          <div className="cf-title">Property / collateral package.</div>
          <div className="cf-subtitle">Everything a commercial lender needs on the real estate or operating collateral.</div>
          <div className="cf-card">
            <div className="cf-field-label">Maplewood Apartments</div>
            <div className="cf-list-row">
              <div className="cf-list-left">
                <div className="cf-list-title">Rent roll</div>
                <div className="cf-list-sub">Current rent roll + occupancy from AR / Property module.</div>
              </div>
              <div className="cf-list-right">
                <div className="cf-good-text">Ready</div>
              </div>
            </div>
            <div className="cf-list-row">
              <div className="cf-list-left">
                <div className="cf-list-title">T-12 / T-24 operating statements</div>
                <div className="cf-list-sub">Pulled from Accounting automatically.</div>
              </div>
              <div className="cf-list-right">
                <div className="cf-good-text">Ready</div>
              </div>
            </div>
            <div className="cf-list-row">
              <div className="cf-list-left">
                <div className="cf-list-title">Property tax history</div>
                <div className="cf-list-sub">2025 protest active · 2024 reduction achieved.</div>
              </div>
              <div className="cf-list-right">
                <div>Open tax &gt;</div>
              </div>
            </div>
            <div className="cf-list-row">
              <div className="cf-list-left">
                <div className="cf-list-title">Insurance summary</div>
                <div className="cf-list-sub">COIs + current coverage + renewal dates.</div>
              </div>
              <div className="cf-list-right">
                <div>Open insurance &gt;</div>
              </div>
            </div>
          </div>
          <div className="cf-card">
            <div className="cf-field-label">Optional collateral docs</div>
            <div className="cf-list-row">
              <div className="cf-list-left">
                <div className="cf-list-title">Photos / site package</div>
                <div className="cf-list-sub">Exterior, units, deferred maintenance, before/after.</div>
              </div>
              <div className="cf-list-right">
                <div>Upload &gt;</div>
              </div>
            </div>
            <div className="cf-list-row">
              <div className="cf-list-left">
                <div className="cf-list-title">Title / survey / legal</div>
                <div className="cf-list-sub">Pulled from Vault if available.</div>
              </div>
              <div className="cf-list-right">
                <div>Open Vault &gt;</div>
              </div>
            </div>
          </div>
          <BottomNav />
        </div>

        {/* LB8 */}
        <div className="cf-screen" data-label="SCREEN LB8 · PROJECTIONS & NARRATIVE">
          <ScreenHeader chip="Projections" />
          <div className="cf-title">Projections & deal story.</div>
          <div className="cf-subtitle">
            Build the forward-looking case: NOI, cash flow, DSCR, and what the lender should understand.
          </div>
          <div className="cf-card">
            <div className="cf-field-label">Forward package</div>
            <div className="cf-list-row">
              <div className="cf-list-left">
                <div className="cf-list-title">12-month projection</div>
                <div className="cf-list-sub">Base case for NOI, debt service, and DSCR.</div>
              </div>
              <div className="cf-list-right">
                <div className="cf-good-text">Ready</div>
              </div>
            </div>
            <div className="cf-list-row">
              <div className="cf-list-left">
                <div className="cf-list-title">24-month projection</div>
                <div className="cf-list-sub">Optional for lenders asking for more runway.</div>
              </div>
              <div className="cf-list-right">
                <div>Generate</div>
              </div>
            </div>
            <div className="cf-list-row">
              <div className="cf-list-left">
                <div className="cf-list-title">Stress case</div>
                <div className="cf-list-sub">Lower occupancy / lower rents / higher rates.</div>
              </div>
              <div className="cf-list-right">
                <div>Generate</div>
              </div>
            </div>
          </div>
          <div className="cf-card">
            <div className="cf-field-label">Deal narrative</div>
            <div className="cf-field-muted">
              AI CFO drafts a lender-ready summary explaining the property, borrower, sponsorship, performance, use of proceeds,
              and why this is a strong credit.
            </div>
            <input className="cf-input" placeholder="Headline: e.g. Stabilized multifamily refi with strong DSCR" />
            <input className="cf-input" placeholder="Top narrative point 1" />
            <input className="cf-input" placeholder="Top narrative point 2" />
            <button type="button" className="cf-btn-secondary">
              Ask AI CFO to draft narrative
            </button>
          </div>
          <button type="button" className="cf-btn-primary">
            Next: Package QA
          </button>
          <button type="button" className="cf-btn-secondary">
            Back
          </button>
          <BottomNav />
        </div>

        {/* LB9 */}
        <div className="cf-screen" data-label="SCREEN LB9 · PACKAGE QA">
          <ScreenHeader chip="Package QA" />
          <div className="cf-title">Is the package actually lender-ready?</div>
          <div className="cf-subtitle">CFOworks scores the package before you send it. No more half-complete banker emails.</div>
          <div className="cf-card">
            <div className="cf-field-label">Completeness score</div>
            <div className="cf-two-col" style={{ marginTop: 4 }}>
              <div className="cf-card">
                <div className="cf-field-label">Overall package</div>
                <div className="cf-list-main-kpi">86%</div>
                <div className="cf-list-sub">Needs 3 items</div>
              </div>
              <div className="cf-card">
                <div className="cf-field-label">Sponsor package</div>
                <div className="cf-list-main-kpi cf-danger-text">71%</div>
                <div className="cf-list-sub">Sara missing updated PFS</div>
              </div>
            </div>
          </div>
          <div className="cf-card">
            <div className="cf-field-label">Missing / weak items</div>
            <div className="cf-list-row">
              <div className="cf-list-left">
                <div className="cf-list-title">Updated PFS – Sara</div>
                <div className="cf-list-sub">Last statement older than lender template allows.</div>
              </div>
              <div className="cf-list-right">
                <div className="cf-danger-text">Required</div>
              </div>
            </div>
            <div className="cf-list-row">
              <div className="cf-list-left">
                <div className="cf-list-title">Global cash flow – Sara</div>
                <div className="cf-list-sub">Draft exists but not finalized.</div>
              </div>
              <div className="cf-list-right">
                <div className="cf-danger-text">Required</div>
              </div>
            </div>
            <div className="cf-list-row">
              <div className="cf-list-left">
                <div className="cf-list-title">Updated site photos</div>
                <div className="cf-list-sub">Helpful, not mandatory for this lender tier.</div>
              </div>
              <div className="cf-list-right">
                <div className="cf-warn-text">Optional</div>
              </div>
            </div>
          </div>
          <button type="button" className="cf-btn-primary">
            Next: Scenario runner & lender match
          </button>
          <button type="button" className="cf-btn-secondary">
            Export QA checklist
          </button>
          <BottomNav />
        </div>

        {/* LB10 */}
        <div className="cf-screen" data-label="SCREEN LB10 · REFI SCENARIO RUNNER">
          <ScreenHeader chip="Scenario runner" />
          <div className="cf-title">Run rate & amortization scenarios.</div>
          <div className="cf-subtitle">
            Test different rates, terms, and amortization structures, then view monthly or annual schedules.
          </div>
          <ScenarioRunnerBlock />
          <BottomNav />
        </div>

        {/* LB11 */}
        <div className="cf-screen" data-label="SCREEN LB11 · LENDER MATCH & CONSENT">
          <ScreenHeader chip="Lender match" />
          <div className="cf-title">Match this deal to lenders.</div>
          <div className="cf-subtitle">CFOworks can share your package with selected lenders once you consent.</div>
          <div className="cf-card">
            <div className="cf-field-label">Potential lender matches</div>
            <div className="cf-list-row">
              <div className="cf-list-left">
                <div className="cf-list-title">First National Bank</div>
                <div className="cf-list-sub">Multifamily bridge / perm lender · DSCR and sponsor fit strong.</div>
              </div>
              <div className="cf-list-right">
                <div>Send &gt;</div>
              </div>
            </div>
            <div className="cf-list-row">
              <div className="cf-list-left">
                <div className="cf-list-title">Lone Star Credit Union</div>
                <div className="cf-list-sub">Lower leverage target, but competitive fixed rates.</div>
              </div>
              <div className="cf-list-right">
                <div>Send &gt;</div>
              </div>
            </div>
            <div className="cf-list-row">
              <div className="cf-list-left">
                <div className="cf-list-title">Summit Debt Fund</div>
                <div className="cf-list-sub">Good for quicker close; higher coupon.</div>
              </div>
              <div className="cf-list-right">
                <div>Send &gt;</div>
              </div>
            </div>
          </div>
          <div className="cf-card">
            <div className="cf-field-label">Disclosure & consent</div>
            <div className="cf-field-row">
              <div className="cf-field-muted">
                I authorize CFOworks to share this package with selected lenders and understand that CFOworks may receive
                referral or brokerage compensation if a loan closes.
              </div>
            </div>
            <div className="cf-pill-row">
              <button
                type="button"
                className={`cf-pill-toggle ${consentOn ? "cf-active" : ""}`}
                onClick={() => setConsentOn((v) => !v)}
              >
                I understand & consent
              </button>
            </div>
            <div className="cf-helper">
              This disclosure does not increase your rate or lender fees. Compensation is governed by separate agreements and
              subject to applicable commercial lending rules.
            </div>
          </div>
          <button type="button" className="cf-btn-primary" disabled={!consentOn}>
            Send package to selected lenders
          </button>
          <button type="button" className="cf-btn-secondary">
            Share with my own lender / broker
          </button>
          <BottomNav />
        </div>

        {/* LB12 */}
        <div className="cf-screen" data-label="SCREEN LB12 · TERM SHEET COMPARE">
          <ScreenHeader chip="Term sheets" />
          <div className="cf-title">Compare term sheets.</div>
          <div className="cf-subtitle">
            Side-by-side lender offers with rate, term, fees, covenants, and required guaranties.
          </div>
          <div className="cf-card">
            <div className="cf-field-label">Top offers</div>
            <div className="cf-list-row">
              <div className="cf-list-left">
                <div className="cf-list-title">First National Bank</div>
                <div className="cf-list-sub">
                  4.90% fixed · 10 yrs · 25-yr amort · 0.75 points · Recourse limited.
                </div>
              </div>
              <div className="cf-list-right">
                <div className="cf-badge-on">Best fit</div>
              </div>
            </div>
            <div className="cf-list-row">
              <div className="cf-list-left">
                <div className="cf-list-title">Lone Star Credit Union</div>
                <div className="cf-list-sub">
                  4.82% fixed · 7 yrs · 25-yr amort · 1.10 points · Full recourse.
                </div>
              </div>
              <div className="cf-list-right">
                <div>Compare</div>
              </div>
            </div>
            <div className="cf-list-row">
              <div className="cf-list-left">
                <div className="cf-list-title">Summit Debt Fund</div>
                <div className="cf-list-sub">6.10% floating · 3 yrs · IO 12 mo · Fast close.</div>
              </div>
              <div className="cf-list-right">
                <div>Compare</div>
              </div>
            </div>
          </div>
          <button type="button" className="cf-btn-primary">
            Mark chosen lender
          </button>
          <button type="button" className="cf-btn-secondary">
            Export comparison memo
          </button>
          <BottomNav />
        </div>

        {/* LB13 */}
        <div className="cf-screen" data-label="SCREEN LB13 · CLOSING & FUNDED">
          <ScreenHeader chip="Closing tracker" />
          <div className="cf-title">Closing tracker · First National Bank.</div>
          <div className="cf-subtitle">
            Keep appraisal, title, legal, insurance, and funding organized until the deal closes.
          </div>
          <div className="cf-card">
            <div className="cf-field-label">Checklist</div>
            <div className="cf-list-row">
              <div className="cf-list-left">
                <div className="cf-list-title">Appraisal ordered</div>
                <div className="cf-list-sub">Expected back May 20.</div>
              </div>
              <div className="cf-list-right">
                <div className="cf-good-text">Done</div>
              </div>
            </div>
            <div className="cf-list-row">
              <div className="cf-list-left">
                <div className="cf-list-title">Title / survey</div>
                <div className="cf-list-sub">Vault docs shared to lender counsel.</div>
              </div>
              <div className="cf-list-right">
                <div className="cf-good-text">Done</div>
              </div>
            </div>
            <div className="cf-list-row">
              <div className="cf-list-left">
                <div className="cf-list-title">Insurance certificates</div>
                <div className="cf-list-sub">Need lender named as mortgagee / additional insured.</div>
              </div>
              <div className="cf-list-right">
                <div className="cf-warn-text">Pending</div>
              </div>
            </div>
            <div className="cf-list-row">
              <div className="cf-list-left">
                <div className="cf-list-title">Entity resolution / signatures</div>
                <div className="cf-list-sub">Borrowing resolution for Johnson Realty LLC.</div>
              </div>
              <div className="cf-list-right">
                <div className="cf-warn-text">Pending</div>
              </div>
            </div>
          </div>
          <div className="cf-card">
            <div className="cf-field-label">When funded</div>
            <div className="cf-field-muted">
              On funding, CFOworks should:
              <br />• Create / update the live loan in Loans module
              <br />• Update Banking funding account
              <br />• Post accounting entries (liability, fees, payoff)
              <br />• Refresh AI CFO cashflow / refi logic
            </div>
            <button type="button" className="cf-btn-primary">
              Mark loan funded
            </button>
            <button type="button" className="cf-btn-secondary">
              Upload closing package
            </button>
          </div>
          <BottomNav />
        </div>
      </div>
    </div>
  );
}
