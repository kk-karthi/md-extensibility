using sap.cim.masterdata as masterdata from '../db/schema';

@path: '/masterdata'
service MasterDataService {
  entity CompanyCodes as projection on masterdata.CompanyCode;
}