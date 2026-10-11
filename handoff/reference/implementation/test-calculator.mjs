import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {calculateScenario} from './calculator.mjs';
const d=JSON.parse(readFileSync(new URL('./calculator-defaults.json',import.meta.url)));
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-6,`${a} != ${b}`);
const base=calculateScenario(d);
near(base.base,25980);near(base.overhead,7794);near(base.turnover,3897);
near(base.labourAvoided,37671);near(base.quality,4350);near(base.cashMonthly,36021);
assert.equal(base.payback,1);assert.equal(base.series.length,37);
near(base.cashGain,base.economicGain);assert.equal(base.productiveValue,0);
// No cashable labour or quality reductions means the subscription is a cost.
const noSavings=calculateScenario({...d,labourRealisation:0,errorReduction:0,incidentReduction:0,inflation:0});
near(noSavings.cashMonthly,-6000);near(noSavings.cashGain,-236000);assert.equal(noSavings.payback,null);near(noSavings.roi,-100);
// Extra output can affect the economic view without inflating the cash view.
const extra=calculateScenario({...d,productivityRealisation:100});
near(extra.cashGain,base.cashGain);near(extra.productiveValue,9872.4);near(extra.economicGain-extra.cashGain,9872.4*36);
// Setup costs recover on a whole-month cumulative cash basis.
const horizon=calculateScenario({...d,workers:0,errors:0,incidents:0,subscription:0,setup:500,operations:0});
assert.equal(horizon.payback,null);near(horizon.cashGain,-500);near(horizon.roi,-100);
const zero=calculateScenario({...d,workers:0,errors:0,incidents:0,subscription:0,setup:0,operations:0});
assert.equal(zero.roi,null);assert.equal(zero.payback,0);near(zero.cashGain,0);
// A two-shift staffing input represents workers per shift, not three total staff.
const oneShift=calculateScenario({...d,shifts:1});near(oneShift.base,base.base/2);
const operations=calculateScenario({...d,operations:1000});near(operations.cashMonthly,base.cashMonthly-1000);near(operations.cashGain,base.cashGain-36000);
assert.throws(()=>calculateScenario({...d,years:0}));assert.throws(()=>calculateScenario({...d,wage:NaN}));assert.throws(()=>calculateScenario({...d,setup:-1}));
assert.throws(()=>calculateScenario({...d,robots:0}));assert.throws(()=>calculateScenario({...d,labourRealisation:101}));assert.throws(()=>calculateScenario({}));
const beyondTerm=calculateScenario({...d,workers:0,subscription:0,errors:100,errorReduction:100,incidents:0,years:1,setup:20000,inflation:0});
assert.equal(beyondTerm.payback,null);near(beyondTerm.cashGain,-18800);
console.log(JSON.stringify({status:'passed',scenarios:14,defaultCashMonthly:base.cashMonthly,defaultContractGain:base.cashGain,defaultEconomicGain:base.economicGain}));
