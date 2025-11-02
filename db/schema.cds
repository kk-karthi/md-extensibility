namespace sap.cim.masterdata;

entity CompanyCode {
  key ID : UUID;
    code: String(10); // Company code
    name: String(25); // Company name
    country: String(3); // Country iso
    currency: String(5); // Currency iso
    language: String(5); // language iso
    city: String(40); // City
    status: Integer default 0;
    statusModifiedAt: Timestamp @cds.on.insert: $now;
    fiscalYearEndDate: String(5); //  fiscal year end date 'MM-DD'
    vatRegistration: String(256);
    taxJurisdiction: String(15);
}