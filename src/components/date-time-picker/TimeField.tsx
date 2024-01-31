"use client";

import { useRef } from "react";
import {
  AriaTimeFieldProps,
  TimeValue,
  useLocale,
  useTimeField,
} from "react-aria";
import { useTimeFieldState } from "react-stately";
import { useDateSegment } from "react-aria";
import { DateFieldState, DateSegment as IDateSegment } from "react-stately";
import { inputVariants } from "../ui/input";
import { cn } from "@/lib/utils";

interface DateSegmentProps {
  segment: IDateSegment;
  state: DateFieldState;
}

function DateSegment({ segment, state }: DateSegmentProps) {
  let ref = useRef(null);
  let { segmentProps } = useDateSegment(segment, state, ref);

  return (
    <div
      {...segmentProps}
      ref={ref}
      className={cn(
        "focus:rounded-sm focus:bg-accent focus:text-accent-foreground focus:outline-none",
        segment.type !== "literal" ? "px-[1px]" : "",
        segment.isPlaceholder ? "text-muted-foreground" : ""
      )}
    >
      {segment.text}
    </div>
  );
}

export default function TimeField(props: AriaTimeFieldProps<TimeValue>) {
  let { locale } = useLocale();
  let state = useTimeFieldState({
    ...props,
    locale,
  });

  let ref = useRef<HTMLDivElement | null>(null);
  let { fieldProps } = useTimeField(props, state, ref);

  return (
    <div
      {...fieldProps}
      className={cn(
        inputVariants(),
        "focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50"
      )}
      ref={ref}
      data-disabled={props.isDisabled}
    >
      {state.segments.map((segment, i) => (
        <DateSegment key={i} segment={segment} state={state} />
      ))}
      {state.isInvalid && <span aria-hidden="true">🚫</span>}
    </div>
  );
}
