# VirtuAlly Virtual Nurse ROI Calculator — Full Spec

## Global Constant
- **VirtuAlly Optimized Time = 52.5 minutes** (combined admission + discharge time once VRN is in place). This is the fixed target the calculator compares against.

## Project / Hospital Info Inputs (defaults based on a typical 150-bed U.S. hospital)
| Input | Default | Notes |
|---|---|---|
| Hospital/Facility Name | "" | Text |
| Project Champion / Contact | "" | Text |
| Proposal Date | today | Date |
| Number of Beds | 150 | |
| Average Daily Census | 110 | Avg patients occupied/day |
| Average Length of Stay (days) | 4.8 | |
| VirtuAlly Annual Investment | $250,000 | Annual cost of the VRN solution (quote-based) |

## Admission & Discharge Inputs
| Input | Default |
|---|---|
| RN Hourly Wage | $55 |
| Avg Minutes per Admission | 90 |
| Avg Minutes per Discharge | 75 |
| # Admissions/Discharges per Year | 8,700 |

**Derived:**
- Total Baseline Time = admission + discharge = **165 min**
- Time Saved per Patient = `max(0, 165 − 52.5)` = **112.5 min**
- Percentage Reduction = `(165 − 52.5) / 165` = **68.2%** (auto-calculated, not an input)

## Fall Prevention Inputs (toggle: included by default)
| Input | Default |
|---|---|
| Include Fall Prevention | true |
| Falls per Year | 95 |
| Cost per Fall | $35,000 |
| Fall Reduction % | 25% |

## Sepsis Inputs
| Input | Default |
|---|---|
| Sepsis Cases per Year | 140 |
| Cost per Sepsis Case | $32,000 |
| Sepsis Reduction % | 15% |

## Readmission Inputs
| Input | Default |
|---|---|
| Readmissions per Year | 520 |
| Cost per Readmission | $16,000 |
| Readmission Reduction % | 20% |

## Nurse Retention Inputs
| Input | Default |
|---|---|
| Total Nurses | 120 |
| Retention Improvement % | 12% |
| Replacement Cost per Nurse | $52,000 *(collected but NOT used in current formula)* |
| Contract Labor Hourly Cost | $95 (avg travel-nurse rate) |

## Time Reallocation Inputs (informational, NOT in financial ROI)
| Input | Default |
|---|---|
| Time Saved per Shift (min) | 120 |
| Nurses Using VRN | 50 |

---

## Formulas (Annual)

### 1. Admission & Discharge Savings
```
timeSavedPerPatient = max(0, (admitMin + dischargeMin) − 52.5)
savingsPerAdmission = (timeSavedPerPatient / 60) × rnWage
admissionAnnual     = savingsPerAdmission × admissionsPerYear
```

### 2. Fall Prevention Savings (0 if toggle off)
```
fallAnnual = fallsPerYear × (fallReduction% / 100) × costPerFall
```

### 3. Sepsis Savings
```
sepsisAnnual = sepsisCases × (sepsisReduction% / 100) × costPerSepsis
```

### 4. Readmission Savings
```
readmitAnnual = readmissions × (readmitReduction% / 100) × costPerReadmission
```

### 5. Nurse Retention Savings (ongoing contract-labor premium avoided)
```
retainedNurses      = totalNurses × (retentionImprovement% / 100)
annualHoursPerNurse = 2080   (full-time equivalent)
premiumCostPerHour  = max(0, contractLaborHourlyCost − rnWage)
retentionAnnual     = retainedNurses × 2080 × premiumCostPerHour
```

### 6. Time Reallocation (reported, excluded from ROI totals)
```
totalMinutesPerYear    = timeSavedPerShift × nursesUsingVRN × 260   (260 working days)
totalHoursPerYear      = totalMinutesPerYear / 60
totalShiftsPerYear     = totalHoursPerYear / 12   (12-hr shifts)
timeReallocationAnnual = totalHoursPerYear × rnWage
```

---

## Output Totals
```
grossAnnual    = admissionAnnual + fallAnnual + sepsisAnnual + readmitAnnual + retentionAnnual
grossQuarterly = grossAnnual / 4
netAnnual      = grossAnnual − solutionInvestment
netQuarterly   = grossQuarterly − (solutionInvestment / 4)
roiPercentage  = (netAnnual / solutionInvestment) × 100
paybackPeriod  = (solutionInvestment / grossAnnual) × 12   (months)
```

---

## Key Assumptions / Citations baked in
- All defaults represent **national averages for a 150-bed U.S. hospital and peer-reviewed virtual-nursing impact studies** (the disclaimer shown in the app).
- **52.5 min** optimized admission + discharge is treated as a fixed VRN benchmark.
- **2,080 hours/yr** = standard full-time nurse hours.
- **260 working days/yr** and **12-hour shifts** for time-reallocation math.
- Retention savings are modeled as the **premium cost avoided by not using contract/travel labor** (contract rate − staff RN wage), not one-time replacement cost. `replacementCostPerNurse` ($52k) is still collected but is not part of the active formula.
- Time reallocation is reported as an operational benefit but **deliberately excluded** from the financial ROI totals to avoid double-counting.
