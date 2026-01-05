export default function CO2Stats({ actions }) {
  const totalCO2 = actions.reduce((sum, a) => sum + (a.impact_co2_kg || 0), 0);
  const percent = Math.min((totalCO2 / 5000) * 100, 100);

  return (
    <div className="card bg-white/90 backdrop-blur-sm shadow-xl">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">
        Total CO₂ évité
      </h3>
      <div className="text-4xl font-bold text-green-700">
        {(totalCO2 / 1000).toFixed(1)} TONNES
      </div>
      <div className="mt-6 bg-gray-200 rounded-full h-8 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-yellow-500 to-green-600"
          style={{ width: percent + "%" }}
        />
      </div>
    </div>
  );
}
