import {
  AtmosphereConditionSummaryPage,
  ConstructorSummaryPage,
  DailyWorkerSummaryPage,
  InputMaterialSummaryPage,
  OutputMaterialSummaryPage,
  StaffSummaryPage,
  ToolSummaryPage,
  WeatherSummaryPage,
  DailyWorkerPerformanceSummaryPage,
  StaffPerformanceSummaryPage,
  ToolPerformanceSummaryPage
} from "pages";


export const ReportSummaryPages: any = ({page, startDate, endDate}: any) => {

  switch (page) {
    case "weather":
      return <WeatherSummaryPage startDate={startDate} endDate={endDate}/>
    case "atmosphere":
      return <AtmosphereConditionSummaryPage startDate={startDate} endDate={endDate}/>
    case 'contructors':
      return <ConstructorSummaryPage startDate={startDate} endDate={endDate}/>
    case 'dailyWorker':
      return <DailyWorkerSummaryPage startDate={startDate} endDate={endDate}/>
    case 'staffs':
      return <StaffSummaryPage startDate={startDate} endDate={endDate}/>
    case 'tools':
      return <ToolSummaryPage startDate={startDate} endDate={endDate}/>
    case 'input-materials':
      return <InputMaterialSummaryPage startDate={startDate} endDate={endDate}/>
    case 'output-materials':
      return <OutputMaterialSummaryPage startDate={startDate} endDate={endDate}/>
    case 'dailyWorkerPerformance':
      return <DailyWorkerPerformanceSummaryPage startDate={startDate} endDate={endDate}/>
    case 'staffPerformance':
      return <StaffPerformanceSummaryPage startDate={startDate} endDate={endDate}/>
    case 'toolPerformance':
      return <ToolPerformanceSummaryPage startDate={startDate} endDate={endDate}/>
    default:
      return null
  }
}
