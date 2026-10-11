/** Review model: separates cash effects from explicitly realised extra output.
 * Existing model used the whole workforce as an avoided cost and mixed productivity
 * into cash savings. Inputs remain illustrative; no capacity matching is implied.
 */
export function calculateScenario(s) {
  const required=['workers','wage','shifts','days','overhead','turnover','labourRealisation','robots','subscription','setup','uptime','productivity','productivityRealisation','years','operations','errors','errorReduction','incidents','incidentReduction','inflation'];
  for (const key of required) {
    const value=s[key];
    if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) throw new Error(`Invalid ${key}`);
  }
  for(const key of ['overhead','turnover','labourRealisation','uptime','productivityRealisation','errorReduction','incidentReduction'])if(s[key]>100)throw new Error(`Invalid percentage: ${key}`);
  if(!Number.isInteger(s.robots)||s.robots<1||s.robots>20)throw new Error('Use 1 to 20 robots');
  if(!Number.isInteger(s.workers)||s.workers>20)throw new Error('Use 0 to 20 workers per shift');
  if(!Number.isInteger(s.shifts)||s.shifts<1||s.shifts>3)throw new Error('Use 1 to 3 shifts');
  if(!Number.isInteger(s.days)||s.days<1||s.days>7)throw new Error('Use 1 to 7 working days');
  const months=Math.round(s.years*12);
  if(months<1||months>60)throw new Error('Contract must be 1 to 60 months');
  const base=s.workers*s.wage*s.shifts*8*s.days*4.33;
  const overhead=base*s.overhead/100;
  const turnover=base*s.turnover/100*.75;
  const labourAvoided=(base+overhead+turnover)*s.labourRealisation/100;
  const quality=s.errors*s.errorReduction/100+s.incidents*s.incidentReduction/100;
  const subscription=s.robots*s.subscription;
  const recurring=subscription+s.operations;
  const productiveValue=base*s.productivity/100*s.uptime/100*s.productivityRealisation/100;
  const cashMonthly=labourAvoided+quality-recurring;
  let cash=-s.setup,economic=-s.setup,payback=s.setup===0&&cashMonthly>=0?0:null;
  const series=[{month:0,cash,economic}];
  for(let month=1;month<=months;month++) {
    // Month 1 is the configured baseline; annual labour inflation follows it.
    const inflation=(1+s.inflation/100)**((month-1)/12);
    const monthCash=labourAvoided*inflation+quality-recurring;
    cash+=monthCash;
    economic+=monthCash+productiveValue;
    if(payback===null && cash>=0)payback=month;
    series.push({month,cash,economic});
  }
  const investment=s.setup+recurring*months;
  return {base,overhead,turnover,labourAvoided,quality,subscription,recurring,productiveValue,
    cashMonthly,cashGain:cash,economicGain:economic,payback,months,investment,
    roi:investment>0?cash/investment*100:null,series};
}
