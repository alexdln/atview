"use client";

import { useStore } from "contection";

import { SettingsStore } from "./stores";

export const useSettings = () => useStore(SettingsStore);
