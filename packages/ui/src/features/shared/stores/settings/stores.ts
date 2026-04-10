"use client";

import { createStore } from "contection";

import { DEFAULT_SETTINGS, type SettingsStoreValue } from "./data";

export const SettingsStore = createStore<SettingsStoreValue>(DEFAULT_SETTINGS);
