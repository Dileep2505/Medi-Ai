const HealthConditionCard = ({ condition }) => {
  return (
    <div className="bg-yellow-50 border rounded-lg p-5 mb-5">
      <div className="flex justify-between">
        <div>
          <h2 className="text-xl font-semibold">{condition.name}</h2>
          <p className="text-gray-600">
            Medical term: {condition.medicalTerm} (ICD-10: {condition.icd})
          </p>
        </div>

        <div className="text-right">
          <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm">
            {condition.severity}
          </span>
          <p className="text-sm mt-1">{condition.confidence}% confidence</p>
        </div>
      </div>

      <Section title="What is this?" text={condition.description} />
      <Section title="What it means" text={condition.meaning} />
      <Section title="Why it matters" text={condition.risk} />

      <div className="mt-3">
        <h4 className="font-medium">Common symptoms</h4>
        <ul className="list-disc ml-5">
          {condition.symptoms.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
      </div>

      <div className="bg-green-100 p-3 rounded mt-4">
        <b>Good news:</b> {condition.goodNews}
      </div>

      {condition.evidence && (
        <div className="mt-3 text-sm">
          📍 Found in report: <mark>{condition.evidence}</mark>
        </div>
      )}
    </div>
  );
};

const Section = ({ title, text }) => (
  <div className="mt-3">
    <h4 className="font-medium">{title}</h4>
    <p>{text}</p>
  </div>
);

export default HealthConditionCard;
