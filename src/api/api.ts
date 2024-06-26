import http from "../utils/http.utils";

type Id = string;

export interface PostForInsert {
  Name: string;
  ProjectId: Id;
}

export interface LoginParams {
  // grant_type: string;
  username: string;
  password: string;
}

interface ApiResponse<T> {
  data: T;
  status: number;
}

export async function login(bodyQuery: any): Promise<ApiResponse<any>> {
  try {
    const res = await http.post("/api/Account/Login", bodyQuery);
    return { data: res.data, status: res.status };
  } catch (error) {
    return { data: error.response.data, status: error.response.status };
  }
}

export function getCompanies() {
  return http
    .get("/api/companies")
    .then((res) => res.data)
    .catch((error) => error);
}

export function getCompanyProfile(companyId: Id) {
  return http
    .get(`/api/Companies/CompanyProfile/${companyId}`)
    .then((res) => res.data)
    .catch((error) => error);
}

export interface CompanyProfileData {
  activityType: string;
  address: string;
  id: Id;
  isLegal: boolean;
  name: string;
  nationalCode: string;
  phoneNumber: string;
  province: string;
  town: string;
  city: string;
  zipCode: string;
}

export function updateCompanyProfile(companyId: Id, data:CompanyProfileData ) {
  return http
      .put(`/api/Companies/PutCompany/${companyId}`, data)
      .then((res) => res.data)
      .catch((error) => error);
}

export function ChangeCompaniesLogo (data: { companyId: Id; logo: string; }) {
  return http
      .post("/api/Companies/ChangeCompaniesLogo", data)
      .then(res => res.data)
      .catch(error => error);
}

export function getPrice() {
  return http
    .get("/api/Discounts/GetPrice")
    .then((res) => res.data)
    .catch((error) => error);
}

export function getCompanyUsers(companyId: Id) {
  return http
    .get(`/api/CompanyUser/GetCompanyUserByCompanyId/${companyId}`)
    .then((res) => res.data)
    .catch((error) => error);
}

export function getUserByPhoneNumber(phoneNumber: string) {
  return http
    .get(`/api/AccessLevels/GetUserIdByPhoneNumber/${phoneNumber}`)
    .then((res) => res.data)
    .catch((error) => error);
}

export interface EditUserParams {
  FirstName: string;
  LastName: string;
  BirthDate: object;
  Email: string;
  JobTitle: string;
}
export function updateUser(data: EditUserParams) {
  return http
    .put(`/api/Account/UpdateUser`, data)
    .then((res) => res.data)
    .catch((error) => error);
}

export function getUserInfo () {
  return http
    .get("/api/Account/UserInfo")
    .then((res) => res.data)
    .catch((error) => error);
}

export function uploadUserImage(data: any) {
  var bodyFormData = new FormData();
  bodyFormData.append('ImageName', data.imageName);
  bodyFormData.append('ImageFile', data.imageFile);
  return http
    .post('/api/Account/UploadProfile', bodyFormData)
    .then((res) => res.data)
    .catch((error) => error);
}

export function deleteCompanyUser(userId: Id, companyId: Id) {
  return http
    .delete(`/api/CompanyUser/DeleteCompanyUser/${userId}/${companyId}`)
    .then((res) => res.data)
    .catch((error) => error);
}

export interface PostOrPutCmpUsrData {
  ApplicationUserId: string;
  CompanyId: string;
  ProjectManagement: boolean;
  ReadMessageAccess: boolean;
  UserManagement: boolean;
  WriteMessageAccess: boolean;
}

export function postCompanyUser(data: PostOrPutCmpUsrData) {
  return http
    .post(`/api/CompanyUsers`, data)
    .then((res) => res.data)
    .catch((error) => error);
}

export function putCompanyUser(data: PostOrPutCmpUsrData, companyId: Id) {
  return http
    .put(`/api/CompanyUsers/${companyId}`, data)
    .then((res) => res.data)
    .catch((error) => error);
}

export function deleteUserProject(userId: Id) {
  return http
    .delete(`/api/AccessLevels/${userId}`)
    .then((res) => res.data)
    .catch((error) => error);
}

export interface PostOrPutUserProjectProps {
  allowToAddUser: boolean;
  applicationUserId: string;
  contructorAccess: boolean;
  dailyWorkerAccess: boolean;
  fullDataAccessInPdf: boolean;
  fundPaymentAccess: boolean;
  id: string;
  materialAccess: boolean;
  pictureAccess: boolean;
  problemAccess: boolean;
  projecsFinanceInfoAccess: boolean;
  projectId: string;
  readMessageAccess: boolean;
  reminderAccess: boolean;
  sessionAccess: boolean;
  staffAccess: boolean;
  toolAccess: boolean;
  userType: number;
  weatherAccess: boolean;
  writeMessageAccess: boolean;
}

export function putUserProject(data: PostOrPutUserProjectProps, userId: Id) {
  return http
    .put(`/api/AccessLevels/PutAccessLevel/${userId}`, data)
    .then((res) => res.data)
    .catch((error) => error);
}

export function postUserProject(data: PostOrPutUserProjectProps) {
  return http
    .post(`/api/AccessLevels`, data)
    .then((res) => res.data)
    .catch((error) => error);
}

export function getUsersOfProject(projectId: Id) {
  return http
    .get(`/api/AccessLevels/GetAccessLevelByProjectIdForWeb/${projectId}`)
    .then((res) => res.data)
    .catch((error) => error);
}

export function getCompanyUsersForProject(companyId: Id, projectId: Id) {
  return http
    .get(`/api/CompanyUser/GetCompaniesUsers/${companyId}`, { params: { projectId } })
    .then((res) => res.data)
    .catch((error) => error);
}

export function getVerifiedForBadge(projectId: string, date: string): {} {
  return http
    .get(`/api/Projects/GetUnVerifiedForBadge/${projectId}`, { params: { date } })
    .then((res) => res.data)
    .catch((error) => error);
}

export interface PostWeatherProps {
  Climate: number;
  Atmosphere: number;
  MinDegree: number;
  MaxDegree: number;
  Date: string;
  LastUserLevel: number;
  ReportDate: string;
  Description: string;
  ProjectId: Id;
}

//Reject Daily Reports
/* ===========> prevent repeating reject APIs, and the use of various types of reports in this Api <========== */
export const rejectDailyReports = async (rowId: Id, rejectType: string, projectId: Id) => {
  return http
      .put(`/api/${rejectType}s/RejectCurrent${rejectType}/${rowId}?projectId=${projectId}`)
      .then((res) => res.data)
      .catch((error) => error);
}

//Weather Report Daily
export function postWeather(data: PostWeatherProps) {
  return http
    .post(`/api/Weathers`, data)
    .then((res) => res.data)
    .catch((error) => error);
}

export function getWeatherByProjectId(projectId: string, date: string) {
  return http
    .get(`/api/Weathers/GetWeatherByProjectId/${projectId}`, { params: { date } })
    .then((res) => res.data)
    .catch((error) => error);
}

export function getWeatherById(weatherId: string) {
  return http
    .get(`/api/Weathers/GetWeatherById/${weatherId}`)
    .then((res) => res.data)
    .catch((error) => error);
}

export interface PutWeatherProps {
  Id: Id;
  Climate: number;
  Atmosphere: number;
  MinDegree: number;
  MaxDegree: number;
  Date: string;
  Description: string;
  ProjectId: Id;
  ReportDate: string;
  LastUserLevel: number;
}

export function putWeather(data: PutWeatherProps, weatherId: Id) {
  return http
    .put(`/api/Weathers/PutWeather/${weatherId}`, data)
    .then((res) => res.data)
    .catch((error) => error);
}

export function deleteWeather(weatherId: string, projectId: string) {
  return http
    .delete(`/api/DeleteWeather/${weatherId}`, { params: { projectId } })
    .then((res) => res.data)
    .catch((error) => error);
}

export function verifyWeather(weatherId: string, projectId: string) {
  return http
    .get(`/api/Weathers/VerifyCurrentWeathers/${weatherId}`, { params: { projectId } })
    .then((res) => res.data)
    .catch((error) => error);
}

//contructor report daily
export function getContructorsByProjectId(projectId: Id, date: string) {
  return http
    .get(`/api/Contructors/GetContructorByProjectId/${projectId}`, { params: { date } })
    .then((res) => res.data)
    .catch((error) => error);
}

export function getActivityTypesByProjectId(projectId: Id) {
  return http
    .get(`/api/ActivityTypes/GetActivityTypeByProjectId/${projectId}`)
    .then((res) => res.data)
    .catch((error) => error);
}

export function getContructorsOfProject(projectId: string) {
  return http
    .get(`/api/ContructorNames/GetContructorNameByProjectId/${projectId}`)
    .then((res) => res.data)
    .catch((error) => error);
}

export function verifyCurrentContructor(contructorId: Id, projectId: Id) {
  return http
    .get(`/api/Contructors/VerifyCurrentContructor/${contructorId}`, { params: { projectId } })
    .then((res) => res.data)
    .catch((error) => error);
}

export function verifyAllContructors(projectId: Id, date: string) {
  return http
    .get(`/api/Contructors/VerifyContructor/${projectId}`, { params: { date } })
    .then((res) => res.data)
    .catch((error) => error);
}

export function deleteContructorOfProject(contructorId: Id, projectId: Id) {
  return http
    .delete(`/api/DeleteContructor/${contructorId}`, { params: { projectId } })
    .then((res) => res.data)
    .catch((error) => error);
}

export interface PostOrPutContructorProps {
  ActivityCode: string;
  ActivityTypeId: Id;
  Amount: number;
  ContructorNameId: Id;
  Cost: number;
  Description: string;
  ExpertQty: number;
  lastUserLevel: number;
  Location: string;
  OperationDescription: string;
  projectId: Id;
  ReportDate: string;
  SimpleWorkerQty: number;
  TechnicalWorkerQty: number;
  Unit: string;
  Verify: number;
  WorkManQty: number;
  Id?: Id;
}

export function postContructorAtProject(data: PostOrPutContructorProps) {
  return http
    .post(`/api/Contructors`, data)
    .then((res) => res.data)
    .catch((error) => error);
}

export function putContructorAtProject(data: PostOrPutContructorProps, contructorId: Id) {
  return http
    .put(`/api/Contructors/PutContructor/${contructorId}`, data)
    .then((res) => res.data)
    .catch((error) => error);
}

export function postConstructorName(data: any) {
  return http
    .post(`/api/ContructorNames`, data)
    .then((res) => res.data)
    .catch((error) => error);
}

//end

//report daily workers
export function getWorkersOfProject(projectId: Id) {
  return http
    .get(`/api/DailyWorkerNames/GetDailyWorkerNameByProjectId/${projectId}`)
    .then((res) => res.data)
    .catch((error) => error);
}

export function getDailyWorkersByProjectId(projectId: Id, date: string) {
  return http
    .get(`/api/DailyWorkers/GetDailyWorkerByprojectId/${projectId}`, { params: { date } })
    .then((res) => res.data)
    .catch((error) => error);
}

export function verifyCurrentWorker(workerId: Id, projectId: Id) {
  return http
    .get(`/api/DailyWorkers/VerifyCurrentDailyWorker/${workerId}`, { params: { projectId } })
    .then((res) => res.data)
    .catch((error) => error);
}

export function verifyAllWorkers(projectId: Id, date: string) {
  return http
    .get(`/api/DailyWorkers/VerifyDailyWorkers/${projectId}`, { params: { date } })
    .then((res) => res.data)
    .catch((error) => error);
}

export function deleteWorkerOfProject(workerId: Id, projectId: Id) {
  return http
    .delete(`/api/DeleteDailyWorker/${workerId}`, { params: { projectId } })
    .then((res) => res.data)
    .catch((error) => error);
}

export interface PostOrPutWorkerProps {
  ActivityCode: string;
  ActivityType: string;
  DailyWorkerNameId: Id;
  Description: string;
  EnterTime: string;
  ExitTime: string;
  LastUserLevel: number;
  ProjectId: Id;
  ReportDate: string;
  ServingLocation: string;
  Wage: number;
  Id?: Id;
}

export function postDailyWorkerName(data: PostForInsert) {
  return http
    .post(`/api/DailyWorkerNames`, data)
    .then((res) => res.data)
    .catch((error) => error);
}

export function postWorkerAtProject(data: PostOrPutWorkerProps) {
  return http
    .post(`/api/DailyWorkers`, data)
    .then((res) => res.data)
    .catch((error) => error);
}

export function putWorkerAtProject(data: PostOrPutWorkerProps, workerId: Id) {
  return http
    .put(`/api/DailyWorkers/PutDailyWorker/${workerId}`, data)
    .then((res) => res.data)
    .catch((error) => error);
}

//end

//report daily staffs
export function getStaffsOfProject(projectId: Id) {
  return http
    .get(`/api/StaffNames/GetStaffNameByProjectId/${projectId}`)
    .then((res) => res.data)
    .catch((error) => error);
}

export function getDailyStaffsByProjectId(projectId: Id, date: string) {
  return http
    .get(`/api/Staffs/GetStaffByProjectId/${projectId}`, { params: { date } })
    .then((res) => res.data)
    .catch((error) => error);
}

export function getServingLocationsByProjectId(projectId: Id) {
  return http
    .get(`/api/ServingLocations/GetservingLocationByProjectId/${projectId}`)
    .then((res) => res.data)
    .catch((error) => error);
}

export function verifyCurrentStaff(staffId: Id, projectId: Id) {
  return http
    .get(`/api/Staffs/VerifyCurrentStaff/${staffId}`, { params: { projectId } })
    .then((res) => res.data)
    .catch((error) => error);
}

export function verifyAllStaffs(projectId: Id, date: string) {
  return http
    .get(`/api/Staffs/VerifyStaffs/${projectId}`, { params: { date } })
    .then((res) => res.data)
    .catch((error) => error);
}

export function deleteStaffOfProject(staffId: Id, projectId: Id) {
  return http
    .delete(`/api/DeleteStaff/${staffId}`, { params: { projectId } })
    .then((res) => res.data)
    .catch((error) => error);
}

export interface PostOrPutStaffProps {
  activityCode: string;
  description: string;
  enterTime: string;
  exitTime: string;
  lastUserLevel: number;
  presentationStatus: number;
  projectId: Id;
  reportDate: string;
  servingLocationId: Id;
  staffNameId: Id;
  wage: number;
  verify: number;
  Id?: Id;
}

export function postStaffAtProject(data: PostOrPutStaffProps) {
  return http
    .post(`/api/Staffs`, data)
    .then((res) => res.data)
    .catch((error) => error);
}

export function putStaffAtProject(data: PostOrPutStaffProps, workerId: Id) {
  return http
    .put(`/api/Staffs/PutStaff/${workerId}`, data)
    .then((res) => res.data)
    .catch((error) => error);
}

export function postStaffNames(data: PostForInsert) {
  return http
    .post(`/api/StaffNames`, data)
    .then((res) => res.data)
    .catch((error) => error);
}

export function postServingLocations(data: PostForInsert) {
  return http
    .post(`/api/ServingLocations`, data)
    .then((res) => res.data)
    .catch((error) => error);
}

//end

//report daily tools
export function getToolsOfProject(projectId: Id) {
  return http
    .get(`/api/ToolsNames/GetToolsNameByProjectId/${projectId}`)
    .then((res) => res.data)
    .catch((error) => error);
}

export function getDailyToolsByProjectId(projectId: Id, date: string) {
  return http
    .get(`/api/Tools/GetToolsByProjectId/${projectId}`, { params: { date } })
    .then((res) => res.data)
    .catch((error) => error);
}

export function verifyCurrentTool(toolId: Id, projectId: Id) {
  return http
    .get(`/api/Tools/VerifyCurrentTool/${toolId}`, { params: { projectId } })
    .then((res) => res.data)
    .catch((error) => error);
}

export function verifyAllTools(projectId: Id, date: string) {
  return http
    .get(`/api/Tools/VerifyTools/${projectId}`, { params: { date } })
    .then((res) => res.data)
    .catch((error) => error);
}

export function deleteToolOfProject(toolId: Id, projectId: Id) {
  return http
    .delete(`/api/DeleteTools/${toolId}`, { params: { projectId } })
    .then((res) => res.data)
    .catch((error) => error);
}

export interface PostOrPutToolProps {
  Name: string;
  Qty: number;
  EnterTime: string;
  ExitTime: string;
  WorkingStatus: number;
  ServingLocation: string;
  Wage: number;
  Description: string;
  ActivityCode: string;
  ActivityTypeId: Id;
  projectId: Id;
  lastUserLevel: number;
  reportDate: string;
  ToolsNameId: Id;
  ContructorId: Id;
  Id?: Id;
}

export function postToolAtProject(data: PostOrPutToolProps) {
  return http
    .post(`/api/Tools`, data)
    .then((res) => res.data)
    .catch((error) => error);
}

export function putToolAtProject(data: PostOrPutToolProps, toolId: Id) {
  return http
    .put(`/api/Tools/PutTools/${toolId}`, data)
    .then((res) => res.data)
    .catch((error) => error);
}

export function postToolsNames(data: PostForInsert) {
  return http
    .post(`/api/ToolsNames`, data)
    .then((res) => res.data)
    .catch((error) => error);
}

//end

//report daily material
export function getMaterialsOfProject(projectId: Id) {
  return http
    .get(`/api/MaterialsNames/GetMaterialsNameByProjectId/${projectId}`)
    .then((res) => res.data)
    .catch((error) => error);
}

export function getDailyMaterialsByProjectId(projectId: Id, date: string) {
  return http
    .get(`/api/Materials/GetMaterialsByProjectId/${projectId}`, { params: { date } })
    .then((res) => res.data)
    .catch((error) => error);
}

export function verifyCurrentMaterial(materialId: Id, projectId: Id) {
  return http
    .get(`/api/Materials/VerifyCurrentMaterial/${materialId}`, { params: { projectId } })
    .then((res) => res.data)
    .catch((error) => error);
}

export function verifyAllMaterials(projectId: Id, date: string) {
  return http
    .get(`/api/Materials/VerifyMaterials/${projectId}`, { params: { date } })
    .then((res) => res.data)
    .catch((error) => error);
}

export function uploadImageMaterial(image: File, companyId: Id, projectId:Id) {
  const formData = new FormData();
  formData.set("MaterialFile", image);
  return http
    .post(`/api/Materials/MediaUpload/${companyId}/${projectId}`, formData)
    .then((res) => res.data)
    .catch((error) => error);
}

export function deleteMaterialOfProject(materialId: Id, projectId: Id) {
  return http
    .delete(`/api/DeleteMaterials/${materialId}`, { params: { projectId } })
    .then((res) => res.data)
    .catch((error) => error);
}

export interface PostOrPutMaterialProps {
  Unit: string;
  Amount: number;
  Wage: number;
  Description: string;
  ActivityCode: string;
  ProjectId: Id;
  ContructorNameId: Id;
  MaterialsNameId: Id;
  ReportDate: string;
  PictureUrl?: string;
  PdfUrl?: string;
  LastUserLevel: number;
  ExitAndEnter: boolean;
  Id?: Id;
}

export function postMaterialAtProject(data: PostOrPutMaterialProps) {
  return http
    .post(`/api/Materials`, data)
    .then((res) => res.data)
    .catch((error) => error);
}

export function putMaterialAtProject(data: PostOrPutMaterialProps, materialId: Id) {
  return http
    .put(`/api/Materials/PutMaterials/${materialId}`, data)
    .then((res) => res.data)
    .catch((error) => error);
}

export function postMaterialsNames(data: PostForInsert) {
  return http
    .post(`/api/MaterialsNames`, data)
    .then((res) => res.data)
    .catch((error) => error);
}

//end

//report daily sessions
export function getDailySessionsByProjectId(projectId: Id, date: string) {
  return http
    .get(`/api/Seasions/GetSessionsByProjectId/${projectId}`, { params: { date } })
    .then((res) => res.data)
    .catch((error) => error);
}

export function verifyCurrentSession(sessionId: Id, projectId: Id) {
  return http
    .get(`/api/Seasions/VerifyCurrentSeasions/${sessionId}`, { params: { projectId } })
    .then((res) => res.data)
    .catch((error) => error);
}

export function verifyAllSessions(projectId: Id, date: string) {
  return http
    .get(`/api/Seasions/VerifySeasions/${projectId}`, { params: { date } })
    .then((res) => res.data)
    .catch((error) => error);
}

export function uploadImageSession(image: File, companyId: Id, projectId:Id) {
  const formData = new FormData();
  formData.set("SeassionFile", image);
  return http
    .post(`/api/Seasions/MediaUpload/${companyId}/${projectId}`, formData)
    .then((res) => res.data)
    .catch((error) => error);
}

export function deleteSessionOfProject(sessionId: Id, projectId: Id) {
  return http
    .delete(`/api/DeleteSeasions/${sessionId}`, { params: { projectId } })
    .then((res) => res.data)
    .catch((error) => error);
}

export interface PostOrPutSessionProps {
  Name: string;
  ProjectId: Id;
  PictureUrl?: string;
  PdfUrl?: string;
  ReportDate: string;
  LastUserLevel: number;
  Id?: Id;
}

export function postSessionAtProject(data: PostOrPutSessionProps) {
  return http
    .post(`/api/Seasions`, data)
    .then((res) => res.data)
    .catch((error) => error);
}

export function putSessionAtProject(data: PostOrPutSessionProps, sessionId: Id) {
  return http
    .put(`/api/Seasions/PutSeasions/${sessionId}`, data)
    .then((res) => res.data)
    .catch((error) => error);
}

//end
//report daily images
export function getDailyImagesByProjectId(projectId: Id, date: string) {
  return http
    .get(`/api/Pictures/GetPicturesByProjectId/${projectId}`, { params: { date } })
    .then((res) => res.data)
    .catch((error) => error);
}

export function verifyCurrentImage(imageId: Id, projectId: Id) {
  return http
    .get(`/api/Pictures/VerifyCurrentPictures/${imageId}`, { params: { projectId } })
    .then((res) => res.data)
    .catch((error) => error);
}

export function verifyAllImages(projectId: Id, date: string) {
  return http
    .get(`/api/Pictures/VerifyPictures/${projectId}`, { params: { date } })
    .then((res) => res.data)
    .catch((error) => error);
}

export function deleteImageOfProject(imageId: Id, projectId: Id) {
  return http
    .delete(`/api/Pictures/${imageId}`, { params: { projectId } })
    .then((res) => res.data)
    .catch((error) => error);
}

export interface PostOrPutImageProps {
  PictureName: string;
  PicturePath: string;
  ProjectId: Id;
  CompanyId: Id;
  Caption: string;
  ReportDate: string;
  LastUserLevel: number;
  Id?: Id;
}

export function postImageAtProject(data: PostOrPutImageProps) {
  return http
    .post(`/api/Pictures`, data)
    .then((res) => res.data)
    .catch((error) => error);
}

//end

//report daily problems
export function getDailyProblemsByProjectId(projectId: Id, date: string) {
  return http
    .get(`/api/Problems/GetProblemsByProjectId/${projectId}`, { params: { date } })
    .then((res) => res.data)
    .catch((error) => error);
}

export function verifyCurrentProblem(problemId: Id, projectId: Id) {
  return http
    .get(`/api/Problems/VerifyCurrentProblems/${problemId}`, { params: { projectId } })
    .then((res) => res.data)
    .catch((error) => error);
}

export function verifyAllProblems(projectId: Id, date: string) {
  return http
    .get(`/api/Problems/VerifyProblems/${projectId}`, { params: { date } })
    .then((res) => res.data)
    .catch((error) => error);
}

export function deleteProblemOfProject(problemId: Id, projectId: Id) {
  return http
    .delete(`/api/DeleteProblems/${problemId}`, { params: { projectId } })
    .then((res) => res.data)
    .catch((error) => error);
}

export interface PostOrPutProblemProps {
  ProjectId: Id;
  Name: string;
  ReportDate: string;
  LastUserLevel: number;
  Id?: Id;
}

export function postProblemAtProject(data: PostOrPutProblemProps) {
  return http
    .post(`/api/Problems`, data)
    .then((res) => res.data)
    .catch((error) => error);
}

export function putProblemAtProject(data: PostOrPutProblemProps, problemId: Id) {
  return http
    .put(`/api/Problems/PutProblems/${problemId}`, data)
    .then((res) => res.data)
    .catch((error) => error);
}

//end

//report daily progress
export function getDailyProgressByProjectId(projectId: Id, date: string) {
  return http
    .get(`/api/Progress/GetProgressByProjectId/${projectId}`, { params: { date } })
    .then((res) => res.data)
    .catch((error) => error);
}

export function verifyCurrentProgress(progressId: Id, projectId: Id) {
  return http
    .get(`/api/Progress/VerifyCurrentProgress/${progressId}`, { params: { projectId } })
    .then((res) => res.data)
    .catch((error) => error);
}

export function verifyAllProgresses(projectId: Id, date: string) {
  return http
    .get(`/api/Progress/VerifyProgress/${projectId}`, { params: { date } })
    .then((res) => res.data)
    .catch((error) => error);
}

export function deleteProgressOfProject(progressId: Id, projectId: Id) {
  return http
    .delete(`/api/Progress/DeleteProgress/${progressId}`, { params: { projectId } })
    .then((res) => res.data)
    .catch((error) => error);
}

export interface PostOrPutProgressProps {
  ProjectId: Id;
  Actual: number;
  Plan: number;
  ReportDate: string;
  LastUserLevel: number;
  Id?: Id;
}

export function postProgressAtProject(data: PostOrPutProgressProps) {
  return http
    .post(`/api/Progress`, data)
    .then((res) => res.data)
    .catch((error) => error);
}

export function putProgressAtProject(data: PostOrPutProgressProps, progressId: Id) {
  return http
    .put(`/api/Progress/PutProgress/${progressId}`, data)
    .then((res) => res.data)
    .catch((error) => error);
}

//end

//report daily letters
export function getDailyLettersByProjectId(projectId: Id, date: string) {
  return http
    .get(`/api/Letters/GetLettersByProjectId/${projectId}`, { params: { date } })
    .then((res) => res.data)
    .catch((error) => error);
}

export function getSendersAndReceiverOfProject(projectId: Id) {
  return http
    .get(`/api/SenderReceiver/GetSenderReceiverByProjectId/${projectId}`)
    .then((res) => res.data)
    .catch((error) => error);
}

export function verifyCurrentLetter(letterId: Id, projectId: Id) {
  return http
    .get(`/api/Letters/VerifyCurrentLetters/${letterId}`, { params: { projectId } })
    .then((res) => res.data)
    .catch((error) => error);
}

export function verifyAllLetters(projectId: Id, date: string) {
  return http
    .get(`/api/Letters/VerifyLetters/${projectId}`, { params: { date } })
    .then((res) => res.data)
    .catch((error) => error);
}

export function deleteLetterOfProject(letterId: Id, projectId: Id) {
  return http
    .delete(`/api/DeleteLetters/${letterId}`, { params: { projectId } })
    .then((res) => res.data)
    .catch((error) => error);
}

export function uploadImageLetter(image: File, companyId: Id, projectId:Id) {
  const formData = new FormData();
  formData.set("LettersFile", image);
  return http
    .post(`api/Letters/MediaUpload/${companyId}/${projectId}`, formData)
    .then((res) => res.data)
    .catch((error) => error);
}

export interface PostOrPutLetterProps {
  subject: string;
  description: string;
  number: string;
  date: Date;
  enterExit: boolean;
  senderReceiverId: Id;
  projectId: Id;
  lastUserLevel: number;
  reportDate: string;
  PictureUrl?: string;
  PdfUrl?: string;
  Id?: Id;
}

export interface PostOrPutLetterPropsWithName {
  subject: string;
  description: string;
  number: string;
  date: string;
  enterExit: boolean;
  Name: string;
  projectId: Id;
  lastUserLevel: number;
  reportDate: string;
  pictureUrl?: string;
  Id?: Id;
}

export function postLetterAtProject(data: any) {
  return http
    .post(`/api/Letters`, data)
    .then((res) => res.data)
    .catch((error) => error);
}

export function postActivityType(data: PostForInsert) {
  return http
    .post(`/api/ActivityTypes`, data)
    .then((res) => res.data)
    .catch((error) => error);
}

export function putLetterAtProject(data: PostOrPutLetterProps, progressId: Id) {
  return http
    .put(`/api/Letters/PutLetters/${progressId}`, data)
    .then((res) => res.data)
    .catch((error) => error);
}

export function postSenderReceiverName(data: PostForInsert) {
  return http
    .post(`/api/SenderReceiver`, data)
    .then((res) => res.data)
    .catch((error) => error);
}

//end

//report daily effective actions
export function getDailyEffectiveActionsByProjectId(projectId: Id, date: string) {
  return http
    .get(`/api/EffectiveActions/GetEffectiveActionsByProjectId/${projectId}`, { params: { date } })
    .then((res) => res.data)
    .catch((error) => error);
}

export function verifyCurrentAction(actionId: Id, projectId: Id) {
  return http
    .get(`/api/EffectiveActions/VerifyCurrentEffectiveActions/${actionId}`, { params: { projectId } })
    .then((res) => res.data)
    .catch((error) => error);
}

export function verifyAllActions(projectId: Id, date: string) {
  return http
    .get(`/api/EffectiveActions/VerifyEffectiveActions/${projectId}`, { params: { date } })
    .then((res) => res.data)
    .catch((error) => error);
}

export function deleteActionOfProject(actionId: Id, projectId: Id) {
  return http
    .delete(`/api/EffectiveActions/DeleteEffectiveActions/${actionId}`, { params: { projectId } })
    .then((res) => res.data)
    .catch((error) => error);
}

export interface PostOrPutActionProps {
  ProjectId: Id;
  Text: string;
  ReportDate: string;
  LastUserLevel: number;
  Id?: Id;
}

export function postActionAtProject(data: PostOrPutActionProps) {
  return http
    .post(`/api/EffectiveActions`, data)
    .then((res) => res.data)
    .catch((error) => error);
}

export function putActionAtProject(data: PostOrPutActionProps, actionId: Id) {
  return http
    .put(`/api/EffectiveActions/PutEffectiveActions/${actionId}`, data)
    .then((res) => res.data)
    .catch((error) => error);
}

//end

//report daily funds payments
export function getDailyFundPaymentsByProjectId(projectId: Id, date: string) {
  return http
    .get(`/api/FundsPayments/GetFundPaymentsJustByProjectId/${projectId}`, { params: { date } })
    .then((res) => res.data)
    .catch((error) => error);
}

export function getPayersOfProject(projectId: Id) {
  return http
    .get(`/api/Payers/GetPayerByProjectId/${projectId}`)
    .then((res) => res.data)
    .catch((error) => error);
}

export function getCostTypes() {
  return http
    .get(`/api/CostTypes`)
    .then((res) => res.data)
    .catch((error) => error);
}

export function getCountersPartiesOfProject(projectId: Id) {
  return http
    .get(`/api/CounterParties/GetCounterPartyByProjectId/${projectId}`)
    .then((res) => res.data)
    .catch((error) => error);
}

export function verifyCurrentFundPayment(fundId: Id, projectId: Id) {
  return http
    .get(`/api/FundsPayments/VerifyCurrentFundsPayments/${fundId}`, { params: { projectId } })
    .then((res) => res.data)
    .catch((error) => error);
}

export function verifyAllFunds(projectId: Id, date: string) {
  return http
    .get(`/api/FundsPayments/VerifyFundsPayments/${projectId}`, { params: { date } })
    .then((res) => res.data)
    .catch((error) => error);
}

export function deleteFundOfProject(fundId: Id, projectId: Id) {
  return http
    .delete(`/api/DeleteFundsPayments/${fundId}`, { params: { projectId } })
    .then((res) => res.data)
    .catch((error) => error);
}

export function uploadImageFund(image: File, companyId: Id, projectId:Id) {
  const formData = new FormData();
  formData.set("FundsPaymentFile", image);
  return http
    .post(`/api/FundsPayments/MediaUpload/${companyId}/${projectId}`, formData)
    .then((res) => res.data)
    .catch((error) => error);
}

export interface PostOrPutFundProps {
  Statement: string;
  Cost: number;
  Description: string;
  ActivityCode: string;
  PayerId: Id;
  CostTypeId: Id;
  CounterParty: {};
  ProjectId: Id;
  lastUserLevel: number;
  reportDate: string;
  PictureUrl?: string;
  PdfUrl?: string;
  Id?: Id;
}

export function postFundAtProject(data: PostOrPutFundProps) {
  return http
    .post(`/api/FundsPayments`, data)
    .then((res) => res.data)
    .catch((error) => error);
}

export function putFundAtProject(data: PostOrPutFundProps, progressId: Id) {
  return http
    .put(`/api/FundsPayments/PutFundsPayments/${progressId}`, data)
    .then((res) => res.data)
    .catch((error) => error);
}

export function postCostType(data: PostForInsert) {
  return http
    .post(`/api/CostTypes`, data)
    .then((res) => res.data)
    .catch((error) => error);
}

export function postPayer(data: PostForInsert) {
  return http
    .post(`/api/Payers`, data)
    .then((res) => res.data)
    .catch((error) => error);
}

export function GetCounterPartyByProjectIdAndType(projectId: Id, data: object) {
  return http
    .get(`/api/CounterParties/GetCounterPartyByProjectIdAndType/${projectId}`, { params: data })
    .then((res) => res.data)
    .catch((error) => error);
}

//end

//report daily finance info
export function getDailyFinanceInfoByProjectId(projectId: Id, date: string) {
  return http
    .get(`/api/ProjectsFinanceInfoes/GetProjectsFinanceInfoByProjectId/${projectId}`, { params: { date } })
    .then((res) => res.data)
    .catch((error) => error);
}

export function getFinanceInfoOfProject(projectId: Id) {
  return http
    .get(`/api/ProjectsFinanceInfoesNames/GetProjectsFinanceInfoesNameByProjectId/${projectId}`)
    .then((res) => res.data)
    .catch((error) => error);
}

export function verifyCurrentFinance(financeId: Id, projectId: Id) {
  return http
    .get(`/api/ProjectsFinanceInfoes/VerifyCurrentProjectsFinanceInfo/${financeId}`, { params: { projectId } })
    .then((res) => res.data)
    .catch((error) => error);
}

export function verifyAllFinances(projectId: Id, date: string) {
  return http
    .get(`/api/ProjectsFinanceInfoes/VerifyProjectsFinanceInfo/${projectId}`, { params: { date } })
    .then((res) => res.data)
    .catch((error) => error);
}

export function deleteFinanceOfProject(financeId: Id, projectId: Id) {
  return http
    .delete(`/api/DeleteProjectsFinanceInfo/${financeId}`, { params: { projectId } })
    .then((res) => res.data)
    .catch((error) => error);
}

export function uploadImageFinance(image: File, companyId: Id, projectId:Id) {
  const formData = new FormData();
  formData.set("PFIFile", image);
  return http
    .post(`/api/ProjectsFinanceInfoes/MediaUpload/${companyId}/${projectId}`, formData)
    .then((res) => res.data)
    .catch((error) => error);
}

export interface PostOrPutFinanceProps {
  ProjectsFinanceInfoesNameId: Id;
  StartDate: string; //iso format
  EndDate: string; //iso format
  Cost: number;
  Description: string;
  CostTypeId: Id;
  CounterParty: object;
  ProjectId: Id;
  LastUserLevel: number;
  ReportDate: string;
  PictureUrl?: string;
  PdfUrl?: string;
  Id?: Id;
}

export function postFinanceAtProject(data: PostOrPutFinanceProps) {
  return http
    .post(`/api/ProjectsFinanceInfoes`, data)
    .then((res) => res.data)
    .catch((error) => error);
}

export function putFinanceAtProject(data: PostOrPutFinanceProps, progressId: Id) {
  return http
    .put(`/api/ProjectsFinanceInfoes/PutProjectsFinanceInfo/${progressId}`, data)
    .then((res) => res.data)
    .catch((error) => error);
}

interface FinaceInfoNameProps {
  statement: string;
  ProjectId: Id;
}

export function postFinanceInfoesNames(data: FinaceInfoNameProps) {
  return http
    .post(`/api/ProjectsFinanceInfoesNames`, data)
    .then((res) => res.data)
    .catch((error) => error);
}

//end

//report daily license
export function getDailyLicenseByProjectId(projectId: Id, date: string) {
  return http
    .get(`/api/OperationLicense/GetOperationLicenseByProjectId/${projectId}`, { params: { date } })
    .then((res) => res.data)
    .catch((error) => error);
}

export function verifyCurrentLicense(licenseId: Id, projectId: Id) {
  return http
    .get(`/api/OperationLicense/VerifyCurrentOperationLicense/${licenseId}`, { params: { projectId } })
    .then((res) => res.data)
    .catch((error) => error);
}

export function verifyAllLicenses(projectId: Id, date: string) {
  return http
    .get(`/api/OperationLicense/VerifyOperationLicenses/${projectId}`, { params: { date } })
    .then((res) => res.data)
    .catch((error) => error);
}

export function deleteLicenseOfProject(licenseId: Id, projectId: Id) {
  return http
    .delete(`/api/OperationLicense/DeleteOperationLicense/${licenseId}`, { params: { projectId } })
    .then((res) => res.data)
    .catch((error) => error);
}

export function uploadImageLicense(image: File, companyId: Id, projectId:Id) {
  const formData = new FormData();
  formData.set("OperationLicenseFile", image);
  return http
    .post(`/api/OperationLicense/MediaUpload/${companyId}/${projectId}`, formData)
    .then((res) => res.data)
    .catch((error) => error);
}

export interface PostOrPutLicenseProps {
  subject: string;
  Number: string;
  Description: string;
  Amount: string;
  Unit: string;
  Verifier: string;
  Location: string;
  ProjectId: Id;
  LastUserLevel: number;
  ReportDate: string;
  PictureUrl?: string;
  PdfUrl?: string;
  Id?: Id;
}

export function postLicenseAtProject(data: PostOrPutLicenseProps) {
  return http
    .post(`/api/OperationLicense`, data)
    .then((res) => res.data)
    .catch((error) => error);
}

export function putLicenseAtProject(data: PostOrPutLicenseProps, progressId: Id) {
  return http
    .put(`/api/OperationLicense/PutOperationLicense/${progressId}`, data)
    .then((res) => res.data)
    .catch((error) => error);
}

//end

//get info projects
export function getProject(projectId: string) {
  return http
    .get(`/api/Projects/${projectId}`)
    .then((res) => res.data)
    .catch((error) => error);
}

export function getAccessUserProject(projectId: Id) {
  return http
    .get(`/api/AccessLevels/GetAccessLevelByProjectIdAndTokenUserId/${projectId}`)
    .then((res) => res.data)
    .catch((error) => error);
}
//end

//get weather comprehensive report
export function getWeatherCMPReport(projectId: Id, StartDate: string, EndDate: string) {
  return http
    .get(`/api/Weathers/WeatherReporting/${projectId}`, { params: { StartDate, EndDate } })
    .then((res) => res.data)
    .catch((error) => error);
}

//end

// get contructor comprehensive report
export function getContructorCMPReport(projectId: Id, StartDate: string, EndDate: string) {
  return http
    .get(`/api/Contructors/ContructorReporting/${projectId}`, { params: { StartDate, EndDate } })
    .then((res) => res.data)
    .catch((error) => error);
}

//end

// get DailyWorker comprehensive report
export function getDailyWorkerCMPReport(projectId: Id, StartDate: string, EndDate: string) {
  return http
    .get(`/api/DailyWorkers/DailyWorkerReporting/${projectId}`, { params: { StartDate, EndDate } })
    .then((res) => res.data)
    .catch((error) => error);
}

//end

// get staff comprehensive report
export function getStaffCMPReport(projectId: Id, StartDate: string, EndDate: string) {
  return http
    .get(`/api/Staffs/StaffsReporting/${projectId}`, { params: { StartDate, EndDate } })
    .then((res) => res.data)
    .catch((error) => error);
}

//end

// get tool comprehensive report
export function getToolCMPReport(projectId: Id, StartDate: string, EndDate: string) {
  return http
    .get(`/api/Tools/ToolsReporting/${projectId}`, { params: { StartDate, EndDate } })
    .then((res) => res.data)
    .catch((error) => error);
}

//end

// get material comprehensive report
export function getMaterialCMPReport(projectId: Id, StartDate: string, EndDate: string) {
  return http
    .get(`/api/Materials/MaterialsReporting/${projectId}`, { params: { StartDate, EndDate } })
    .then((res) => res.data)
    .catch((error) => error);
}

//end

// get image comprehensive report
export function getImageCMPReport(projectId: Id, StartDate: string, EndDate: string) {
  return http
    .get(`/api/Pictures/PicturesReporting/${projectId}`, { params: { StartDate, EndDate } })
    .then((res) => res.data)
    .catch((error) => error);
}

//end

// get session comprehensive report
export function getSessionCMPReport(projectId: Id, StartDate: string, EndDate: string) {
  return http
    .get(`/api/Seasions/SeassionsReporting/${projectId}`, { params: { StartDate, EndDate } })
    .then((res) => res.data)
    .catch((error) => error);
}

//end

// get session comprehensive report
export function getProblemCMPReport(projectId: Id, StartDate: string, EndDate: string) {
  return http
    .get(`/api/Problems/ProblemsReporting/${projectId}`, { params: { StartDate, EndDate } })
    .then((res) => res.data)
    .catch((error) => error);
}

//end

// get progress comprehensive report
export function getProgressCMPReport(projectId: Id, StartDate: string, EndDate: string) {
  return http
    .get(`/api/Progress/ProgressReporting/${projectId}`, { params: { StartDate, EndDate } })
    .then((res) => res.data)
    .catch((error) => error);
}

//end

// get letter comprehensive report
export function getLetterCMPReport(projectId: Id, StartDate: string, EndDate: string) {
  return http
    .get(`/api/Letters/LettersReporting/${projectId}`, { params: { StartDate, EndDate } })
    .then((res) => res.data)
    .catch((error) => error);
}

//end

// get effective-action comprehensive report
export function getEffectiveActionCMPReport(projectId: Id, StartDate: string, EndDate: string) {
  return http
    .get(`/api/EffectiveActions/effectiveActionsReporting/${projectId}`, { params: { StartDate, EndDate } })
    .then((res) => res.data)
    .catch((error) => error);
}

//end

// get fund-payment comprehensive report
export function getFundPaymentCMPReport(projectId: Id, StartDate: string, EndDate: string) {
  return http
    .get(`/api/FundsPayments/FundsPaymentsReporting/${projectId}`, { params: { StartDate, EndDate } })
    .then((res) => res.data)
    .catch((error) => error);
}

//end

// get finance comprehensive report
export function getFinanceCMPReport(projectId: Id, StartDate: string, EndDate: string) {
  return http
    .get(`/api/ProjectsFinanceInfoes/ProjectsFinanceInfoesReporting/${projectId}`, {
      params: {
        StartDate,
        EndDate,
      },
    })
    .then((res) => res.data)
    .catch((error) => error);
}

//end

// get license comprehensive report
export function getLicenseCMPReport(projectId: Id, StartDate: string, EndDate: string) {
  return http
    .get(`/api/OperationLicense/OperationLicenseReporting/${projectId}`, { params: { StartDate, EndDate } })
    .then((res) => res.data)
    .catch((error) => error);
}

//end

// get weather summary report
export function getWeatherSummaryReport(projectId: Id, StartDate: string, EndDate: string) {
  return http
    .get(`/api/Reporting/GetSummary/0`, { params: { projectId, StartDate, EndDate } })
    .then((res) => res.data)
    .catch((error) => error);
}

//end

// get constructor summary report
export function getConstructorSummaryReport(projectId: Id, StartDate: string, EndDate: string) {
  return http
    .get(`/api/Reporting/GetSummary/2`, { params: { projectId, StartDate, EndDate } })
    .then((res) => res.data)
    .catch((error) => error);
}

//end

// get atmosphere-condition summary report
export function getAtmosphereConditionSummaryReport(projectId: Id, StartDate: string, EndDate: string) {
  return http
    .get(`/api/Reporting/GetSummary/1`, { params: { projectId, StartDate, EndDate } })
    .then((res) => res.data)
    .catch((error) => error);
}

//end

// get staff summary report
export function getStaffSummaryReport(projectId: Id, StartDate: string, EndDate: string) {
  return http
    .get(`/api/Reporting/GetSummary/3`, { params: { projectId, StartDate, EndDate } })
    .then((res) => res.data)
    .catch((error) => error);
}

//end

// get daily-worker summary report
export function getDailyWorkerSummaryReport(projectId: Id, StartDate: string, EndDate: string) {
  return http
    .get(`/api/Reporting/GetSummary/4`, { params: { projectId, StartDate, EndDate } })
    .then((res) => res.data)
    .catch((error) => error);
}

//end

// get tool summary report
export function getToolSummaryReport(projectId: Id, StartDate: string, EndDate: string) {
  return http
    .get(`/api/Reporting/GetSummary/5`, { params: { projectId, StartDate, EndDate } })
    .then((res) => res.data)
    .catch((error) => error);
}

//end

// get input-material summary report
export function getInputMaterialSummaryReport(projectId: Id, StartDate: string, EndDate: string) {
  return http
    .get(`/api/Reporting/GetSummary/6`, { params: { projectId, StartDate, EndDate } })
    .then((res) => res.data)
    .catch((error) => error);
}

//end

// get output-material summary report
export function getOutputMaterialSummaryReport(projectId: Id, StartDate: string, EndDate: string) {
  return http
    .get(`/api/Reporting/GetSummary/7`, { params: { projectId, StartDate, EndDate } })
    .then((res) => res.data)
    .catch((error) => error);
}

//end

// send sms forget password
export function sendSmsForgetPassword(mobile: string) {
  return http
    .get(`/api/Account/SendSmsForForgotPassword`, { params: { mobile } })
    .then((res) => res.data)
    .catch((error) => error);
}

//end

// check code sms
export function checkSmsForgetPassword(mobile: string, code: string) {
  return http
    .get(`/api/Account/ConfirmCodeForForgotPassword`, { params: { mobile, code } })
    .then((res) => res.data)
    .catch((error) => error);
}

//end

// check discount
export function checkDiscount(code: string, companyId: Id) {
  return http
    .get(`/api/Discounts/CheckIfDiscountCodeIsValidForCompany/${code}`, { params: { companyId } })
    .then((res) => res.data)
    .catch((error) => error);
}

//end

// change password
export interface ChangePassProps {
  ConfirmPassword: string;
  NewPassword: string;
  UserId: Id;
}

export function changePassword(data: ChangePassProps) {
  return http
    .post(`/api/Account/ReSetPassword`, data)
    .then((res) => res.data)
    .catch((error) => error);
}

//end

// messages
export function getMessages(type: 1 | 2 | 3, id: Id) {
  return http
    .get(`/api/message/getByUserIdAndType`, { params: { id, type } })
    .then((res) => res.data)
    .catch((error) => error);
}

export function likeMessage(messageId: Id) {
  return http
    .put(`/api/message/like/${messageId}`)
    .then((res) => res.data)
    .catch((error) => error);
}

export function deleteMessage(messageId: Id) {
  return http
    .delete(`/api/message/${messageId}`)
    .then((res) => res.data)
    .catch((error) => error);
}

export function visitMessage(messageId: Id) {
  return http
    .put(`/api/message/visit/${messageId}`)
    .then((res) => res.data)
    .catch((error) => error);
}

export function getComments(messageId: Id) {
  return http
    .get(`/api/comment/get/${messageId}`)
    .then((res) => res.data)
    .catch((error) => error);
}

export interface PostCommentProps {
  MessageId: Id;
  Text: string;
}

export function postComment(data: PostCommentProps) {
  return http
    .post(`/api/comment/post`, data)
    .then((res) => res.data)
    .catch((error) => error);
}

export interface PostMessageProps {
  file: string;
  Title: string;
  Description: string;
  ProjectId: null | Id;
  CompanyId: Id;
  UserId: Id;
}

export function postMessage(data: PostMessageProps) {
  const formData = new FormData();
  formData.set("file", data.file ? data.file.slice(22) : "");
  formData.set("Title", data.Title);
  formData.set("Description", data.Description);
  formData.set("ProjectId", data.ProjectId);
  formData.set("CompanyId", data.CompanyId);
  formData.set("UserId", data.UserId);
  return http
    .post(`/api/Message/PostMessage`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    .then((res) => res.data)
    .catch((error) => error);
}

//end

//payment
export interface PostPayPurchaseProps {
  CompanyId: Id;
  Cost: number;
  Duration?: number;
  PurchaseStatus: 1 | 2 | 3;
  UsersCount: number;
  discountId: string
}

export function getCompanyPayments(companyId: Id): object {
  return http
      .get(`/api/Purchase/ListPayments/${companyId}`)
      .then(res => res.data)
      .catch(error => error);
}

export function getPaymentFactor(paymentId: Id): object {
  return http
      .get(`/api/Purchase/GetFactor/${paymentId}`)
      .then(res => res.data)
      .catch(error => error);
}
//end

//get pdf report daily
export function getPdfDailyReport(projectId: Id, date: string) {
  return http
    .get(`/api/PdfCreator/GetPdfReport/${projectId}`, { params: { date } })
    .then((res) => res.data)
    .catch((error) => error);
}

//end

//copy report daily
export interface CopyReportProps {
  fromDate: string;
  toDate: string;
}

export function postCopyDailyReport(projectId: Id, data: CopyReportProps) {
  return http
    .post(`/api/Projects/CopyFromDateToDate/${projectId}`, data)
    .then((res) => res.data)
    .catch((error) => error);
}

export interface PostCopyRecordsProps {
  from: string | Date;
  to: string | Date;
  recordIds: string[];
}
export function postCopyRecords(itemNumber: number, projectId: string, data: PostCopyRecordsProps) {
  return http
    .put(`/api/CopyData/CopyRecords/${itemNumber}/${projectId}`, data)
    .then((res) => res.data)
    .catch((error) => error);
}

export interface PostCopyItemsProps {
  from: string | Date;
  to: string | Date;
  items: number[];
}
export function postCopyItems(projectId: string, data: PostCopyItemsProps) {
  return http
    .put(`/api/CopyData/CopyItems/${projectId}`, data)
    .then((res) => res.data)
    .catch((error) => error);
}

//end

//add and edit project
export interface PostOrPutProjectProps {
  Master: string,
  CompanyId: Id,
  Monitoring: string,
  StartDate: string,
  EndDate: string,
  ProductionLicenseDate: string,
  TotalArea: number,
  UsefulMeter: number,
  ResidentialUnit: number,
  ProjectType: string,
  Name: string,
  Description: string,
  Address: string,
}

export function putProject(data: PostOrPutProjectProps) {
  return http
    .put("api/Projects", data)
    .then((res) => res.data)
    .catch((error) => error);
}
//end

//verify user
export interface VerifyUserProps {
  code: string;
  UserId: Id;
}

export function verifyMobileUser(data: VerifyUserProps) {
  return http
    .get("/api/Account/ConfirmMobile", { params: data })
    .then((res) => res.data)
    .catch((error) => error);
}
//end

//update user phone number

export function updatePhoneNumber(PhoneNumber: any) {
  return http
    .put('/api/Account/UpdatePhoneNumber', PhoneNumber)
    .then((res) => res.data)
    .catch((error) => error);
}

//send Verification Code to Phone Number
export function sendVerificationCode (phoneNumber: any) {
  return http
    .get(`/api/Account/SendConfirmationCode/${phoneNumber}`)
    .then((res) => res.data)
    .catch((error) => error);
}

//GetCompresedPictures

export function GetCompresedPictures(projectId: Id, data: any) {
  return http
    .get(`/api/Pictures/GetCompresedPictures/${projectId}`, { params: data })
    .then((res: any) => res.data)
    .catch((error) => error);
}

export function GetRemainStorageByCompanyId(companyId: Id) {
  return http
      .get(`/api/Storage/GetRemainStorageByCompanyId?companyId=${companyId}`)
      .then(res => res.data)
      .catch(error => error);
}

export function GetRemainStorageByProjectId(projectId: Id) {
  return http
      .get(`/api/Storage/GetRemainStorageByProjectId?projectId=${projectId}`)
      .then(res => res.data)
      .catch(error => error);
}

export function GetCalenderData(projectId: Id, data) {
  return http
      .get(`/api/Calender/${projectId}`, {params: data})
      .then(res => res.data)
      .catch(error => error);
}

export function getCalenderDayInfo(projectId: Id, date: string) {
  return http
      .get(`/api/Calender/GetCalenderInfoForDay/${projectId}`, {params: {date: date}})
      .then(res => res.data)
      .catch(error => error);
}