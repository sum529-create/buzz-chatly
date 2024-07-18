import { useState } from "react";
import { MainWrapper } from "../components/auth-component";
import PostBuzzForm from "../components/post-buzz-form";
import Timeline, { IBuzz } from "../components/timeline";

export default function Home() {
  const [selectedBuzz, setSelectedBuzz] = useState<IBuzz | null>(null);

  const handleEdit = (buzz: IBuzz) => {
    setSelectedBuzz(buzz);
  };
  return (
    <MainWrapper>
      {selectedBuzz ? <PostBuzzForm {...selectedBuzz} /> : <PostBuzzForm />}
      <Timeline onEdit={handleEdit} />
    </MainWrapper>
  );
}
