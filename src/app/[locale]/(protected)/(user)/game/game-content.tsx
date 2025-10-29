import { ComingSoon } from "@/components";

interface ContentProps {
  locale: string;
}

export default function GameContent({ locale }: ContentProps) {
  return (
    <>
      <ComingSoon
        title="Game Features"
        description="We're building amazing game features. Check back soon!"
      />
    </>
  );
}
