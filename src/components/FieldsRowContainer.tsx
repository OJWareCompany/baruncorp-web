interface Props {
  children: React.ReactNode;
}

export default function FieldsRowContainer({ children }: Props) {
  return <div className="flex space-x-2 [&>*]:w-full">{children}</div>;
}
