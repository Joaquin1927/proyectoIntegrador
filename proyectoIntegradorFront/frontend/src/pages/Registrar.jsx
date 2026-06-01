const payload = {
  certId: data.certId || null,
  projectName: data.projectName || null,
  captureDate: data.captureDate,

  issuanceDate: data.issuanceDate || null,
  retirementDate: data.retirementDate || null,

  tonCO2eq: parseFloat(data.tonCO2eq),
  retirementStatus: data.retirementStatus === "true",

  // ✅ 🔥 CLAVE
  estado: "pendiente",

  beneficiary: data.beneficiary || null,
  coBenefits: data.coBenefits || null,
  projectType: data.projectType || null,
  externalUrl: data.externalUrl || null,

  reporteId: data.reporteId ? parseInt(data.reporteId) : null,

  planta: {
    id: parseInt(data.plantaId),
  }
};