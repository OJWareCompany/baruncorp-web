import UserDetailPage from "@/components/user-detail-page/UserDetailPage";

interface Props {
  params: {
    userId: string;
  };
}

export default function Page({ params: { userId } }: Props) {
  return <UserDetailPage userId={userId} pageType="MY_ORGANIZATION" />;
}
