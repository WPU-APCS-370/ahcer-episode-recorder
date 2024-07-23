export interface User {
  userName : string,
  firstName : string,
  lastName : string,
  parentId?: string,
  users?: string[],
  emailAddress : string,
  id : string,
  lastPatientViewed: string,
  videos: string[],
  lastPatientViewdUserId:string,
}
