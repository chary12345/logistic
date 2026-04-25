// ============================================================
// All domain models — mirroring Spring Boot DTOs exactly
// ============================================================

// ---- Auth / Login ----
export interface CompanyAndBranchDetails {
  companyCode: string;
  companyName: string;
  branchCode: string;
  branchName: string;
  branchType?: string;
  companyLogo?: string;
  groupName?: string;
  plan?: string;
  companyActive?: boolean;
}

export interface LoginResponse {
  firstName: string;
  lastName: string;
  userName?: string;
  role: string;
  username?: string;
  phone?: string;
  email?: string;
  createdDate?: string;
  companyCode?: string;
  branchCode?: string;
  companyName?: string;
  branchName?: string;
  companyAndBranchDeatils?: CompanyAndBranchDetails;
}

export interface LoginApiResponse {
  status: string;
  message?: string;
  loginResponse?: LoginResponse;
}

// ---- Article Detail ----
export interface ArticleDetailDto {
  article: string;
  artQty: string;
  artType: string;
  saidToContain: string;
  artAmt: string;
  total: string;
}

// ---- Booking ----
export interface BookingDTO {
  loadingReciept?: string;
  billType?: string;
  paidVia?: string;
  consignorName?: string;
  consignorMobile?: string;
  consignorGST?: string;
  consignorAddress?: string;
  consigneeName?: string;
  consigneeMobile?: string;
  consigneeGST?: string;
  consigneeAddress?: string;
  destinationBranchCode?: string;
  invoiceNumber?: string;
  invoiceValue?: number;
  eWayBillNumber?: string;
  freight?: number;
  loading?: number;
  loadingCharge?: number;
  sgst?: number;
  cgst?: number;
  igst?: number;
  articleDetails?: ArticleDetailDto[];
  bookingDate?: string;
  consignStatus?: string;
  branchCode?: string;
  companyCode?: string;
  employeeName?: string;
}

export interface Booking {
  id?: number;
  loadingReciept?: string;
  billType?: string;
  paidVia?: string;
  consignorName?: string;
  consignorMobile?: string;
  consignorAddress?: string;
  consigneeName?: string;
  consigneeMobile?: string;
  consignorGST?: string;
  consigneeGST?: string;
  consigneeAddress?: string;
  destinationBranchCode?: string;
  invoiceNumber?: string;
  invoiceValue?: number;
  eWayBillNumber?: string;
  freight?: number;
  loading?: number;
  loadingCharge?: number;
  sgst?: number;
  cgst?: number;
  igst?: number;
  articleDetails?: ArticleDetailDto[];
  bookingDate?: string;
  consignStatus?: string;
  dispatchDate?: string;
  recieveDate?: string;
  deliveryDate?: string;
  bookingtype?: string;
  employeeName?: string;
  companyCode?: string;
  branchCode?: string;
  BranchCode?: string;
  modifiedDate?: string;
  nextLr?: string;
}

export interface BookingPageResponse {
  content: Booking[];
  lastId?: string;
  last?: boolean;
  pageSize?: number;
  pageNumber?: number;
  totalElements?: number;
  totalPages?: number;
}

export interface BookingSearchRequest {
  fromDate?: string;
  toDate?: string;
  region?: string;
  subRegion?: string;
  branchCode?: string;
  lastId?: string;
  companyCode?: string;
}

// ---- Dispatch ----
export interface DispatchRequest {
  lrIds: string[];
  vehicleNumber: string;
  vehicleName: string;
  driverName: string;
  driverPhone: string;
  destinationBranch: string;
}

export interface DispatchResponse {
  bookings?: Booking[];
  loadingSheet?: any;
}

// ---- Receive / Delivery ----
export interface ReceiveRequest {
  lsId: number;
  lrIds: string[];
}

export interface LoadingSheetInfo {
  loadingSheetNumber?: number;
  vehicleNumber?: string;
  vehicleName?: string;
  destinationBranch?: string;
  driverName?: string;
  driverPhone?: string;
  lrIdsJson?: string;
  createdAt?: string;
  status?: string;
}

export interface DispatchedResponseDTO {
  loadingSheet?: LoadingSheetInfo;
  bookings?: Booking[];
  status?: string;
}

// ---- Operation ----
export interface OperationFilter {
  fromDate?: string;
  toDate?: string;
  region?: string;
  subregion?: string;    // lowercase 'r' — must match Java OperationFilter field
  branchCode?: string;
  employeeName?: string;
  status?: string;
}

export interface BranchOption {
  label: string;   // display: "PITAPURAM"
  code: string;    // value:   "PISENA"
}

export interface BookingSummaryRow {
  type: string;
  totalFreight: number;
  gst: number;
  grandTotal: number;
}

// ---- Branch ----
export interface BranchDTO {
  branchCode: string;
  branchName: string;
  state?: string;
  city?: string;
  branchType?: string;
  addressStreet?: string;
  phone?: string;
  phone2?: string;
  email?: string;
  gstin?: string;
  contactPerson?: string;
  postalCode?: string;
  companyCode?: string;
  isActive?: boolean;
}

export interface BranchMap {
  branchCode: string;
  branchName: string;
}

// ---- Employee / User ----
export interface UserModel {
  firstName: string;
  lastName: string;
  username?: string;
  password?: string;
  phone?: string;
  email?: string;
  role: string;
  branchCode?: string;
  companyCode?: string;
}

// ---- Vehicle ----
export interface VehicleRequest {
  truckNumber: string;
  vehicleName: string;
  capacity?: number;
  ownerName?: string;
  vehicleType?: string;
  rcNumber?: string;
  isActive?: boolean;
  branchCode?: string;
  companyCode?: string;
}

export interface VehicleDTO {
  truckNumber: string;
  vehicleName: string;
  capacity?: number;
  vehicleType?: string;
  isActive?: boolean;
}

// ---- Statement ----
export interface StatementDto {
  loadingReciept?: string;
  bookingDate?: string;
  consigneeName?: string;
  consignorName?: string;
  destinationBranchCode?: string;
  billType?: string;
  freight?: number;
  loading?: number;
  loadingCharge?: number;
  sgst?: number;
  cgst?: number;
  igst?: number;
  gst?: number;
  total?: number;
  consignStatus?: string;
  dispatchDate?: string;
}

// ---- Contact ----
export interface Contact {
  id?: number;
  type?: string;       // 'consignor' | 'consignee'
  name?: string;
  mobile?: string;
  gst?: string;
  address?: string;
  branchCode?: string;
  companyCode?: string;
}

// ---- Password ----
export interface PasswordChangeRequest {
  username: string;
  currentPassword: string;
  newPassword: string;
}
