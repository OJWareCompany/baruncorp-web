"use client";
import {
  Value,
  isElementList,
  isElement,
  getNodeString,
} from "@udecode/plate-common";
import { INITIAL_EDITOR_VALUE } from "./constants";

export function isEditorValueEmpty(value: Value): boolean {
  const textContent = value
    .filter((element) => isElement(element))
    .map((element) => getNodeString(element))
    .join("")
    .trim();

  return textContent === "";
}

export function getEditorValue(data: string | null | undefined): Value {
  if (data == null) {
    return INITIAL_EDITOR_VALUE;
  }

  try {
    const parsed = JSON.parse(data);
    if (isElementList(parsed)) {
      return parsed;
    }

    throw Error();
  } catch {
    return data
      .split("\n")
      .map((value) => ({ type: "p", children: [{ text: value.trim() }] }));
  }
}

export function transformEditorValueToStringOrNull(data: Value): string | null {
  if (isEditorValueEmpty(data)) {
    return null;
  }

  return JSON.stringify(data);
}
