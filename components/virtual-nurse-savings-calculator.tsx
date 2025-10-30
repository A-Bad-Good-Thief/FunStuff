"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { HelpCircle, Download, Upload } from "lucide-react"
import Image from "next/image"
import Chart from "chart.js/auto"

// Custom tooltip component
const Tooltip = ({ text }: { text: string }) => (
  <span className="ml-1 inline-flex items-center text-gray-400 cursor-help" title={text}>
    <HelpCircle size={14} />
  </span>
)

export default function VirtualNurseSavingsCalculator() {
  // Chart refs
  const barChartRef = useRef<HTMLCanvasElement>(null)
  const lineChartRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Chart instances
  const barChartInstance = useRef<Chart | null>(null)
  const lineChartInstance = useRef<Chart | null>(null)

  // Refs for PDF capture
  const resultsRef = useRef<HTMLDivElement>(null)
  const chartsRef = useRef<HTMLDivElement>(null)

  // VirtuAlly optimized time constant
  const VIRTUALLY_OPTIMIZED_TIME = 52.5

  // Project information state
  const [hospitalName, setHospitalName] = useState("")
  const [contactName, setContactName] = useState("")
  const [projectDate, setProjectDate] = useState(new Date().toISOString().split("T")[0])
  const [bedCount, setBedCount] = useState(150)
  const [averageDailyCensus, setAverageDailyCensus] = useState(110)
  const [lengthOfStay, setLengthOfStay] = useState(4.8)

  // Updated default values based on 150-bed hospital
  const [rnWage, setRnWage] = useState(55)
  const [baselineMinutes, setBaselineMinutes] = useState(90)
  const [dischargeMinutes, setDischargeMinutes] = useState(75)
  // Removed reductionPercent - now calculated automatically
  const [admissionsPerYear, setAdmissionsPerYear] = useState(8700)

  const [fallsPerYear, setFallsPerYear] = useState(95)
  const [costPerFall, setCostPerFall] = useState(35000)
  const [fallReductionPercent, setFallReductionPercent] = useState(25)

  // Add this after the other state variables, around line 45
  const [includeFallPrevention, setIncludeFallPrevention] = useState(true)

  const [sepsisCasesPerYear, setSepsisCasesPerYear] = useState(140)
  const [costPerSepsis, setCostPerSepsis] = useState(32000)
  const [sepsisReductionPercent, setSepsisReductionPercent] = useState(15)

  const [readmissionsPerYear, setReadmissionsPerYear] = useState(520)
  const [costPerReadmission, setCostPerReadmission] = useState(16000)
  const [readmitReductionPercent, setReadmitReductionPercent] = useState(20)

  const [replacementCostPerNurse, setReplacementCostPerNurse] = useState(52000)
  const [totalNurses, setTotalNurses] = useState(120)
  const [retentionImprovementPercent, setRetentionImprovementPercent] = useState(12)
  const [contractLaborHourlyCost, setContractLaborHourlyCost] = useState(95) // Avg travel-nurse hourly cost

  const [timeSavedPerShift, setTimeSavedPerShift] = useState(120)
  const [nursesUsingVRN, setNursesUsingVRN] = useState(50)

  // New state for VirtuAlly solution investment
  const [solutionInvestment, setSolutionInvestment] = useState(250000)

  // Track active tab
  const [activeTab, setActiveTab] = useState("inputs")
  const [chartsInitialized, setChartsInitialized] = useState(false)

  // Calculate the time reduction percentage automatically
  const calculateTimeReduction = () => {
    const totalBaselineTime = baselineMinutes + dischargeMinutes
    if (totalBaselineTime <= VIRTUALLY_OPTIMIZED_TIME) return 0
    return ((totalBaselineTime - VIRTUALLY_OPTIMIZED_TIME) / totalBaselineTime) * 100
  }

  const reductionPercent = calculateTimeReduction()

  // Reset to default values function
  const resetDefaults = () => {
    setRnWage(55)
    setBaselineMinutes(90)
    setDischargeMinutes(75)
    setAdmissionsPerYear(8700)
    setFallsPerYear(95)
    setCostPerFall(35000)
    setSepsisCasesPerYear(140)
    setCostPerSepsis(32000)
    setSepsisReductionPercent(15)
    setReadmissionsPerYear(520)
    setCostPerReadmission(16000)
    setReadmitReductionPercent(20)
    setReplacementCostPerNurse(52000)
    setTotalNurses(120)
    setRetentionImprovementPercent(12)
    setTimeSavedPerShift(120)
    setNursesUsingVRN(50)
    setSolutionInvestment(250000)
    setHospitalName("")
    setContactName("")
    setProjectDate(new Date().toISOString().split("T")[0])
    setBedCount(150)
    setAverageDailyCensus(110)
    setLengthOfStay(4.8)
    // In the resetDefaults function, add this line:
    setIncludeFallPrevention(true)
    setContractLaborHourlyCost(95)
  }

  // Download configuration function
  const downloadConfiguration = () => {
    // Prompt user for custom filename
    const defaultFilename = `VirtuAlly_ROI_Configuration_${new Date().toISOString().split("T")[0]}`
    const customFilename = prompt("Please enter a client name for this project:", defaultFilename)

    // If user cancels or provides empty string, don't download
    if (customFilename === null) {
      return
    }

    // Clean the filename and ensure it has .json extension
    let filename = customFilename.trim()
    if (!filename) {
      filename = defaultFilename
    }

    // Remove any existing .json extension and add it back
    filename = filename.replace(/\.json$/i, "") + ".json"

    // Remove any invalid characters for filenames
    filename = filename.replace(/[<>:"/\\|?*]/g, "_")

    const config = {
      // Project information
      hospitalName,
      contactName,
      projectDate,
      bedCount,
      averageDailyCensus,
      lengthOfStay,
      rnWage,
      baselineMinutes,
      dischargeMinutes,
      // Store calculated reduction percent for reference
      calculatedReductionPercent: reductionPercent,
      admissionsPerYear,
      fallsPerYear,
      costPerFall,
      fallReductionPercent,
      // In the config object in downloadConfiguration, add:
      includeFallPrevention,
      sepsisCasesPerYear,
      costPerSepsis,
      sepsisReductionPercent,
      readmissionsPerYear,
      costPerReadmission,
      readmitReductionPercent,
      replacementCostPerNurse,
      totalNurses,
      retentionImprovementPercent,
      timeSavedPerShift,
      nursesUsingVRN,
      solutionInvestment,
      virtuAllyOptimizedTime: VIRTUALLY_OPTIMIZED_TIME,
      exportDate: new Date().toISOString(),
      version: "2.0",
      contractLaborHourlyCost,
    }

    const dataStr = JSON.stringify(config, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)

    const link = document.createElement("a")
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Upload configuration function
  const uploadConfiguration = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const config = JSON.parse(e.target?.result as string)

        // Validate that this is a valid configuration file
        if (config.version && typeof config.rnWage === "number") {
          // Load project information
          setHospitalName(config.hospitalName || "")
          setContactName(config.contactName || "")
          setProjectDate(config.projectDate || new Date().toISOString().split("T")[0])
          setBedCount(config.bedCount || 150)
          setAverageDailyCensus(config.averageDailyCensus || 110)
          setLengthOfStay(config.lengthOfStay || 4.8)

          setRnWage(config.rnWage || 55)
          setBaselineMinutes(config.baselineMinutes || 90)
          setDischargeMinutes(config.dischargeMinutes || 75)
          // Don't load reductionPercent as it's now calculated
          setAdmissionsPerYear(config.admissionsPerYear || 8700)
          setFallsPerYear(config.fallsPerYear || 95)
          setCostPerFall(config.costPerFall || 35000)
          setFallReductionPercent(config.fallReductionPercent || 25)
          // In the uploadConfiguration function, add this line after the other setters:
          setIncludeFallPrevention(config.includeFallPrevention !== false) // Default to true if not specified
          setSepsisCasesPerYear(config.sepsisCasesPerYear || 140)
          setCostPerSepsis(config.costPerSepsis || 32000)
          setSepsisReductionPercent(config.sepsisReductionPercent || 15)
          setReadmissionsPerYear(config.readmissionsPerYear || 520)
          setCostPerReadmission(config.costPerReadmission || 16000)
          setReadmitReductionPercent(config.readmitReductionPercent || 20)
          setReplacementCostPerNurse(config.replacementCostPerNurse || 52000)
          setTotalNurses(config.totalNurses || 120)
          setRetentionImprovementPercent(config.retentionImprovementPercent || 12)
          setTimeSavedPerShift(config.timeSavedPerShift || 120)
          setNursesUsingVRN(config.nursesUsingVRN || 50)
          setSolutionInvestment(config.solutionInvestment || 250000)
          setContractLaborHourlyCost(config.contractLaborHourlyCost || 95)

          alert("Configuration loaded successfully!")
        } else {
          alert("Invalid configuration file format.")
        }
      } catch (error) {
        alert("Error reading configuration file. Please ensure it's a valid JSON file.")
      }
    }
    reader.readAsText(file)

    // Reset the input so the same file can be uploaded again if needed
    event.target.value = ""
  }

  // Trigger file input
  const triggerFileUpload = () => {
    fileInputRef.current?.click()
  }

  // Calculate ROI
  const calculateROI = () => {
    // Updated calculation using the new approach
    const totalBaselineTime = baselineMinutes + dischargeMinutes
    const timeSavedPerPatient = Math.max(0, totalBaselineTime - VIRTUALLY_OPTIMIZED_TIME)
    const savingsPerAdmission = (timeSavedPerPatient / 60) * rnWage
    const admissionAnnual = savingsPerAdmission * admissionsPerYear

    // In the calculateROI function, change this line:
    // const fallAnnual = fallsPerYear * (fallReductionPercent / 100) * costPerFall
    // To this:
    const fallAnnual = includeFallPrevention ? fallsPerYear * (fallReductionPercent / 100) * costPerFall : 0
    const sepsisAnnual = sepsisCasesPerYear * (sepsisReductionPercent / 100) * costPerSepsis
    const readmitAnnual = readmissionsPerYear * (readmitReductionPercent / 100) * costPerReadmission
    // Replace this line:
    // const retentionAnnual = totalNurses * (retentionImprovementPercent / 100) * replacementCostPerNurse

    // With this new calculation for ongoing premium cost savings:
    const retainedNurses = totalNurses * (retentionImprovementPercent / 100)
    const annualHoursPerNurse = 2080 // Full-time equivalent hours per year
    const premiumCostPerHour = Math.max(0, contractLaborHourlyCost - rnWage) // Ensure non-negative
    const retentionAnnual = retainedNurses * annualHoursPerNurse * premiumCostPerHour

    // Calculate time reallocation metrics (but don't include in financial ROI)
    // Assuming 260 working days per year (52 weeks * 5 days)
    const totalMinutesPerYear = timeSavedPerShift * nursesUsingVRN * 260
    const totalHoursPerYear = totalMinutesPerYear / 60
    const totalShiftsPerYear = totalHoursPerYear / 12 // Assuming 12-hour shifts
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
      totalBaselineTime,
      timeSavedPerPatient,
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
    totalBaselineTime,
    timeSavedPerPatient,
  } = calculateROI()

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value)
  }

  // Chart colors
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

  // Update the chartLabels and chartValues arrays:
  const chartLabels = [
    "Admission & Discharge",
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

  // Function to initialize charts
  const initializeCharts = () => {
    // Clean up any existing charts
    if (barChartInstance.current) {
      barChartInstance.current.destroy()
      barChartInstance.current = null
    }
    if (lineChartInstance.current) {
      lineChartInstance.current.destroy()
      lineChartInstance.current = null
    }

    // Initialize bar chart
    if (barChartRef.current) {
      const ctx = barChartRef.current.getContext("2d")
      if (ctx) {
        try {
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
        } catch (error) {
          console.error("Error creating bar chart:", error)
        }
      }
    }

    // Initialize break-even timeline chart
    if (lineChartRef.current) {
      const ctx = lineChartRef.current.getContext("2d")
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

          lineChartInstance.current = new Chart(ctx, {
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

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value)

    // Initialize charts when switching to charts tab
    if (value === "charts") {
      // Use setTimeout to ensure DOM is ready
      setTimeout(() => {
        initializeCharts()
      }, 100)
    }
  }

  // Initialize charts when component mounts and when data changes
  useEffect(() => {
    if (activeTab === "charts" && !chartsInitialized) {
      // Use setTimeout to ensure DOM is ready
      setTimeout(() => {
        initializeCharts()
      }, 100)
    }
  }, [activeTab, chartsInitialized])

  // Update charts when data changes
  useEffect(() => {
    if (activeTab === "charts" && chartsInitialized) {
      // Use setTimeout to ensure DOM is ready
      setTimeout(() => {
        initializeCharts()
      }, 100)
    }
  }, [
    admissionAnnual,
    fallAnnual,
    sepsisAnnual,
    readmitAnnual,
    retentionAnnual,
    grossAnnual,
    netAnnual,
    solutionInvestment,
    timeSavedPerShift,
    nursesUsingVRN,
    includeFallPrevention,
  ])

  // Generate summary page function
  const generateSummary = () => {
    // Create URL with all the current values as parameters
    const params = new URLSearchParams({
      rnWage: rnWage.toString(),
      baselineMinutes: baselineMinutes.toString(),
      dischargeMinutes: dischargeMinutes.toString(),
      virtuAllyOptimizedTime: VIRTUALLY_OPTIMIZED_TIME.toString(),
      calculatedReductionPercent: reductionPercent.toString(),
      admissionsPerYear: admissionsPerYear.toString(),
      fallsPerYear: fallsPerYear.toString(),
      costPerFall: costPerFall.toString(),
      fallReductionPercent: fallReductionPercent.toString(),
      // In the params object in generateSummary, add:
      includeFallPrevention: includeFallPrevention.toString(),
      sepsisCasesPerYear: sepsisCasesPerYear.toString(),
      costPerSepsis: costPerSepsis.toString(),
      sepsisReductionPercent: sepsisReductionPercent.toString(),
      readmissionsPerYear: readmissionsPerYear.toString(),
      costPerReadmission: costPerReadmission.toString(),
      readmitReductionPercent: readmitReductionPercent.toString(),
      replacementCostPerNurse: replacementCostPerNurse.toString(),
      totalNurses: totalNurses.toString(),
      retentionImprovementPercent: retentionImprovementPercent.toString(),
      timeSavedPerShift: timeSavedPerShift.toString(),
      nursesUsingVRN: nursesUsingVRN.toString(),
      solutionInvestment: solutionInvestment.toString(),
      hospitalName: hospitalName.toString(),
      contactName: contactName.toString(),
      projectDate: projectDate.toString(),
      bedCount: bedCount.toString(),
      averageDailyCensus: averageDailyCensus.toString(),
      lengthOfStay: lengthOfStay.toString(),
      contractLaborHourlyCost: contractLaborHourlyCost.toString(),
    })

    // Open summary page in new tab
    const summaryUrl = `/summary?${params.toString()}`
    window.open(summaryUrl, "_blank")
  }

  // Calculate multi-year projections
  const calculateMultiYearProjections = () => {
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

    return yearlyData
  }

  const multiYearData = calculateMultiYearProjections()

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

          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="inputs">Inputs & Results</TabsTrigger>
              <TabsTrigger value="charts">Savings Visualization</TabsTrigger>
              <TabsTrigger value="summary">Project Overview</TabsTrigger>
            </TabsList>

            <TabsContent value="inputs">
              <div className="mb-4 flex flex-wrap gap-2">
                <Button onClick={resetDefaults} variant="outline" size="sm">
                  Reset to Defaults
                </Button>
                <Button onClick={generateSummary} variant="outline" size="sm">
                  Summarize This Partnership
                </Button>
                <Button
                  onClick={downloadConfiguration}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1 bg-transparent"
                >
                  <Download size={14} />
                  Download Config
                </Button>
                <Button
                  onClick={triggerFileUpload}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1 bg-transparent"
                >
                  <Upload size={14} />
                  Upload Config
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={uploadConfiguration}
                  style={{ display: "none" }}
                />
              </div>

              {/* Project Information - moved from summary tab */}
              <Card className="mb-6 border-gray-200 bg-gray-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Proposal Information</CardTitle>
                  <CardDescription>Hospital details and project overview</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="hospitalName">Hospital/Facility Name</Label>
                      <Input
                        id="hospitalName"
                        placeholder="Enter hospital name"
                        value={hospitalName}
                        onChange={(e) => setHospitalName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactName">Project Champion</Label>
                      <Input
                        id="contactName"
                        placeholder="Enter contact name"
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="projectDate">Proposal Date</Label>
                      <Input
                        id="projectDate"
                        type="date"
                        value={projectDate}
                        onChange={(e) => setProjectDate(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bedCount">Number of Beds</Label>
                      <Input
                        id="bedCount"
                        type="number"
                        placeholder="150"
                        value={bedCount}
                        onChange={(e) => setBedCount(Number(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="averageDailyCensus" className="flex items-center">
                        Average Daily Census
                        <Tooltip text="Average number of patients in the hospital on any given day. National average for 150-bed hospitals is ~110 patients (73% occupancy)" />
                      </Label>
                      <Input
                        id="averageDailyCensus"
                        type="number"
                        placeholder="110"
                        value={averageDailyCensus}
                        onChange={(e) => setAverageDailyCensus(Number(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lengthOfStay" className="flex items-center">
                        Average Length of Stay (days)
                        <Tooltip text="Average number of days patients stay in the hospital. National average for acute care is ~4.8 days according to AHRQ data" />
                      </Label>
                      <Input
                        id="lengthOfStay"
                        type="number"
                        step="0.1"
                        placeholder="4.8"
                        value={lengthOfStay}
                        onChange={(e) => setLengthOfStay(Number(e.target.value))}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* VirtuAlly Solution Investment - Added at the top for visibility */}
              <Card className="mb-6 border-sky-200 bg-sky-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">VirtuAlly Investment</CardTitle>
                  <CardDescription>If you have received a quote from VirtuAlly please enter below</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label htmlFor="solutionInvestment" className="flex items-center">
                      Annual Investment
                      <Tooltip text="The total annual cost of the VirtuAlly Virtual Nurse solution" />
                    </Label>
                    <Input
                      id="solutionInvestment"
                      type="number"
                      value={solutionInvestment}
                      onChange={(e) => setSolutionInvestment(Number(e.target.value))}
                      className="font-medium"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Inputs section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                <div className="border border-gray-200 rounded-lg p-3">
                  <h3 className="text-lg font-semibold mb-3">Admission & Discharge</h3>
                  <div className="space-y-3">
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
                  <div className="space-y-2 mt-4">
                    <Label htmlFor="baselineMinutes" className="flex items-center">
                      Avg Minutes per Admission
                      <Tooltip text="Time spent by RN per admission process, industry average ~90 minutes" />
                    </Label>
                    <Input
                      id="baselineMinutes"
                      type="number"
                      value={baselineMinutes}
                      onChange={(e) => setBaselineMinutes(Number(e.target.value))}
                      step="1"
                    />
                  </div>
                  <div className="space-y-2 mt-4">
                    <Label htmlFor="dischargeMinutes" className="flex items-center">
                      Avg Minutes per Discharge
                      <Tooltip text="Time spent by RN per discharge process including medication reconciliation, patient education, and discharge coordination. Industry average ~75 minutes based on time-and-motion studies" />
                    </Label>
                    <Input
                      id="dischargeMinutes"
                      type="number"
                      value={dischargeMinutes}
                      onChange={(e) => setDischargeMinutes(Number(e.target.value))}
                      step="1"
                    />
                  </div>

                  {/* VirtuAlly Optimized Time Display */}
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200 mt-4">
                    <div className="space-y-2">
                      <Label className="flex items-center font-semibold text-green-800">
                        🎯 VirtuAlly Optimized Time
                        <Tooltip text="VirtuAlly's proven optimized time for combined admission and discharge processes using our VRN program" />
                      </Label>
                      <div className="text-2xl font-bold text-green-700">{VIRTUALLY_OPTIMIZED_TIME} minutes</div>
                      <div className="text-sm text-green-600">
                        Combined admission & discharge time with VirtuAlly VRN
                      </div>
                    </div>
                  </div>

                  {/* Time Reduction Calculation Display */}
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mt-4">
                    <div className="space-y-2">
                      <Label className="flex items-center font-semibold text-blue-800">
                        📊 Calculated Time Savings
                        <Tooltip text="Automatically calculated based on your baseline times vs VirtuAlly's optimized time" />
                      </Label>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-gray-600">Your Current Total:</div>
                          <div className="font-semibold text-blue-700">{totalBaselineTime} minutes</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Time Saved per Patient:</div>
                          <div className="font-semibold text-blue-700">{timeSavedPerPatient.toFixed(1)} minutes</div>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-blue-200">
                        <div className="text-gray-600">Percentage Reduction:</div>
                        <div className="text-2xl font-bold text-blue-700">{reductionPercent.toFixed(1)}%</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mt-6">
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

                <div className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold">Fall Prevention</h3>
                    <div className="flex items-center space-x-2">
                      <Label htmlFor="includeFallPrevention" className="text-sm">
                        Include in Analysis
                      </Label>
                      <input
                        id="includeFallPrevention"
                        type="checkbox"
                        checked={includeFallPrevention}
                        onChange={(e) => setIncludeFallPrevention(e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>
                  </div>

                  {includeFallPrevention ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="fallsPerYear" className="flex items-center">
                          # Falls per Year
                          <Tooltip text="Based on AHRQ data showing 3-5 falls per 1,000 patient days for a 150-bed hospital. Source: AHRQ Patient Safety Network (PSNet), 'Falls' (2022)" />
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
                          <Tooltip text="Conservative estimate for planning purposes. Research shows costs can range from $15,000 to $62,521. Source: Dykes, P. C., et al. (2023). Cost of inpatient falls and cost-benefit analysis of implementation of an evidence-based fall prevention program. JAMA Health Forum, 4(1), e225125" />
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
                  ) : (
                    <div className="text-sm text-gray-500 italic p-3 bg-gray-50 rounded-lg">
                      Fall Prevention analysis is disabled. Enable the toggle above to include fall prevention savings
                      in your ROI calculation.
                    </div>
                  )}
                </div>

                <div className="border border-gray-200 rounded-lg p-3">
                  <h3 className="text-lg font-semibold mb-3">Sepsis Intervention</h3>
                  <div className="space-y-2 mt-4">
                    <Label htmlFor="sepsisCasesPerYear" className="flex items-center">
                      # Sepsis Cases per Year
                      <Tooltip text="Based on studies showing 6-10% of hospital admissions develop sepsis. Source: Rhee, C., et al. (2019). Prevalence, Underlying Causes, and Preventability of Sepsis-Associated Mortality in US Acute Care Hospitals. JAMA Network Open, 2(2)" />
                    </Label>
                    <Input
                      id="sepsisCasesPerYear"
                      type="number"
                      value={sepsisCasesPerYear}
                      onChange={(e) => setSepsisCasesPerYear(Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2 mt-4">
                    <Label htmlFor="costPerSepsis" className="flex items-center">
                      Avg Cost per Sepsis Case
                      <Tooltip text="Average cost per hospital-acquired sepsis case. Studies show costs ranging from $32,000 to $50,000 per case. Source: Paoli, C.J., et al. (2018). Epidemiology and Costs of Sepsis in the United States—An Analysis Based on Timing of Diagnosis and Severity Level. Critical Care Medicine, 46(12)" />
                    </Label>
                    <Input
                      id="costPerSepsis"
                      type="number"
                      value={costPerSepsis}
                      onChange={(e) => setCostPerSepsis(Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2 mt-4">
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

                <div className="border border-gray-200 rounded-lg p-3">
                  <h3 className="text-lg font-semibold mb-3">Readmission Reduction</h3>
                  <div className="space-y-2 mt-4">
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
                  <div className="space-y-2 mt-4">
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
                  <div className="space-y-2 mt-4">
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

                <div className="border border-gray-200 rounded-lg p-3">
                  <h3 className="text-lg font-semibold mb-3">Nurse Retention</h3>
                  <div className="space-y-2 mt-4">
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
                  <div className="space-y-2 mt-4">
                    <Label htmlFor="totalNurses" className="flex items-center">
                      Total Nurses
                      <Tooltip text="Total nursing staff at your facility" />
                    </Label>
                    <Input
                      id="totalNurses"
                      type="number"
                      value={totalNurses}
                      onChange={(e) => setTotalNurses(Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2 mt-4">
                    <Label htmlFor="retentionImprovementPercent" className="flex items-center">
                      % Retention Improvement
                      <Tooltip text="Typical 12% improvement in nurse retention with strong VRN programs. Savings calculated based on avoiding expensive contract labor costs for retained positions." />
                    </Label>
                    <Input
                      id="retentionImprovementPercent"
                      type="number"
                      value={retentionImprovementPercent}
                      onChange={(e) => setRetentionImprovementPercent(Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2 mt-4">
                    <Label htmlFor="contractLaborHourlyCost" className="flex items-center">
                      Hourly Cost for Contracted Labor
                      <Tooltip text="Total hourly cost for contract/travel nurses including agency markup, housing stipends, and travel allowances. National average is ~$95/hour vs $35-40 for permanent RNs. When hospitals lose permanent staff, they often backfill with expensive contract nurses (2.5-3x premium cost) until replacements are hired. This captures the ongoing premium cost burden of poor retention, not just one-time replacement costs. Higher retention means less reliance on costly contract labor." />
                    </Label>
                    <Input
                      id="contractLaborHourlyCost"
                      type="number"
                      value={contractLaborHourlyCost}
                      onChange={(e) => setContractLaborHourlyCost(Number(e.target.value))}
                    />
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-3">
                  <h3 className="text-lg font-semibold mb-3">Time Reallocated to Patient Care</h3>
                  <div className="space-y-2 mt-4">
                    <Label htmlFor="timeSavedPerShift" className="flex items-center">
                      Time Saved Each Shift (minutes)
                      <Tooltip text="Minutes saved per nurse per shift that can be reallocated to direct patient care" />
                    </Label>
                    <Input
                      id="timeSavedPerShift"
                      type="number"
                      value={timeSavedPerShift}
                      onChange={(e) => setTimeSavedPerShift(Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2 mt-4">
                    <Label htmlFor="nursesUsingVRN" className="flex items-center">
                      # Nurses Using VRN Program
                      <Tooltip text="Number of nurses actively benefiting from the VRN program" />
                    </Label>
                    <Input
                      id="nursesUsingVRN"
                      type="number"
                      value={nursesUsingVRN}
                      onChange={(e) => setNursesUsingVRN(Number(e.target.value))}
                    />
                  </div>
                </div>
              </div>

              {/* Results section */}
              <div ref={resultsRef} className="mt-8 p-6 bg-sky-50 rounded-lg border border-sky-100">
                <h3 className="text-xl font-semibold mb-4">Estimated Savings</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <p className="flex items-center">
                      <span className="mr-2">💡</span> Admission & Discharge:
                    </p>
                    <span className="text-green-600 font-medium">{formatCurrency(admissionAnnual)}</span>
                  </div>
                  {includeFallPrevention && (
                    <div className="flex justify-between items-center">
                      <p className="flex items-center">
                        <span className="mr-2">🚨</span> Fall Prevention:
                      </p>
                      <span className="text-green-600 font-medium">{formatCurrency(fallAnnual)}</span>
                    </div>
                  )}
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
                  <div className="flex justify-between items-center">
                    <p className="flex items-center">
                      <span className="mr-2">⏰</span> Time Reallocated to Patient Care:
                    </p>
                    <span className="text-green-600 font-medium">
                      {Math.round(totalHoursPerYear).toLocaleString()} hours/year
                    </span>
                  </div>
                  <hr className="my-3" />
                  <div className="flex justify-between items-center">
                    <p className="flex items-center font-semibold">
                      <span className="mr-2">📊</span> Gross Annual Savings:
                    </p>
                    <span className="text-green-600 font-bold text-lg">{formatCurrency(grossAnnual)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="flex items-center font-semibold">
                      <span className="mr-2">💰</span> VirtuAlly Solution Investment:
                    </p>
                    <span className="text-blue-600 font-bold text-lg">{formatCurrency(solutionInvestment)}</span>
                  </div>
                  <div className="flex justify-between items-center bg-green-50 p-2 rounded-md">
                    <p className="flex items-center font-semibold">
                      <span className="mr-2">📈</span> Net Annual Savings:
                    </p>
                    <span className="text-green-600 font-bold text-xl">{formatCurrency(netAnnual)}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="bg-blue-50 p-3 rounded-md">
                      <p className="text-sm text-blue-700 mb-1">Return on Investment (ROI)</p>
                      <p className="text-2xl font-bold text-blue-700">{Math.round(roiPercentage)}%</p>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-md">
                      <p className="text-sm text-purple-700 mb-1">Payback Period</p>
                      <p className="text-2xl font-bold text-purple-700">
                        {paybackPeriod < 1 ? "< 1" : Math.round(paybackPeriod)}{" "}
                        {paybackPeriod === 1 ? "month" : "months"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="charts">
              <div className="mb-4">
                <Button onClick={initializeCharts} variant="outline" className="flex items-center gap-1 bg-transparent">
                  Refresh Charts
                </Button>
              </div>
              <div ref={chartsRef} className="space-y-8">
                {/* Total ROI Summary - MOVED TO TOP */}
                <Card className="bg-sky-50 border-sky-100">
                  <CardHeader>
                    <CardTitle>ROI Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h3 className="text-lg font-semibold mb-2">Gross Annual Savings</h3>
                        <p className="text-3xl font-bold text-green-600">{formatCurrency(grossAnnual)}</p>
                      </div>
                      <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h3 className="text-lg font-semibold mb-2">Solution Investment</h3>
                        <p className="text-3xl font-bold text-amber-600">{formatCurrency(solutionInvestment)}</p>
                      </div>
                      <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h3 className="text-lg font-semibold mb-2">Net Annual Savings</h3>
                        <p className="text-3xl font-bold text-blue-600">{formatCurrency(netAnnual)}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                      <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h3 className="text-lg font-semibold mb-2">Return on Investment</h3>
                        <p className="text-3xl font-bold text-purple-600">{Math.round(roiPercentage)}%</p>
                      </div>
                      <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h3 className="text-lg font-semibold mb-2">Payback Period</h3>
                        <p className="text-3xl font-bold text-indigo-600">
                          {paybackPeriod < 1 ? "< 1" : Math.round(paybackPeriod)}{" "}
                          {paybackPeriod === 1 ? "month" : "months"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Bar Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Financial Savings by Category</CardTitle>
                  </CardHeader>
                  <CardContent className="h-[400px] flex items-center justify-center">
                    <div className="h-[380px] w-full">
                      <canvas
                        ref={barChartRef}
                        id="barChart"
                        style={{ display: "block", width: "100%", height: "100%" }}
                      ></canvas>
                    </div>
                  </CardContent>
                </Card>

                {/* Break-even Timeline Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Break-even Timeline Analysis</CardTitle>
                    <CardDescription>
                      Visualize when your investment is fully recovered through cumulative savings
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[320px] flex items-center justify-center mb-6">
                      <div className="h-[300px] w-full">
                        <canvas
                          ref={lineChartRef}
                          id="lineChart"
                          style={{ display: "block", width: "100%", height: "100%" }}
                        ></canvas>
                      </div>
                    </div>

                    {/* Annual Totals Table */}
                    <div className="mt-6 border rounded-md overflow-hidden">
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
                            {multiYearData.map((yearData, index) => (
                              <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                                <td className="px-4 py-3 text-left font-medium">Year {yearData.year}</td>
                                <td className="px-4 py-3 text-right text-amber-600 font-medium">
                                  {formatCurrency(yearData.investment)}
                                </td>
                                <td className="px-4 py-3 text-right text-green-600 font-medium">
                                  {formatCurrency(yearData.savings)}
                                </td>
                                <td className="px-4 py-3 text-right font-medium">
                                  {formatCurrency(yearData.netCashflow)}
                                </td>
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

                {/* Time Reallocation Metrics */}
                <Card className="bg-gradient-to-r from-sky-50 to-blue-50 border-sky-100">
                  <CardHeader>
                    <CardTitle>Time Reallocated to Patient Care</CardTitle>
                    <CardDescription>Impact of VRN program on nursing time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Total Hours Given Back</h3>
                        <p className="text-3xl font-bold text-sky-600">
                          {Math.round(totalHoursPerYear).toLocaleString()}
                        </p>
                      </div>
                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Equivalent Nursing Shifts</h3>
                        <p className="text-3xl font-bold text-indigo-600">
                          {Math.round(totalShiftsPerYear).toLocaleString()}
                        </p>
                      </div>
                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Time per Nurse per Quarter</h3>
                        <p className="text-3xl font-bold text-emerald-600">{Math.round(hoursPerNursePerQuarter)}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">
                      This represents the additional time nurses can spend directly with patients, improving care
                      quality and satisfaction.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="summary">
              <div className="space-y-6">
                {/* Proposal Overview */}
                <Card>
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

                {/* Executive Summary */}
                <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
                  <CardHeader>
                    <CardTitle>Executive Summary</CardTitle>
                    <CardDescription>Key financial impact of VirtuAlly Virtual Nursing implementation</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <h3 className="text-sm font-medium text-gray-600 mb-1">Annual Investment</h3>
                        <p className="text-2xl font-bold text-amber-600">{formatCurrency(solutionInvestment)}</p>
                      </div>
                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <h3 className="text-sm font-medium text-gray-600 mb-1">Annual Savings</h3>
                        <p className="text-2xl font-bold text-green-600">{formatCurrency(grossAnnual)}</p>
                      </div>
                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <h3 className="text-sm font-medium text-gray-600 mb-1">Net ROI</h3>
                        <p className="text-2xl font-bold text-blue-600">{Math.round(roiPercentage)}%</p>
                      </div>
                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <h3 className="text-sm font-medium text-gray-600 mb-1">Payback Period</h3>
                        <p className="text-2xl font-bold text-purple-600">
                          {paybackPeriod < 1 ? "< 1" : Math.round(paybackPeriod)}{" "}
                          {paybackPeriod === 1 ? "month" : "months"}
                        </p>
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg">
                      <p className="text-gray-700 leading-relaxed">
                        Implementation of VirtuAlly's Virtual Nursing solution is projected to generate{" "}
                        <strong>{formatCurrency(grossAnnual)}</strong> in annual savings through improved operational
                        efficiency, enhanced patient safety, and nurse retention. With an investment of{" "}
                        <strong>{formatCurrency(solutionInvestment)}</strong>, the solution delivers a{" "}
                        <strong>{Math.round(roiPercentage)}% return on investment</strong> and pays for itself in
                        approximately{" "}
                        <strong>
                          {paybackPeriod < 1 ? "less than 1 month" : `${Math.round(paybackPeriod)} months`}
                        </strong>
                        .
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Key Assumptions & Inputs */}
                <Card>
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
                            <span className="font-medium">{reductionPercent.toFixed(1)}%</span>
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

                {/* Annual Savings Breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle>Annual Savings Breakdown</CardTitle>
                    <CardDescription>Detailed breakdown of projected annual savings by category</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-semibold text-blue-800">💡 Admission/Discharge Efficiency</h4>
                            <span className="text-xl font-bold text-blue-600">{formatCurrency(admissionAnnual)}</span>
                          </div>
                          <p className="text-sm text-blue-700">
                            {reductionPercent.toFixed(1)}% time reduction × {baselineMinutes} minutes ×{" "}
                            {admissionsPerYear.toLocaleString()} admissions
                          </p>
                        </div>
                        {includeFallPrevention && (
                          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                            <div className="flex justify-between items-center mb-2">
                              <h4 className="font-semibold text-red-800">🚨 Fall Prevention</h4>
                              <span className="text-xl font-bold text-red-600">{formatCurrency(fallAnnual)}</span>
                            </div>
                            <p className="text-sm text-red-700">
                              {fallReductionPercent}% reduction × {fallsPerYear} falls × {formatCurrency(costPerFall)}{" "}
                              per fall
                            </p>
                          </div>
                        )}
                        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-semibold text-orange-800">🦠 Sepsis Reduction</h4>
                            <span className="text-xl font-bold text-orange-600">{formatCurrency(sepsisAnnual)}</span>
                          </div>
                          <p className="text-sm text-orange-700">
                            {sepsisReductionPercent}% reduction × {sepsisCasesPerYear} cases ×{" "}
                            {formatCurrency(costPerSepsis)} per case
                          </p>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
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
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-semibold text-green-800">👩‍⚕️ Nurse Retention</h4>
                          <span className="text-xl font-bold text-green-600">{formatCurrency(retentionAnnual)}</span>
                        </div>
                        <p className="text-sm text-green-700">
                          {retentionImprovementPercent}% improvement × {totalNurses} nurses × 2,080 hours × $
                          {Math.max(0, contractLaborHourlyCost - rnWage)}/hour premium
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

                {/* Time Reallocated To Patient Care */}
                <Card>
                  <CardHeader>
                    <CardTitle>Time Reallocated To Patient Care</CardTitle>
                    <CardDescription>
                      How VirtuAlly can give valuable time back to your staff to focus on what matters most
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-sky-50 rounded-lg border border-sky-200">
                        <h4 className="font-semibold text-sky-800 mb-2">Time Reallocated</h4>
                        <p className="text-2xl font-bold text-sky-600">
                          {Math.round(totalHoursPerYear).toLocaleString()}
                        </p>
                        <p className="text-sm text-sky-700">hours per year to patient care</p>
                      </div>
                      <div className="text-center p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                        <h4 className="font-semibold text-indigo-800 mb-2">Shift Equivalents</h4>
                        <p className="text-2xl font-bold text-indigo-600">
                          {Math.round(totalShiftsPerYear).toLocaleString()}
                        </p>
                        <p className="text-sm text-indigo-700">12-hour shifts per year</p>
                      </div>
                      <div className="text-center p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                        <h4 className="font-semibold text-emerald-800 mb-2">Time Value</h4>
                        <p className="text-2xl font-bold text-emerald-600">{formatCurrency(timeReallocationAnnual)}</p>
                        <p className="text-sm text-emerald-700">annual value of reallocated time</p>
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
