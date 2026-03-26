const LabResultCard = ({ lab }) => (
  <div className="bg-white border rounded-lg p-4 mb-4">
    <h3 className="text-lg font-medium">{lab.name}</h3>
    <h2 className="text-2xl font-bold">{lab.value}</h2>
    <p>LOINC: {lab.loinc}</p>

    {lab.evidence && (
      <p className="text-sm mt-2">
        📍 Found in report: <mark>{lab.evidence}</mark>
      </p>
    )}
  </div>
);

export default LabResultCard;
