import { withLicensedDemoOffset } from "../demoOffsets";
import type { KaraokeSong } from "../types";
import hatMua from "./hat-mua-vuong-van.json";
import ngayMai from "./ngay-mai-nguoi-ta-lay-chong.json";

export const NGAY_MAI_KARAOKE = withLicensedDemoOffset(ngayMai as KaraokeSong);
export const HAT_MUA_KARAOKE = withLicensedDemoOffset(hatMua as KaraokeSong);
