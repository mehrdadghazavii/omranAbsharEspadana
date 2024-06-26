import {
  ContructorReportDailyPage,
  EffectiveActionsReportDailyPage,
  FinancesInfoesPaymentReportDailyPage,
  FundsPaymentReportDailyPage,
  ImagesReportDailyPage,
  LettersReportDailyPage,
  LicensesReportDailyPage,
  MaterialsReportDailyPage,
  ProblemsReportDailyPage,
  ProgressReportDailyPage,
  SessionsReportDailyPage,
  StaffsReportDailyPage,
  ToolsReportDailyPage,
  WeatherReportDailyPage,
  WorkersReportDailyPage
} from "pages";


export const ReportDailyPages: any = ({page, date}: any) => {

  switch (page) {
    case "weather":
      return <WeatherReportDailyPage date={date}/>
    case 'contructors':
      return <ContructorReportDailyPage date={date}/>
    case 'dailyWorker':
      return <WorkersReportDailyPage date={date}/>
    case 'staffs':
      return <StaffsReportDailyPage date={date}/>
    case 'tools':
      return <ToolsReportDailyPage date={date}/>
    case 'materials':
      return <MaterialsReportDailyPage date={date}/>
    case 'pictures':
      return <ImagesReportDailyPage date={date}/>
    case 'seassion':
      return <SessionsReportDailyPage date={date}/>
    case 'problems':
      return <ProblemsReportDailyPage date={date}/>
    case 'progress':
      return <ProgressReportDailyPage date={date}/>
    case 'letters':
      return <LettersReportDailyPage date={date}/>
    case 'effectiveActions':
      return <EffectiveActionsReportDailyPage date={date}/>
    case 'fundsPayments':
      return <FundsPaymentReportDailyPage date={date}/>
    case 'projectsfinanceInfo':
      return <FinancesInfoesPaymentReportDailyPage date={date}/>
    case 'operationLicense':
      return <LicensesReportDailyPage date={date}/>
    default:
      return null
  }
}
