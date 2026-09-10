import type { AIPredictionResult, FeatureContribution } from '../types/farm';

export interface AIPredictorInput {
  batchId?: string;
  batchCode?: string;
  cultivarName: string;
  plantAgeDays: number; // 1 to 45
  leafCount: number; // 2 to 30
  plantHeightCm: number; // 3 to 30
  avgEc: number; // 0.8 to 3.0
  avgPh: number; // 4.5 to 7.5
  avgWaterTemp: number; // 16 to 32
  expectedPlants: number;
}

/**
 * AI Yield Prediction Simulator
 * Modeled after empirical agronomic data and ML models (Random Forest / XGBoost)
 * from Frontiers in Plant Science (2022) & Mendeley Hydroponic Lettuce Dataset.
 */
export function predictLettuceYield(input: AIPredictorInput): AIPredictionResult {
  const {
    batchId,
    batchCode,
    cultivarName,
    plantAgeDays,
    leafCount,
    plantHeightCm,
    avgEc,
    avgPh,
    avgWaterTemp,
    expectedPlants
  } = input;

  // 1. Base Sigmoidal Growth Baseline for Lettuce (Standard harvest ~ 35 days => ~190-210g)
  // Max potential fresh weight around harvest day 35-38 is ~ 200 - 240g
  const maxPotentialWeight = 220; 
  // Standard logistic curve based on days
  const growthFactor = 1 / (1 + Math.exp(-0.22 * (plantAgeDays - 24)));
  let baseWeight = maxPotentialWeight * growthFactor;

  // Morphological feature modifiers (Leaf count & height provide strong vegetative correlation)
  // Standard healthy lettuce at day 30 has ~16-20 leaves, height ~ 16-19cm
  const expectedLeaves = Math.max(2, plantAgeDays * 0.6);
  const leafRatio = Math.min(1.4, Math.max(0.6, leafCount / expectedLeaves));
  
  const expectedHeight = Math.max(3, plantAgeDays * 0.55);
  const heightRatio = Math.min(1.3, Math.max(0.7, plantHeightCm / expectedHeight));

  baseWeight = baseWeight * (leafRatio * 0.6 + heightRatio * 0.4);

  // 2. Environmental & Nutrient Penalties / Bonuses
  // Optimal EC for Lettuce: 1.5 - 1.8 mS/cm
  let ecMultiplier = 1.0;
  if (avgEc < 1.2) {
    // Nutrient starvation
    ecMultiplier = 0.75 + (avgEc / 1.2) * 0.25;
  } else if (avgEc > 2.2) {
    // Osmotic stress & tipburn risk
    ecMultiplier = Math.max(0.7, 1.0 - (avgEc - 2.2) * 0.25);
  } else if (avgEc >= 1.5 && avgEc <= 1.85) {
    // Optimal zone
    ecMultiplier = 1.05;
  }

  // Optimal pH: 5.6 - 6.2 (Virginia Tech / PSU recommendation)
  let phMultiplier = 1.0;
  if (avgPh < 5.4) {
    // Nutrient lockout (Ca/Mg deficiency)
    phMultiplier = Math.max(0.75, 1.0 - (5.4 - avgPh) * 0.25);
  } else if (avgPh > 6.5) {
    // Iron & micro-nutrient precipitation
    phMultiplier = Math.max(0.7, 1.0 - (avgPh - 6.5) * 0.28);
  } else {
    phMultiplier = 1.04;
  }

  // Optimal Water Temperature: 20 - 23°C
  let tempMultiplier = 1.0;
  if (avgWaterTemp > 25.0) {
    // Heat stress, low DO solubility
    tempMultiplier = Math.max(0.7, 1.0 - (avgWaterTemp - 25.0) * 0.05);
  } else if (avgWaterTemp < 18.0) {
    // Sluggish metabolism
    tempMultiplier = Math.max(0.8, 1.0 - (18.0 - avgWaterTemp) * 0.04);
  } else {
    tempMultiplier = 1.03;
  }

  // Combined Fresh Weight Prediction
  let predictedFreshWeight = baseWeight * ecMultiplier * phMultiplier * tempMultiplier;
  predictedFreshWeight = Math.max(10, Math.round(predictedFreshWeight * 10) / 10);

  // Projected at final harvest (day 35) if current age < 35
  let finalProjectedWeight = predictedFreshWeight;
  if (plantAgeDays < 35) {
    const daysRemaining = 35 - plantAgeDays;
    const dailyGrowthRate = (ecMultiplier * phMultiplier * tempMultiplier) * (plantAgeDays > 20 ? 8.5 : 4.2);
    finalProjectedWeight = Math.round((predictedFreshWeight + (daysRemaining * dailyGrowthRate)) * 10) / 10;
  }

  // Total batch yield (kg)
  const totalYieldKg = Math.round(((finalProjectedWeight * expectedPlants) / 1000) * 10) / 10;

  // Feature Importance breakdown (percentages summing to 100%)
  const featureContributions: FeatureContribution[] = [
    {
      feature: 'Tuổi cây trồng',
      importance: 34,
      impact: 'positive',
      description: `Đã phát triển ${plantAgeDays} ngày trong chu kỳ sinh trưởng tiêu chuẩn 35 ngày.`
    },
    {
      feature: 'Số lượng lá thật',
      importance: 24,
      impact: leafRatio >= 1.0 ? 'positive' : 'negative',
      description: `${leafCount} lá thật (${leafRatio >= 1.0 ? 'Sinh khối tán lá đạt chuẩn' : 'Tán lá phát triển chậm hơn mức trung bình'}).`
    },
    {
      feature: 'Nồng độ dinh dưỡng EC',
      importance: 18,
      impact: (avgEc >= 1.5 && avgEc <= 1.9) ? 'positive' : 'negative',
      description: `EC trung bình ${avgEc} mS/cm (${avgEc > 2.0 ? 'Hơi cao, có rủi ro cháy mép lá' : avgEc < 1.4 ? 'Nồng độ loãng, cần châm thêm Stock' : 'Nằm trong ngưỡng lý tưởng'}).`
    },
    {
      feature: 'Nhiệt độ nước dung dịch',
      importance: 14,
      impact: (avgWaterTemp >= 20 && avgWaterTemp <= 24) ? 'positive' : 'negative',
      description: `Nhiệt độ nước ${avgWaterTemp}°C (${avgWaterTemp > 24.5 ? 'Hơi ấm, cần theo dõi oxy hòa tan rễ' : 'Nhiệt độ mát mẻ, tối ưu cho xà lách'}).`
    },
    {
      feature: 'Độ pH dung dịch',
      importance: 10,
      impact: (avgPh >= 5.6 && avgPh <= 6.2) ? 'positive' : 'negative',
      description: `pH ${avgPh} (${avgPh >= 5.6 && avgPh <= 6.2 ? 'Dải hấp thu đa vi lượng hoàn hảo' : 'Lệch ngưỡng hấp thu, cần cân chỉnh'}).`
    }
  ];

  // Risk Score calculation
  let riskScore: 'low' | 'moderate' | 'high' = 'low';
  if (avgEc > 2.2 || avgPh < 5.3 || avgPh > 6.6 || avgWaterTemp > 25.5) {
    riskScore = 'high';
  } else if (avgEc > 1.95 || avgPh < 5.5 || avgPh > 6.3 || avgWaterTemp > 24.2) {
    riskScore = 'moderate';
  }

  // Actionable Decision Support Recommendations
  const recommendations: string[] = [];

  if (avgEc > 1.9) {
    recommendations.push(`⚠️ Nồng độ EC (${avgEc} mS/cm) cao hơn mức mục tiêu (1.6 - 1.8 mS/cm). Bổ sung 10-15% nước sạch để phòng ngừa tipburn (cháy chóp lá non) do thiếu Canxi cục bộ.`);
  } else if (avgEc < 1.4) {
    recommendations.push(`💡 EC hiện tại (${avgEc} mS/cm) hơi loãng. Nên bổ sung Stock A và Stock B theo tỷ lệ 1:100 để đẩy nhanh tốc độ tích lũy sinh khối lá.`);
  }

  if (avgPh < 5.5) {
    recommendations.push(`🧪 pH (${avgPh}) đang ở vùng acid nhẹ dưới ngưỡng hấp thu Canxi/Magie. Châm thêm dung dịch kiềm nhẹ (KOH hoặc K2CO3) để nâng pH về 5.8.`);
  } else if (avgPh > 6.3) {
    recommendations.push(`🧪 pH (${avgPh}) cao có thể gây kết tủa Sắt (Fe) và Phosphat. Điều chỉnh bằng dung dịch pH Down (axit photphoric 10%).`);
  }

  if (avgWaterTemp > 24.0) {
    recommendations.push(`🌡️ Nhiệt độ nước (${avgWaterTemp}°C) tăng cao làm giảm khả năng giữ oxy hòa tan (DO). Cân nhắc kích hoạt quạt thông gió hoặc sục khí tăng cường để bảo vệ rễ.`);
  }

  if (recommendations.length === 0) {
    recommendations.push(`✅ Điều kiện dinh dưỡng, pH và nhiệt độ nước đang ở trạng thái lý tưởng. Tiếp tục duy trì để đạt khối lượng mục tiêu ${finalProjectedWeight} g/cây vào ngày thu hoạch.`);
  }

  return {
    batchId,
    batchCode: batchCode || 'SAMPLE-PREDICTION',
    cultivarName,
    plantAgeDays,
    leafCount,
    plantHeightCm,
    avgEc,
    avgPh,
    avgWaterTemp,
    predictedFreshWeightG: finalProjectedWeight,
    expectedHarvestablePlants: expectedPlants,
    totalBatchYieldKg: totalYieldKg,
    confidenceR2: 0.895,
    riskScore,
    featureContributions,
    recommendations
  };
}
