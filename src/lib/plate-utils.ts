"use client";
import {
  Value,
  isElementList,
  isElement,
  getNodeString,
  TElement,
  isText,
  TText,
  EDescendant,
} from "@udecode/plate-common";
import { TMentionElement } from "@udecode/plate-mention";
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

export function containsMention(nodes: (TElement | TText)[]): boolean {
  return nodes.some((node) => {
    if (isText(node)) {
      return false;
    }

    if (node.type === "mention") {
      return true;
    }

    if (node.children) {
      return containsMention(node.children);
    }

    return false;
  });
}

interface TMentionElementWithEmail extends TMentionElement {
  email: string;
}

function isMention(node: TElement): node is TMentionElementWithEmail {
  return node.type === "mention";
}

export function findAllEmails(nodes: EDescendant<Value>[]) {
  let set = new Set<string>();

  nodes.forEach((node) => {
    if (isText(node)) {
      return;
    }

    if (isMention(node)) {
      set.add(node.email);
      return;
    }

    set = new Set<string>([
      ...Array.from(set),
      ...findAllEmails(node.children),
    ]);
  });

  return Array.from(set);
}

export function trimValue(value: Value): Value {
  return value
    .reduce<Value>((prev, cur) => {
      if (
        prev.length === 0 &&
        cur.children.length === 1 &&
        cur.children[0].text === ""
      ) {
        return prev;
      }

      return [...prev, cur];
    }, [])
    .reduceRight<Value>((prev, cur) => {
      if (
        prev.length === 0 &&
        cur.children.length === 1 &&
        cur.children[0].text === ""
      ) {
        return prev;
      }

      return [cur, ...prev];
    }, []);
}
