import { requireNativeModule } from "expo-modules-core";

export interface AppBlockerModule {
  requestPermission(): Promise<boolean>;
  hasPermission(): Promise<boolean>;
  startBlocking(packageNames: string[]): Promise<void>;
  stopBlocking(): Promise<void>;
  isBlocking(): Promise<boolean>;
}

export default requireNativeModule<AppBlockerModule>("AppBlocker");
