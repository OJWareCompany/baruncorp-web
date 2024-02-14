"use client";
import {
  Bar,
  BarChart,
  Legend,
  Rectangle,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
  XAxis,
  YAxis,
} from "recharts";
import {
  NameType,
  ValueType,
} from "recharts/types/component/DefaultTooltipContent";
import { Props as LegendProps } from "recharts/types/component/Legend";
import { stringToHexCode } from "@/lib/utils";

interface CustomTooltipProps extends TooltipProps<ValueType, NameType> {
  nameHexMap: Map<string, string>;
}

const CustomTooltip = ({
  active,
  payload,
  label,
  nameHexMap,
}: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const reversed = (
      payload[0].payload.tasks as { name: string; count: number }[]
    ).reduceRight<{ name: string; count: number }[]>(
      (prev, cur) => [...prev, cur],
      []
    );

    return (
      <div className="bg-white rounded-md p-4 shadow text-xs flex flex-col gap-1">
        <p className="font-medium">{label}</p>
        <ul>
          {reversed.map((value) => (
            <li key={value.name} className="flex gap-1 items-center">
              <div
                className="rounded-full w-2 h-2"
                style={{ backgroundColor: nameHexMap.get(value.name) }}
              />
              <span>{`${value.name}: ${value.count}`}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return null;
};

const CustomLegend = ({ payload }: LegendProps) => {
  if (payload == null) {
    return null;
  }

  return (
    <ul className="flex gap-2 justify-center">
      {payload.map((value) => (
        <li key={value.value} className="flex gap-1 items-center">
          <div
            className="rounded-full w-2 h-2"
            style={{ backgroundColor: value.color }}
          />
          <span className="text-xs">{value.value}</span>
        </li>
      ))}
    </ul>
  );
};

const CustomAxisTick = ({ x, y, payload }: any) => {
  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={8}
        textAnchor="end"
        fill="currentColor"
        transform="rotate(-35)"
        className="text-[10px]"
      >
        {payload.value}
      </text>
    </g>
  );
};

export default function Test() {
  const data: { userName: string; tasks: { name: string; count: number }[] }[] =
    [];

  for (let i = 0; i <= 50; i++) {
    data.push({
      userName: `chris kim ${i}`,
      tasks: [
        {
          name: "Wet Stamp",
          count: Math.floor(Math.random() * 100) + 100,
        },
        {
          name: "PV Design",
          count: Math.floor(Math.random() * 100) + 100,
        },
        {
          name: "Structural Calculation",
          count: Math.floor(Math.random() * 100) + 100,
        },
        {
          name: "Structural PE Stamp",
          count: Math.floor(Math.random() * 100) + 100,
        },
      ],
    });
  }

  const nameHexMap = new Map<string, string>();

  data[0].tasks.forEach((value) => {
    const hex = stringToHexCode(value.name);
    nameHexMap.set(value.name, `#${hex}`);
  });

  return (
    <ResponsiveContainer height={400}>
      <BarChart data={data}>
        <XAxis
          dataKey="userName"
          stroke="currentColor"
          fontSize={14}
          tick={<CustomAxisTick />}
          interval={0}
          height={100}
        />
        <YAxis stroke="currentColor" fontSize={14} />
        {data[0].tasks.map((value, index) => {
          return (
            <Bar
              key={value.name}
              name={value.name}
              dataKey={`tasks.${index}.count`}
              stackId={"stackId"}
              fill={nameHexMap.get(value.name)}
            />
          );
        })}
        <Tooltip
          cursor={<Rectangle fill="currentColor" fillOpacity={0.1} />}
          content={<CustomTooltip nameHexMap={nameHexMap} />}
        />
        <Legend iconType="circle" iconSize={8} content={<CustomLegend />} />
      </BarChart>
    </ResponsiveContainer>
  );
}
