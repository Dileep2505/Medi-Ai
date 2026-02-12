import HealthConditionCard from "./HealthConditionCard";
import AllergyCard from "./AllergyCard";
import LabResultCard from "./LabResultCard";

const MedicalSummary = ({ data }) => {
  return (
    <div className="space-y-6">

      <h2 className="text-2xl font-semibold">
        Health Conditions Found ({data.conditions.length})
      </h2>
      {data.conditions.map((c, i) => (
        <HealthConditionCard key={i} condition={c} />
      ))}

      <h2 className="text-2xl font-semibold">
        Allergies ({data.allergies.length})
      </h2>
      {data.allergies.map((a, i) => (
        <AllergyCard key={i} allergy={a} />
      ))}

      <h2 className="text-2xl font-semibold">
        Laboratory Results ({data.labs.length})
      </h2>
      {data.labs.map((l, i) => (
        <LabResultCard key={i} lab={l} />
      ))}

    </div>
  );
};

export default MedicalSummary;
