import profileJson from "../../data/profile.json";

import type { Profile } from "./types";

export function getProfile(): Profile {
  return profileJson as Profile;
}
