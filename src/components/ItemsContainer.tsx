interface Props {
  children: React.ReactNode;
}

export default function ItemsContainer({ children }: Props) {
  return <div className="flex flex-col gap-2">{children}</div>;
}
