import axios from "axios";

export const analyzeHealthDataAI = async (text, age, gender) => {
  const res = await axios.post("http://localhost:5000/api/analyze", {
    text,
    age,
    gender
  });
  return res.data;
};
