"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { HelpCircle, Download } from "lucide-react"
import Image from "next/image"
import { jsPDF } from "jspdf"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts"

// Custom tooltip component
const Tooltip = ({ text }: { text: string }) => (
  <span className="ml-1 inline-flex items-center text-gray-400 cursor-help" title={text}>
    <HelpCircle size={14} />
  </span>
)

export default function VirtualNurseSavingsCalculator() {
  // Updated default values based on 150-bed hospital
  const [rnWage, setRnWage] = useState(55)
  const [baselineHours, setBaselineHours] = useState(1.5)
  const [reductionPercent, setReductionPercent] = useState(35)
  const [admissionsPerYear, setAdmissionsPerYear] = useState(8700)

  const [fallsPerYear, setFallsPerYear] = useState(135)
  const [costPerFall, setCostPerFall] = useState(61000)
  const [fallReductionPercent, setFallReductionPercent] = useState(25)

  const [sepsisCasesPerYear, setSepsisCasesPerYear] = useState(110)
  const [costPerSepsis, setCostPerSepsis] = useState(18000)
  const [sepsisReductionPercent, setSepsisReductionPercent] = useState(15)

  const [readmissionsPerYear, setReadmissionsPerYear] = useState(520)
  const [costPerReadmission, setCostPerReadmission] = useState(16000)
  const [readmitReductionPercent, setReadmitReductionPercent] = useState(20)

  const [nursesRetained, setNursesRetained] = useState(8)
  const [replacementCostPerNurse, setReplacementCostPerNurse] = useState(52000)

  // Reset to default values function
  const resetDefaults = () => {
    setRnWage(55)
    setBaselineHours(1.5)
    setReductionPercent(35)
    setAdmissionsPerYear(8700)
    setFallsPerYear(135)
    setCostPerFall(61000)
    setFallReductionPercent(25)
    setSepsisCasesPerYear(110)
    setCostPerSepsis(18000)
    setSepsisReductionPercent(15)
    setReadmissionsPerYear(520)
    setCostPerReadmission(16000)
    setReadmitReductionPercent(20)
    setNursesRetained(8)
    setReplacementCostPerNurse(52000)
  }

  // Calculate ROI
  const calculateROI = () => {
    const savingsPerAdmission = baselineHours * (reductionPercent / 100) * rnWage
    const admissionAnnual = savingsPerAdmission * admissionsPerYear

    const fallAnnual = fallsPerYear * (fallReductionPercent / 100) * costPerFall
    const sepsisAnnual = sepsisCasesPerYear * (sepsisReductionPercent / 100) * costPerSepsis
    const readmitAnnual = readmissionsPerYear * (readmitReductionPercent / 100) * costPerReadmission
    const retentionAnnual = nursesRetained * replacementCostPerNurse

    const totalAnnual = admissionAnnual + fallAnnual + sepsisAnnual + readmitAnnual + retentionAnnual
    const totalQuarterly = totalAnnual / 4

    return {
      admissionAnnual,
      fallAnnual,
      sepsisAnnual,
      readmitAnnual,
      retentionAnnual,
      totalAnnual,
      totalQuarterly,
    }
  }

  const { admissionAnnual, fallAnnual, sepsisAnnual, readmitAnnual, retentionAnnual, totalAnnual, totalQuarterly } =
    calculateROI()

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value)
  }

  // Data for charts
  const pieData = [
    { name: "Admission/Discharge", value: admissionAnnual },
    { name: "Fall Prevention", value: fallAnnual },
    { name: "Sepsis Reduction", value: sepsisAnnual },
    { name: "Readmission Reduction", value: readmitAnnual },
    { name: "Nurse Retention", value: retentionAnnual },
  ]

  // Use full names for bar chart now that we're using angled text
  const barData = [
    { name: "Admission/Discharge", value: admissionAnnual },
    { name: "Fall Prevention", value: fallAnnual },
    { name: "Sepsis Reduction", value: sepsisAnnual },
    { name: "Readmission Reduction", value: readmitAnnual },
    { name: "Nurse Retention", value: retentionAnnual },
  ]

  // Quarterly projection data
  const quarterlyData = [
    { name: "Q1", value: totalQuarterly },
    { name: "Q2", value: totalQuarterly * 2 },
    { name: "Q3", value: totalQuarterly * 3 },
    { name: "Q4", value: totalAnnual },
  ]

  // Colors for charts
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

  // Simple PDF export function
  const downloadPDF = () => {
    const doc = new jsPDF()

    // Add a simple header
    doc.setFillColor(14, 165, 233) // sky-500
    doc.rect(0, 0, 210, 20, "F")

    // Add title
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(16)
    doc.text("VirtuAlly Virtual Nursing ROI Summary", 10, 15)

    // Reset text color for content
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(12)

    // Add ROI summary
    doc.text("ROI Summary:", 10, 30)
    doc.text(`Annual ROI: ${formatCurrency(totalAnnual)}`, 15, 40)
    doc.text(`Quarterly ROI: ${formatCurrency(totalQuarterly)}`, 15, 50)

    // Add breakdown
    doc.text("Savings Breakdown:", 10, 65)
    doc.text(`Admission/Discharge: ${formatCurrency(admissionAnnual)}`, 15, 75)
    doc.text(`Fall Prevention: ${formatCurrency(fallAnnual)}`, 15, 85)
    doc.text(`Sepsis Reduction: ${formatCurrency(sepsisAnnual)}`, 15, 95)
    doc.text(`Readmission Reduction: ${formatCurrency(readmitAnnual)}`, 15, 105)
    doc.text(`Nurse Retention: ${formatCurrency(retentionAnnual)}`, 15, 115)

    // Add input parameters
    doc.text("Input Parameters:", 10, 130)
    doc.setFontSize(10)
    doc.text(`RN Hourly Wage: $${rnWage}`, 15, 140)
    doc.text(`Avg Hours per Admission: ${baselineHours}`, 15, 150)
    doc.text(`% Time Reduction: ${reductionPercent}%`, 15, 160)
    doc.text(`Admissions per Year: ${admissionsPerYear}`, 15, 170)
    doc.text(`Falls per Year: ${fallsPerYear}`, 15, 180)
    doc.text(`Cost per Fall: ${formatCurrency(costPerFall)}`, 15, 190)

    // Add footer
    doc.setFontSize(8)
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, 10, 280)

    // Save the PDF
    doc.save("VirtuAlly_ROI_Summary.pdf")
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-sky-600 to-cyan-400 text-white">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">VirtuAlly Virtual Nurse ROI Calculator</CardTitle>
              <CardDescription className="text-white/90">
                Estimate the financial impact of partnering with VirtuAlly
              </CardDescription>
            </div>
            <div className="flex-shrink-0 p-2">
              <a
                href="https://virtually.io"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-opacity hover:opacity-80"
                title="Visit VirtuAlly website"
              >
                <Image
                  src="/va-logo.png"
                  alt="VirtuAlly Logo"
                  width={130}
                  height={55}
                  className="h-14 w-auto object-contain"
                  style={{
                    filter:
                      "drop-shadow(0px 0px 8px rgba(255, 255, 255, 0.8)) drop-shadow(0px 0px 12px rgba(255, 255, 255, 0.6))",
                  }}
                />
              </a>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-sm text-gray-600 mb-4">
            All default values are based on national averages for a typical 150-bed U.S. hospital and peer-reviewed
            virtual nursing impact studies.
          </p>

          <Tabs defaultValue="inputs" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="inputs">Inputs & Results</TabsTrigger>
              <TabsTrigger value="charts">Savings Visualization</TabsTrigger>
            </TabsList>

            <TabsContent value="inputs">
              <div className="mb-4 flex space-x-3">
                <Button onClick={resetDefaults} variant="outline">
                  Reset to National Averages
                </Button>
                <Button onClick={downloadPDF} variant="outline" className="flex items-center gap-1">
                  <Download size={16} />
                  Export PDF
                </Button>
              </div>

              {/* Inputs section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">Admission/Discharge</h3>
                  <div className="space-y-2">
                    <Label htmlFor="rnWage" className="flex items-center">
                      RN Hourly Wage
                      <Tooltip text="National average RN wage from BLS data" />
                    </Label>
                    <Input
                      id="rnWage"
                      type="number"
                      value={rnWage}
                      onChange={(e) => setRnWage(Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="baselineHours" className="flex items-center">
                      Avg Hours per Admission
                      <Tooltip text="Time spent by RN per admission/discharge, industry average ~1.5 hrs" />
                    </Label>
                    <Input
                      id="baselineHours"
                      type="number"
                      value={baselineHours}
                      onChange={(e) => setBaselineHours(Number(e.target.value))}
                      step="0.01"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reductionPercent" className="flex items-center">
                      % Time Reduction
                      <Tooltip text="Typical time savings from VRN-supported discharge processes" />
                    </Label>
                    <Input
                      id="reductionPercent"
                      type="number"
                      value={reductionPercent}
                      onChange={(e) => setReductionPercent(Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admissionsPerYear" className="flex items-center">
                      # Admissions/Discharges per Year
                      <Tooltip text="Average annual volume for 150-bed hospital" />
                    </Label>
                    <Input
                      id="admissionsPerYear"
                      type="number"
                      value={admissionsPerYear}
                      onChange={(e) => setAdmissionsPerYear(Number(e.target.value))}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">Fall Prevention</h3>
                  <div className="space-y-2">
                    <Label htmlFor="fallsPerYear" className="flex items-center">
                      # Falls per Year
                      <Tooltip text="Hospital falls average based on AHRQ data" />
                    </Label>
                    <Input
                      id="fallsPerYear"
                      type="number"
                      value={fallsPerYear}
                      onChange={(e) => setFallsPerYear(Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="costPerFall" className="flex items-center">
                      Avg Cost per Fall
                      <Tooltip text='"In this economic evaluation using a large cohort (900,635 patients; 7,858 noninjurious falls; 2,317 injurious falls), the average total cost of a fall was $62,521 ($35,365 direct costs), and injury was not significantly associated with increased costs." Source: Dykes, P. C., Curtin-Bowen, M., Lipsitz, S., & et al. (2023). Cost of inpatient falls and cost-benefit analysis of implementation of an evidence-based fall prevention program. JAMA Health Forum, 4(1), e225125' />
                    </Label>
                    <Input
                      id="costPerFall"
                      type="number"
                      value={costPerFall}
                      onChange={(e) => setCostPerFall(Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fallReductionPercent" className="flex items-center">
                      % Fall Reduction
                      <Tooltip text="Typical reduction from improved monitoring & protocols" />
                    </Label>
                    <Input
                      id="fallReductionPercent"
                      type="number"
                      value={fallReductionPercent}
                      onChange={(e) => setFallReductionPercent(Number(e.target.value))}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">Sepsis Intervention</h3>
                  <div className="space-y-2">
                    <Label htmlFor="sepsisCasesPerYear" className="flex items-center">
                      # Sepsis Cases per Year
                      <Tooltip text="Estimated average based on mid-sized facilities" />
                    </Label>
                    <Input
                      id="sepsisCasesPerYear"
                      type="number"
                      value={sepsisCasesPerYear}
                      onChange={(e) => setSepsisCasesPerYear(Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="costPerSepsis" className="flex items-center">
                      Avg Cost per Sepsis Case
                      <Tooltip text="Average cost per hospital-acquired sepsis case" />
                    </Label>
                    <Input
                      id="costPerSepsis"
                      type="number"
                      value={costPerSepsis}
                      onChange={(e) => setCostPerSepsis(Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sepsisReductionPercent" className="flex items-center">
                      % Sepsis Reduction
                      <Tooltip text="Improvement with earlier detection via VRN" />
                    </Label>
                    <Input
                      id="sepsisReductionPercent"
                      type="number"
                      value={sepsisReductionPercent}
                      onChange={(e) => setSepsisReductionPercent(Number(e.target.value))}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">Readmission Reduction</h3>
                  <div className="space-y-2">
                    <Label htmlFor="readmissionsPerYear" className="flex items-center">
                      # Readmissions per Year
                      <Tooltip text="National average readmission rates for 150-bed hospitals" />
                    </Label>
                    <Input
                      id="readmissionsPerYear"
                      type="number"
                      value={readmissionsPerYear}
                      onChange={(e) => setReadmissionsPerYear(Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="costPerReadmission" className="flex items-center">
                      Avg Cost per Readmission
                      <Tooltip text="Avg direct hospital cost per readmission" />
                    </Label>
                    <Input
                      id="costPerReadmission"
                      type="number"
                      value={costPerReadmission}
                      onChange={(e) => setCostPerReadmission(Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="readmitReductionPercent" className="flex items-center">
                      % Reduction in Readmissions
                      <Tooltip text="Based on patient education + discharge support" />
                    </Label>
                    <Input
                      id="readmitReductionPercent"
                      type="number"
                      value={readmitReductionPercent}
                      onChange={(e) => setReadmitReductionPercent(Number(e.target.value))}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">Nurse Retention</h3>
                  <div className="space-y-2">
                    <Label htmlFor="nursesRetained" className="flex items-center">
                      # Nurses Retained
                      <Tooltip text="Estimate of retained staff due to VRN workload support" />
                    </Label>
                    <Input
                      id="nursesRetained"
                      type="number"
                      value={nursesRetained}
                      onChange={(e) => setNursesRetained(Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="replacementCostPerNurse" className="flex items-center">
                      Cost per Replacement
                      <Tooltip text="Includes recruitment, onboarding, and training" />
                    </Label>
                    <Input
                      id="replacementCostPerNurse"
                      type="number"
                      value={replacementCostPerNurse}
                      onChange={(e) => setReplacementCostPerNurse(Number(e.target.value))}
                    />
                  </div>
                </div>
              </div>

              {/* Results section */}
              <div className="mt-8 p-6 bg-sky-50 rounded-lg border border-sky-100">
                <h3 className="text-xl font-semibold mb-4">Estimated Savings</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <p className="flex items-center">
                      <span className="mr-2">💡</span> Admission/Discharge:
                    </p>
                    <span className="text-green-600 font-medium">{formatCurrency(admissionAnnual)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="flex items-center">
                      <span className="mr-2">🚨</span> Fall Prevention:
                    </p>
                    <span className="text-green-600 font-medium">{formatCurrency(fallAnnual)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="flex items-center">
                      <span className="mr-2">🦠</span> Sepsis Reduction:
                    </p>
                    <span className="text-green-600 font-medium">{formatCurrency(sepsisAnnual)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="flex items-center">
                      <span className="mr-2">🔁</span> Readmission Reduction:
                    </p>
                    <span className="text-green-600 font-medium">{formatCurrency(readmitAnnual)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="flex items-center">
                      <span className="mr-2">👩‍⚕️</span> Nurse Retention:
                    </p>
                    <span className="text-green-600 font-medium">{formatCurrency(retentionAnnual)}</span>
                  </div>
                  <hr className="my-3" />
                  <div className="flex justify-between items-center">
                    <p className="flex items-center font-semibold">
                      <span className="mr-2">📆</span> Quarterly ROI:
                    </p>
                    <span className="text-green-600 font-bold text-lg">{formatCurrency(totalQuarterly)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="flex items-center font-semibold">
                      <span className="mr-2">📅</span> Annual ROI:
                    </p>
                    <span className="text-green-600 font-bold text-xl">{formatCurrency(totalAnnual)}</span>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="charts">
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Pie Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Savings Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[380px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={pieData}
                              cx="50%"
                              cy="40%"
                              labelLine={false}
                              outerRadius={100}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <RechartsTooltip
                              formatter={(value) => [formatCurrency(Number(value)), "Amount"]}
                              contentStyle={{
                                backgroundColor: "white",
                                borderRadius: "8px",
                                border: "1px solid #e2e8f0",
                              }}
                            />
                            <Legend
                              layout="horizontal"
                              verticalAlign="bottom"
                              align="center"
                              wrapperStyle={{
                                paddingTop: "30px",
                              }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Bar Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Savings by Category</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[380px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={barData}
                            margin={{
                              top: 20,
                              right: 30,
                              left: 20,
                              bottom: 60,
                            }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                              dataKey="name"
                              height={60}
                              tick={{
                                fontSize: 12,
                                angle: -45,
                                textAnchor: "end",
                                dy: 10,
                              }}
                              interval={0}
                            />
                            <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
                            <RechartsTooltip formatter={(value) => [formatCurrency(Number(value)), "Amount"]} />
                            <Bar dataKey="value" fill="#0ea5e9">
                              {barData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Quarterly Projection Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quarterly Savings Projection</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={quarterlyData}
                          margin={{
                            top: 20,
                            right: 30,
                            left: 20,
                            bottom: 10,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
                          <RechartsTooltip
                            formatter={(value) => [formatCurrency(Number(value)), "Cumulative Savings"]}
                          />
                          <Line
                            type="monotone"
                            dataKey="value"
                            stroke="#0ea5e9"
                            strokeWidth={3}
                            dot={{ r: 6 }}
                            activeDot={{ r: 8 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Total ROI Summary */}
                <Card className="bg-sky-50 border-sky-100">
                  <CardHeader>
                    <CardTitle>ROI Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h3 className="text-lg font-semibold mb-2">Quarterly ROI</h3>
                        <p className="text-3xl font-bold text-green-600">{formatCurrency(totalQuarterly)}</p>
                      </div>
                      <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h3 className="text-lg font-semibold mb-2">Annual ROI</h3>
                        <p className="text-3xl font-bold text-green-600">{formatCurrency(totalAnnual)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
