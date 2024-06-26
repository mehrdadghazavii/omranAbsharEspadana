import {
  ContructorCMPPage,
  DailyWorkerCMPPage,
  EffectiveActionCMPPage,
  FundPaymentCMPPage,
  ImageCMPPage,
  LetterCMPPage,
  LicenseCMPPage,
  MaterialCMPPage,
  ProblemCMPPage,
  ProgressCMPPage,
  SessionCMPPage,
  StaffCMPPage,
  ToolCMPPage,
  WeatherCMPPage,
  FinancesInfoesPaymentCMPPage
} from "pages";


export const ReportCMPPages: any = ({page, startDate, endDate}: any) => {

  switch (page) {
    case "weather":
      return <WeatherCMPPage startDate={startDate} endDate={endDate}/>
    case 'contructors':
      return <ContructorCMPPage startDate={startDate} endDate={endDate}/>
    case 'dailyWorker':
      return <DailyWorkerCMPPage startDate={startDate} endDate={endDate}/>
    case 'staffs':
      return <StaffCMPPage startDate={startDate} endDate={endDate}/>
    case 'tools':
      return <ToolCMPPage startDate={startDate} endDate={endDate}/>
    case 'materials':
      return <MaterialCMPPage startDate={startDate} endDate={endDate}/>
    case 'pictures':
      return <ImageCMPPage startDate={startDate} endDate={endDate}/>
    case 'seassion':
      return <SessionCMPPage startDate={startDate} endDate={endDate}/>
    case 'problems':
      return <ProblemCMPPage startDate={startDate} endDate={endDate}/>
    case 'progress':
      return <ProgressCMPPage startDate={startDate} endDate={endDate}/>
    case 'letters':
      return <LetterCMPPage startDate={startDate} endDate={endDate}/>
    case 'effectiveActions':
      return <EffectiveActionCMPPage startDate={startDate} endDate={endDate}/>
    case 'fundsPayments':
      return <FundPaymentCMPPage startDate={startDate} endDate={endDate}/>
      case 'projectsfinanceInfo':
        return <FinancesInfoesPaymentCMPPage startDate={startDate} endDate={endDate}/>
    case 'operationLicense':
      return <LicenseCMPPage startDate={startDate} endDate={endDate}/>
    default:
      return null
  }
}
