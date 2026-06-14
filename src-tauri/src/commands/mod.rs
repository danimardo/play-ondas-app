pub mod logging;
pub mod settings;
pub mod audio;
pub mod download;
pub mod tray;
pub mod shortcuts;

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize, PartialEq, Eq, Hash)]
#[serde(rename_all = "kebab-case")]
pub enum WaveId {
    Gamma,
    Beta,
    Alfa,
    Theta,
    Delta,
    BrownNoise,
    WhiteNoise,
    PinkNoise,
    GreenNoise,
    Fireplace,
}
// Serializes to: "gamma", "beta", "alfa", "theta", "delta",
//                "brown-noise", "white-noise", "pink-noise", "green-noise", "fireplace"
