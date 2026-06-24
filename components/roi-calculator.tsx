"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

export default function ROICalculator() {
  const [initialInvestment, setInitialInvestment] = useState(10000)
  const [annualReturn, setAnnualReturn] = useState(8)
  const [years, setYears] = useState(5)
  const [additionalContribution, setAdditionalContribution] = useState(1000)
  const [contributionFrequency, setContributionFrequency] = useState("yearly")
  const [results, setResults] = useState({
    futureValue: 0,
    totalInvestment: 0,
    totalReturn: 0,
    roi: 0,
  })
  const [chartData, setChartData] = useState<any[]>([])

  // Calculate ROI and future value
  useEffect(() => {
    const calculateROI = () => {
      let futureValue = initialInvestment
      let totalContributions = initialInvestment
      const contributionsPerYear =
        contributionFrequency === "monthly" ? 12 : contributionFrequency === "quarterly" ? 4 : 1

      const yearlyData = []

      for (let year = 1; year <= years; year++) {
        // Add contributions for the year
        for (let i = 0; i < contributionsPerYear; i++) {
          if (year > 1 || i > 0) {
            // Skip first contribution in first year (it's the initial investment)
            futureValue += additionalContribution
            totalContributions += additionalContribution
          }

          // Apply returns (proportionally based on frequency)
          if (i < contributionsPerYear - 1) {
            futureValue *= 1 + annualReturn / 100 / contributionsPerYear
          }
        }

        // Apply final return for the year
        futureValue *= 1 + annualReturn / 100 / contributionsPerYear

        yearlyData.push({
          year,
          investment: Math.round(totalContributions),
          value: Math.round(futureValue),
        })
      }

      const totalReturn = futureValue - totalContributions
      const roi = (totalReturn / totalContributions) * 100

      setResults({
        futureValue: Math.round(futureValue),
        totalInvestment: Math.round(totalContributions),
        totalReturn: Math.round(totalReturn),
        roi: Math.round(roi * 100) / 100,
      })

      setChartData(yearlyData)
    }

    calculateROI()
  }, [initialInvestment, annualReturn, years, additionalContribution, contributionFrequency])

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value)
  }

  return (
    <div className="space-y-8">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="basic">Basic</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Investment Parameters</CardTitle>
              <CardDescription>Adjust the sliders to see how your investment could grow over time</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="initialInvestment">Initial Investment</Label>
                  <span className="font-medium">{formatCurrency(initialInvestment)}</span>
                </div>
                <Slider
                  id="initialInvestment"
                  min={1000}
                  max={100000}
                  step={1000}
                  value={[initialInvestment]}
                  onValueChange={(value) => setInitialInvestment(value[0])}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="annualReturn">Annual Return (%)</Label>
                  <span className="font-medium">{annualReturn}%</span>
                </div>
                <Slider
                  id="annualReturn"
                  min={1}
                  max={20}
                  step={0.5}
                  value={[annualReturn]}
                  onValueChange={(value) => setAnnualReturn(value[0])}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="years">Investment Period (Years)</Label>
                  <span className="font-medium">{years} years</span>
                </div>
                <Slider
                  id="years"
                  min={1}
                  max={30}
                  step={1}
                  value={[years]}
                  onValueChange={(value) => setYears(value[0])}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Parameters</CardTitle>
              <CardDescription>Fine-tune your investment strategy with additional options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="initialInvestment">Initial Investment</Label>
                  <Input
                    id="initialInvestment"
                    type="number"
                    min={0}
                    value={initialInvestment}
                    onChange={(e) => setInitialInvestment(Number(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="annualReturn">Annual Return (%)</Label>
                  <Input
                    id="annualReturn"
                    type="number"
                    min={0}
                    max={100}
                    step={0.1}
                    value={annualReturn}
                    onChange={(e) => setAnnualReturn(Number(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="years">Investment Period (Years)</Label>
                  <Input
                    id="years"
                    type="number"
                    min={1}
                    max={50}
                    value={years}
                    onChange={(e) => setYears(Number(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="additionalContribution">Additional Contribution</Label>
                  <Input
                    id="additionalContribution"
                    type="number"
                    min={0}
                    value={additionalContribution}
                    onChange={(e) => setAdditionalContribution(Number(e.target.value))}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="contributionFrequency">Contribution Frequency</Label>
                  <Select value={contributionFrequency} onValueChange={setContributionFrequency}>
                    <SelectTrigger id="contributionFrequency">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yearly">Yearly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Investment Results</CardTitle>
          <CardDescription>Projected growth based on your parameters</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-muted p-4 rounded-lg">
              <div className="text-sm text-muted-foreground">Future Value</div>
              <div className="text-2xl font-bold">{formatCurrency(results.futureValue)}</div>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <div className="text-sm text-muted-foreground">Total Invested</div>
              <div className="text-2xl font-bold">{formatCurrency(results.totalInvestment)}</div>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <div className="text-sm text-muted-foreground">Total Return</div>
              <div className="text-2xl font-bold">{formatCurrency(results.totalReturn)}</div>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <div className="text-sm text-muted-foreground">ROI</div>
              <div className="text-2xl font-bold">{results.roi}%</div>
            </div>
          </div>

          <div className="h-[300px] mt-8">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" label={{ value: "Year", position: "insideBottom", offset: -5 }} />
                <YAxis
                  tickFormatter={(value) => `$${value.toLocaleString()}`}
                  label={{ value: "Value ($)", angle: -90, position: "insideLeft" }}
                />
                <Tooltip
                  formatter={(value) => [`$${Number(value).toLocaleString()}`, undefined]}
                  labelFormatter={(label) => `Year ${label}`}
                />
                <Bar dataKey="investment" name="Total Invested" fill="#94a3b8" />
                <Bar dataKey="value" name="Future Value" fill="#0ea5e9" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
