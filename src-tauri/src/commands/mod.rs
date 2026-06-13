pub mod logging;
pub mod settings;
pub mod audio;
pub mod download;
pub mod tray;

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize, PartialEq, Eq, Hash)]
#[serde(rename_all = "kebab-case")]
pub enum WaveId {
    Gamma,
    Beta,
    Alfa,
    ThetaDelta,
    BrownNoise,
}
// Serializes to: "gamma", "beta", "alfa", "theta-delta", "brown-noise"
