"use client"

import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import { useRef, useEffect, useState } from "react"
import Chart from "chart.js/auto"
import { jsPDF } from "jspdf"
import html2canvas from "html2canvas"
import { Button } from "@/components/ui/button"

export default function SummaryPage() {
  const searchParams = useSearchParams()
  const pieChartRef = useRef<HTMLCanvasElement>(null)
  const barChartRef = useRef<HTMLCanvasElement>(null)
  const breakEvenChartRef = useRef<HTMLCanvasElement>(null)
  const pieChartInstance = useRef<Chart | null>(null)
  const barChartInstance = useRef<Chart | null>(null)
  const breakEvenChartInstance = useRef<Chart | null>(null)
  const [chartsInitialized, setChartsInitialized] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  // Extract parameters from URL
  // Project information
  const hospitalName = searchParams.get("hospitalName") || ""
  const contactName = searchParams.get("contactName") || ""
  const projectDate = searchParams.get("projectDate") || new Date().toISOString().split("T")[0]
  const bedCount = Number(searchParams.get("bedCount")) || 150

  // Financial parameters
  const rnWage = Number(searchParams.get("rnWage")) || 55
  const baselineMinutes = Number(searchParams.get("baselineMinutes")) || 90
  const reductionPercent = Number(searchParams.get("reductionPercent")) || 35
  const admissionsPerYear = Number(searchParams.get("admissionsPerYear")) || 8700
  const fallsPerYear = Number(searchParams.get("fallsPerYear")) || 95
  const costPerFall = Number(searchParams.get("costPerFall")) || 35000
  const fallReductionPercent = Number(searchParams.get("fallReductionPercent")) || 25
  const sepsisCasesPerYear = Number(searchParams.get("sepsisCasesPerYear")) || 140
  const costPerSepsis = Number(searchParams.get("costPerSepsis")) || 32000
  const sepsisReductionPercent = Number(searchParams.get("sepsisReductionPercent")) || 15
  const readmissionsPerYear = Number(searchParams.get("readmissionsPerYear")) || 520
  const costPerReadmission = Number(searchParams.get("costPerReadmission")) || 16000
  const readmitReductionPercent = Number(searchParams.get("readmitReductionPercent")) || 20
  const replacementCostPerNurse = Number(searchParams.get("replacementCostPerNurse")) || 52000
  const totalNurses = Number(searchParams.get("totalNurses")) || 120
  const retentionImprovementPercent = Number(searchParams.get("retentionImprovementPercent")) || 12
  const timeSavedPerShift = Number(searchParams.get("timeSavedPerShift")) || 120
  const nursesUsingVRN = Number(searchParams.get("nursesUsingVRN")) || 50
  const solutionInvestment = Number(searchParams.get("solutionInvestment")) || 250000
  const includeFallPrevention = searchParams.get("includeFallPrevention") === "true"

  // Calculate ROI
  const calculateROI = () => {
    const savingsPerAdmission = (baselineMinutes / 60) * (reductionPercent / 100) * rnWage
    const admissionAnnual = savingsPerAdmission * admissionsPerYear

    const fallAnnual = includeFallPrevention ? fallsPerYear * (fallReductionPercent / 100) * costPerFall : 0
    const sepsisAnnual = sepsisCasesPerYear * (sepsisReductionPercent / 100) * costPerSepsis
    const readmitAnnual = readmissionsPerYear * (readmitReductionPercent / 100) * costPerReadmission
    const retentionAnnual = totalNurses * (retentionImprovementPercent / 100) * replacementCostPerNurse

    // Calculate time reallocation metrics (but don't include in financial ROI)
    const totalMinutesPerYear = timeSavedPerShift * nursesUsingVRN * 260
    const totalHoursPerYear = totalMinutesPerYear / 60
    const totalShiftsPerYear = totalHoursPerYear / 12
    const hoursPerNursePerYear = totalHoursPerYear / nursesUsingVRN
    const hoursPerNursePerQuarter = hoursPerNursePerYear / 4

    // Calculate monetary value of time (but don't include in ROI totals)
    const timeReallocationAnnual = totalHoursPerYear * rnWage
    const timeReallocationQuarterly = timeReallocationAnnual / 4

    // Financial ROI totals (excluding time reallocation)
    const grossAnnual = admissionAnnual + fallAnnual + sepsisAnnual + readmitAnnual + retentionAnnual
    const grossQuarterly = grossAnnual / 4

    // Net savings after investment
    const netAnnual = grossAnnual - solutionInvestment
    const netQuarterly = grossQuarterly - solutionInvestment / 4

    // ROI percentage calculation
    const roiPercentage = (netAnnual / solutionInvestment) * 100

    // Payback period in months (if negative, means it pays for itself in less than a month)
    const paybackPeriod = (solutionInvestment / grossAnnual) * 12

    // Calculate multi-year projections
    const years = 5 // 5-year projection
    const yearlyData = []

    for (let i = 1; i <= years; i++) {
      const yearlyInvestment = solutionInvestment
      const yearlySavings = grossAnnual
      const yearlyNetCashflow = yearlySavings - yearlyInvestment
      const cumulativeSavings = yearlySavings * i
      const cumulativeNetCashflow = yearlyNetCashflow * i

      yearlyData.push({
        year: i,
        investment: yearlyInvestment,
        savings: yearlySavings,
        netCashflow: yearlyNetCashflow,
        cumulativeSavings: cumulativeSavings,
        cumulativeNetCashflow: cumulativeNetCashflow,
      })
    }

    return {
      admissionAnnual,
      fallAnnual,
      sepsisAnnual,
      readmitAnnual,
      retentionAnnual,
      timeReallocationAnnual,
      timeReallocationQuarterly,
      grossAnnual,
      grossQuarterly,
      netAnnual,
      netQuarterly,
      solutionInvestment,
      roiPercentage,
      paybackPeriod,
      totalMinutesPerYear,
      totalHoursPerYear,
      totalShiftsPerYear,
      hoursPerNursePerYear,
      hoursPerNursePerQuarter,
      yearlyData,
    }
  }

  const {
    admissionAnnual,
    fallAnnual,
    sepsisAnnual,
    readmitAnnual,
    retentionAnnual,
    timeReallocationAnnual,
    timeReallocationQuarterly,
    grossAnnual,
    grossQuarterly,
    netAnnual,
    netQuarterly,
    roiPercentage,
    paybackPeriod,
    totalMinutesPerYear,
    totalHoursPerYear,
    totalShiftsPerYear,
    hoursPerNursePerYear,
    hoursPerNursePerQuarter,
    yearlyData,
  } = calculateROI()

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value)
  }

  // Chart colors and data - exclude time reallocation from financial charts
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

  const chartLabels = [
    "Admission/Discharge",
    ...(includeFallPrevention ? ["Fall Prevention"] : []),
    "Sepsis Reduction",
    "Readmission Reduction",
    "Nurse Retention",
  ]
  const chartValues = [
    admissionAnnual,
    ...(includeFallPrevention ? [fallAnnual] : []),
    sepsisAnnual,
    readmitAnnual,
    retentionAnnual,
  ]

  // Initialize charts
  const initializeCharts = () => {
    // Clean up existing charts
    if (pieChartInstance.current) {
      pieChartInstance.current.destroy()
      pieChartInstance.current = null
    }
    if (barChartInstance.current) {
      barChartInstance.current.destroy()
      barChartInstance.current = null
    }
    if (breakEvenChartInstance.current) {
      breakEvenChartInstance.current.destroy()
      breakEvenChartInstance.current = null
    }

    // Initialize pie chart
    if (pieChartRef.current) {
      const ctx = pieChartRef.current.getContext("2d")
      if (ctx) {
        pieChartInstance.current = new Chart(ctx, {
          type: "pie",
          data: {
            labels: chartLabels,
            datasets: [
              {
                data: chartValues,
                backgroundColor: COLORS,
                borderWidth: 2,
                borderColor: "#ffffff",
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: "bottom",
                labels: {
                  padding: 15,
                  usePointStyle: true,
                  boxWidth: 12,
                  generateLabels: (chart) => {
                    const data = chart.data
                    if (data.labels && data.datasets.length) {
                      return data.labels.map((label, i) => {
                        const value = data.datasets[0].data[i] as number
                        return {
                          text: `${label}: ${formatCurrency(value)}`,
                          fillStyle: data.datasets[0].backgroundColor?.[i] as string,
                          strokeStyle: data.datasets[0].borderColor as string,
                          lineWidth: data.datasets[0].borderWidth as number,
                          pointStyle: "circle",
                          hidden: false,
                          index: i,
                        }
                      })
                    }
                    return []
                  },
                },
              },
              tooltip: {
                callbacks: {
                  label: (context) => {
                    const value = context.raw as number
                    return `${context.label}: ${formatCurrency(value)}`
                  },
                },
              },
            },
          },
        })
      }
    }

    // Initialize bar chart
    if (barChartRef.current) {
      const ctx = barChartRef.current.getContext("2d")
      if (ctx) {
        barChartInstance.current = new Chart(ctx, {
          type: "bar",
          data: {
            labels: chartLabels,
            datasets: [
              {
                label: "Savings",
                data: chartValues,
                backgroundColor: COLORS,
                borderWidth: 1,
                borderColor: COLORS.map((color) => color + "CC"),
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false,
              },
              tooltip: {
                callbacks: {
                  label: (context) => {
                    const value = context.raw as number
                    return `Savings: ${formatCurrency(value)}`
                  },
                },
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  callback: (value) => "$" + (Number(value) / 1000).toFixed(0) + "k",
                },
                grid: {
                  color: "rgba(0, 0, 0, 0.1)",
                },
              },
              x: {
                ticks: {
                  maxRotation: 45,
                  minRotation: 45,
                },
                grid: {
                  display: false,
                },
              },
            },
          },
        })
      }
    }

    // Initialize break-even timeline chart
    if (breakEvenChartRef.current) {
      const ctx = breakEvenChartRef.current.getContext("2d")
      if (ctx) {
        try {
          // Calculate monthly values
          const monthlySavings = grossAnnual / 12

          // Generate 24 months of data for a 2-year view
          const months = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
          ]

          // Calculate break-even point in months
          const breakEvenMonth = Math.ceil(solutionInvestment / monthlySavings)

          // Generate cumulative savings and investment data
          const cumulativeSavings = []
          const investmentLine = []

          for (let i = 0; i < 24; i++) {
            cumulativeSavings.push(monthlySavings * (i + 1))
            investmentLine.push(solutionInvestment)
          }

          // Create annotations for break-even point
          const annotations = {}

          if (breakEvenMonth <= 24) {
            annotations["breakEven"] = {
              type: "line",
              xMin: breakEvenMonth - 1,
              xMax: breakEvenMonth - 1,
              borderColor: "rgba(255, 99, 132, 0.8)",
              borderWidth: 2,
              borderDash: [5, 5],
              label: {
                content: "Break-even point",
                enabled: true,
                position: "top",
              },
            }
          }

          breakEvenChartInstance.current = new Chart(ctx, {
            type: "line",
            data: {
              labels: months,
              datasets: [
                {
                  label: "Cumulative Savings",
                  data: cumulativeSavings,
                  borderColor: "#10b981", // Green
                  backgroundColor: "rgba(16, 185, 129, 0.1)",
                  borderWidth: 3,
                  fill: true,
                  tension: 0.1,
                  pointRadius: 3,
                  pointHoverRadius: 5,
                },
                {
                  label: "Investment Cost",
                  data: investmentLine,
                  borderColor: "#f59e0b", // Amber
                  backgroundColor: "rgba(245, 158, 11, 0.1)",
                  borderWidth: 2,
                  borderDash: [5, 5],
                  fill: false,
                  pointRadius: 0,
                },
              ],
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: true,
                  position: "top",
                },
                tooltip: {
                  callbacks: {
                    label: (context) => {
                      const value = context.raw as number
                      return `${context.dataset.label}: ${formatCurrency(value)}`
                    },
                    title: (tooltipItems) => {
                      const index = tooltipItems[0].dataIndex
                      const year = Math.floor(index / 12) + 1
                      const month = months[index]
                      return `Year ${year} - ${month}`
                    },
                  },
                },
                annotation: {
                  annotations: annotations,
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: "Amount ($)",
                  },
                  ticks: {
                    callback: (value) => "$" + (Number(value) / 1000).toFixed(0) + "k",
                  },
                },
                x: {
                  title: {
                    display: true,
                    text: "Month",
                  },
                  grid: {
                    display: false,
                  },
                },
              },
            },
          })
        } catch (error) {
          console.error("Error creating break-even timeline chart:", error)
        }
      }
    }

    setChartsInitialized(true)
  }

  // Download screenshot as PDF
  const downloadScreenshot = async () => {
    try {
      setIsDownloading(true)

      // Capture the entire page
      const element = document.body
      const canvas = await html2canvas(element, {
        scale: 1,
        useCORS: true,
        logging: false,
        backgroundColor: "#f9fafb", // gray-50 background
        width: window.innerWidth,
        height: document.documentElement.scrollHeight,
      })

      const imgData = canvas.toDataURL("image/png")

      // Create PDF with the screenshot
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      })

      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()

      // Calculate dimensions to fit the image properly
      const imgWidth = canvas.width
      const imgHeight = canvas.height
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight)

      const finalWidth = imgWidth * ratio
      const finalHeight = imgHeight * ratio

      // Center the image on the page
      const x = (pdfWidth - finalWidth) / 2
      const y = (pdfHeight - finalHeight) / 2

      pdf.addImage(imgData, "PNG", x, y, finalWidth, finalHeight)
      pdf.save("VirtuAlly_ROI_Summary.pdf")
    } catch (error) {
      console.error("Error generating PDF:", error)
    } finally {
      setIsDownloading(false)
    }
  }

  useEffect(() => {
    setTimeout(() => {
      initializeCharts()
    }, 100)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 print:bg-white">
      <div className="container mx-auto py-10 px-4 print:py-4 print:px-2">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header Banner */}
          <Card className="shadow-lg print:shadow-none">
            <CardHeader className="bg-gradient-to-r from-sky-600 to-cyan-400 text-white print:bg-sky-600">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold print:text-2xl">VirtuAlly Partnership Summary</h1>
                  <p className="text-white/90 mt-2">
                    We look forward to empowering your team to deliver the best possible care
                  </p>
                </div>
                <div className="flex items-center gap-2 sm:gap-4">
                  <Button
                    onClick={downloadScreenshot}
                    disabled={isDownloading}
                    className="bg-white text-sky-600 hover:bg-gray-100 font-medium print:hidden"
                  >
                    {isDownloading ? "Generating PDF..." : "Download Results"}
                  </Button>
                  <div className="flex-shrink-0 p-1 sm:p-2">
                    <Image
                      src="/va-logo.png"
                      alt="VirtuAlly Logo"
                      width={100}
                      height={42}
                      className="h-8 sm:h-10 md:h-12 w-auto object-contain max-w-[120px]"
                      style={{
                        filter:
                          "drop-shadow(0px 0px 8px rgba(255, 255, 255, 0.8)) drop-shadow(0px 0px 12px rgba(255, 255, 255, 0.6))",
                      }}
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Project Overview */}
          <Card className="shadow-lg print:shadow-none">
            <CardHeader>
              <CardTitle>Proposal Overview</CardTitle>
              <CardDescription>Hospital details and analysis parameters</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div>
                      <p className="text-sm text-gray-600">Hospital/Facility</p>
                      <p className="font-semibold text-gray-900">{hospitalName || "Not specified"}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="text-sm text-gray-600">Project Champion</p>
                      <p className="font-semibold text-gray-900">{contactName || "Not specified"}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <div>
                      <p className="text-sm text-gray-600">Proposal Date</p>
                      <p className="font-semibold text-gray-900">{new Date(projectDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <div>
                      <p className="text-sm text-gray-600">Facility Size</p>
                      <p className="font-semibold text-gray-900">{bedCount} beds</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Executive Summary - Moved from Project Summary tab */}
          <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200 shadow-lg print:shadow-none print:bg-white print:border">
            <CardHeader>
              <CardTitle>Executive Summary</CardTitle>
              <CardDescription>Key financial impact of VirtuAlly Virtual Nursing implementation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow-sm print:shadow-none print:border">
                  <h3 className="text-sm font-medium text-gray-600 mb-1">Annual Investment</h3>
                  <p className="text-2xl font-bold text-amber-600">{formatCurrency(solutionInvestment)}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm print:shadow-none print:border">
                  <h3 className="text-sm font-medium text-gray-600 mb-1">Annual Savings</h3>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(grossAnnual)}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm print:shadow-none print:border">
                  <h3 className="text-sm font-medium text-gray-600 mb-1">Net ROI</h3>
                  <p className="text-2xl font-bold text-blue-600">{Math.round(roiPercentage)}%</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm print:shadow-none print:border">
                  <h3 className="text-sm font-medium text-gray-600 mb-1">Payback Period</h3>
                  <p className="text-2xl font-bold text-purple-600">
                    {paybackPeriod < 1 ? "< 1" : Math.round(paybackPeriod)} {paybackPeriod === 1 ? "month" : "months"}
                  </p>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg print:border">
                <p className="text-gray-700 leading-relaxed">
                  Implementation of VirtuAlly's Virtual Nursing solution is projected to generate{" "}
                  <strong>{formatCurrency(grossAnnual)}</strong> in annual savings through improved operational
                  efficiency, enhanced patient safety, and nurse retention. With an investment of{" "}
                  <strong>{formatCurrency(solutionInvestment)}</strong>, the solution delivers a{" "}
                  <strong>{Math.round(roiPercentage)}% return on investment</strong> and pays for itself in
                  approximately{" "}
                  <strong>{paybackPeriod < 1 ? "less than 1 month" : `${Math.round(paybackPeriod)} months`}</strong>.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Key Assumptions & Inputs - Added from Project Overview tab */}
          <Card className="shadow-lg print:shadow-none">
            <CardHeader>
              <CardTitle>Key Assumptions & Inputs</CardTitle>
              <CardDescription>Foundation parameters used in this analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3 text-gray-800">Operational Metrics</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>RN Hourly Wage:</span>
                      <span className="font-medium">${rnWage}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Annual Admissions:</span>
                      <span className="font-medium">{admissionsPerYear.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Minutes per Admission:</span>
                      <span className="font-medium">{baselineMinutes}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Time Reduction:</span>
                      <span className="font-medium">{reductionPercent}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Nursing Staff:</span>
                      <span className="font-medium">{totalNurses}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Nurses Using VRN:</span>
                      <span className="font-medium">{nursesUsingVRN}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-3 text-gray-800">Safety & Quality Metrics</h4>
                  <div className="space-y-2 text-sm">
                    {includeFallPrevention && (
                      <>
                        <div className="flex justify-between">
                          <span>Annual Falls:</span>
                          <span className="font-medium">{fallsPerYear}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Cost per Fall:</span>
                          <span className="font-medium">{formatCurrency(costPerFall)}</span>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between">
                      <span>Annual Sepsis Cases:</span>
                      <span className="font-medium">{sepsisCasesPerYear}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cost per Sepsis Case:</span>
                      <span className="font-medium">{formatCurrency(costPerSepsis)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Annual Readmissions:</span>
                      <span className="font-medium">{readmissionsPerYear}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cost per Readmission:</span>
                      <span className="font-medium">{formatCurrency(costPerReadmission)}</span>
                    </div>
                    {!includeFallPrevention && (
                      <div className="text-xs text-gray-500 italic mt-2 p-2 bg-gray-50 rounded">
                        Fall Prevention analysis is disabled for this proposal.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pie Chart */}
            <Card className="shadow-lg print:shadow-none">
              <CardHeader>
                <CardTitle>Savings Distribution</CardTitle>
                <CardDescription>Breakdown of savings by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] print:h-[300px]">
                  <canvas ref={pieChartRef} style={{ display: "block", width: "100%", height: "100%" }}></canvas>
                </div>
              </CardContent>
            </Card>

            {/* Bar Chart */}
            <Card className="shadow-lg print:shadow-none">
              <CardHeader>
                <CardTitle>Financial Savings by Category</CardTitle>
                <CardDescription>Annual savings breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] print:h-[300px]">
                  <canvas ref={barChartRef} style={{ display: "block", width: "100%", height: "100%" }}></canvas>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Break-even Timeline Chart - Replacing Quarterly Projection */}
          <Card className="shadow-lg print:shadow-none">
            <CardHeader>
              <CardTitle>Break-even Timeline Analysis</CardTitle>
              <CardDescription>
                Visualize when your investment is fully recovered through cumulative savings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[320px] print:h-[250px]">
                <canvas ref={breakEvenChartRef} style={{ display: "block", width: "100%", height: "100%" }}></canvas>
              </div>

              {/* Annual Totals Table */}
              <div className="mt-6 border rounded-md overflow-hidden print:mt-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-sky-50">
                        <th className="px-4 py-3 text-left font-medium text-gray-700">Year</th>
                        <th className="px-4 py-3 text-right font-medium text-gray-700">Annual Investment</th>
                        <th className="px-4 py-3 text-right font-medium text-gray-700">Annual Savings</th>
                        <th className="px-4 py-3 text-right font-medium text-gray-700">Net Cashflow</th>
                        <th className="px-4 py-3 text-right font-medium text-gray-700">Cumulative Savings</th>
                      </tr>
                    </thead>
                    <tbody>
                      {yearlyData.map((yearData, index) => (
                        <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                          <td className="px-4 py-3 text-left font-medium">Year {yearData.year}</td>
                          <td className="px-4 py-3 text-right font-medium text-amber-600">
                            {formatCurrency(yearData.investment)}
                          </td>
                          <td className="px-4 py-3 text-right font-medium text-green-600">
                            {formatCurrency(yearData.savings)}
                          </td>
                          <td className="px-4 py-3 text-right font-medium">{formatCurrency(yearData.netCashflow)}</td>
                          <td className="px-4 py-3 text-right text-blue-600 font-medium">
                            {formatCurrency(yearData.cumulativeSavings)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-sky-100">
                        <td className="px-4 py-3 text-left font-medium">5-Year Total</td>
                        <td className="px-4 py-3 text-right font-medium text-amber-600">
                          {formatCurrency(solutionInvestment * 5)}
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-green-600">
                          {formatCurrency(grossAnnual * 5)}
                        </td>
                        <td className="px-4 py-3 text-right font-medium">{formatCurrency(netAnnual * 5)}</td>
                        <td className="px-4 py-3 text-right font-medium text-blue-600">
                          {formatCurrency(grossAnnual * 5)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Savings Breakdown */}
          <Card className="shadow-lg print:shadow-none">
            <CardHeader>
              <CardTitle>Annual Savings Breakdown</CardTitle>
              <CardDescription>Detailed breakdown of projected annual savings by category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg print:bg-white print:border print:border-blue-200">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-semibold text-blue-800">💡 Admission/Discharge Efficiency</h4>
                      <span className="text-xl font-bold text-blue-600">{formatCurrency(admissionAnnual)}</span>
                    </div>
                    <p className="text-sm text-blue-700">
                      {reductionPercent}% time reduction × {baselineMinutes} minutes ×{" "}
                      {admissionsPerYear.toLocaleString()} admissions
                    </p>
                  </div>
                  {includeFallPrevention && (
                    <div className="bg-red-50 p-4 rounded-lg print:bg-white print:border print:border-red-200">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold text-red-800">🚨 Fall Prevention</h4>
                        <span className="text-xl font-bold text-red-600">{formatCurrency(fallAnnual)}</span>
                      </div>
                      <p className="text-sm text-red-700">
                        {fallReductionPercent}% reduction × {fallsPerYear} falls × {formatCurrency(costPerFall)} per
                        fall
                      </p>
                    </div>
                  )}
                  <div className="bg-orange-50 p-4 rounded-lg print:bg-white print:border print:border-orange-200">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-semibold text-orange-800">🦠 Sepsis Reduction</h4>
                      <span className="text-xl font-bold text-orange-600">{formatCurrency(sepsisAnnual)}</span>
                    </div>
                    <p className="text-sm text-orange-700">
                      {sepsisReductionPercent}% reduction × {sepsisCasesPerYear} cases × {formatCurrency(costPerSepsis)}{" "}
                      per case
                    </p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg print:bg-white print:border print:border-purple-200">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-semibold text-purple-800">🔁 Readmission Reduction</h4>
                      <span className="text-xl font-bold text-purple-600">{formatCurrency(readmitAnnual)}</span>
                    </div>
                    <p className="text-sm text-purple-700">
                      {readmitReductionPercent}% reduction × {readmissionsPerYear} readmissions ×{" "}
                      {formatCurrency(costPerReadmission)}
                    </p>
                  </div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg print:bg-white print:border print:border-green-200">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold text-green-800">👩‍⚕️ Nurse Retention</h4>
                    <span className="text-xl font-bold text-green-600">{formatCurrency(retentionAnnual)}</span>
                  </div>
                  <p className="text-sm text-green-700">
                    {retentionImprovementPercent}% improvement × {totalNurses} nurses ×{" "}
                    {formatCurrency(replacementCostPerNurse)} replacement cost
                  </p>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Total Annual Savings:</span>
                  <span className="text-green-600">{formatCurrency(grossAnnual)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Implementation Impact */}
          <Card className="shadow-lg print:shadow-none">
            <CardHeader>
              <CardTitle>Time Reallocated To Patient Care</CardTitle>
              <CardDescription>
                How VirtuAlly can give valuable time back to your staff to focus on what matters most
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-sky-50 rounded-lg print:bg-white print:border print:border-sky-200">
                  <h4 className="font-semibold text-sky-800 mb-2">Time Reallocated</h4>
                  <p className="text-2xl font-bold text-sky-600">{Math.round(totalHoursPerYear).toLocaleString()}</p>
                  <p className="text-sm text-sky-700">hours per year to patient care</p>
                </div>
                <div className="text-center p-4 bg-indigo-50 rounded-lg print:bg-white print:border print:border-indigo-200">
                  <h4 className="font-semibold text-indigo-800 mb-2">Shift Equivalents</h4>
                  <p className="text-2xl font-bold text-indigo-600">
                    {Math.round(totalShiftsPerYear).toLocaleString()}
                  </p>
                  <p className="text-sm text-indigo-700">12-hour shifts per year</p>
                </div>
                <div className="text-center p-4 bg-emerald-50 rounded-lg print:bg-white print:border print:border-emerald-200">
                  <h4 className="font-semibold text-emerald-800 mb-2">Time Value</h4>
                  <p className="text-2xl font-bold text-emerald-600">{formatCurrency(timeReallocationAnnual)}</p>
                  <p className="text-sm text-emerald-700">annual value of reallocated time</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center text-gray-500 text-sm border-t pt-6">
            <p>Generated on {new Date().toLocaleDateString()}</p>
            <p className="mt-2">
              Visit{" "}
              <a href="https://virtually.io" className="text-blue-600 hover:underline">
                VirtuALLY.io
              </a>{" "}
              to learn more!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
